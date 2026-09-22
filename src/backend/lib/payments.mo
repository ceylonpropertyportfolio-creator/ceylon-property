import Map "mo:core/Map";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Types "../types/common";
import CustomersTypes "../types/customers";

module {
  /// Nanoseconds in a 30-day billing month.
  let monthNanos : Int = 2_592_000_000_000_000;

  /// Orders two payments newest first, with id as a stable tie-break.
  func comparePayments(a : CustomersTypes.Payment, b : CustomersTypes.Payment) : { #less; #equal; #greater } {
    if (a.submittedAt > b.submittedAt) { #less }
    else if (a.submittedAt < b.submittedAt) { #greater }
    else if (a.id > b.id) { #less }
    else if (a.id < b.id) { #greater }
    else { #equal };
  };

  /// Returns the subscription with its status recomputed against `now`, so an
  /// elapsed end date is reported as `#expired`.
  func withStatus(sub : CustomersTypes.Subscription, now : Int) : CustomersTypes.Subscription {
    let status : CustomersTypes.SubscriptionStatus =
      if (sub.expiresAt > now) { #active } else { #expired };
    { sub with status };
  };

  /// Records a customer's payment reference against a plan. The payment starts
  /// `#pending`; it is never marked successful automatically.
  public func submit(
    state : CustomersTypes.CustomersState,
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
    payments : Map.Map<Types.PaymentId, CustomersTypes.Payment>,
    customer : Types.CustomerId,
    planId : Types.PlanId,
    reference : Text,
  ) : Result.Result<CustomersTypes.Payment, CustomersTypes.PaymentError> {
    switch (plans.get(planId)) {
      case null { #err(#planNotFound(planId)) };
      case (?plan) {
        let id = state.nextPaymentId;
        state.nextPaymentId := id + 1;
        let payment : CustomersTypes.Payment = {
          id;
          customer;
          planId;
          planName = plan.name;
          amount = plan.price;
          reference;
          status = #pending;
          submittedAt = Time.now();
          reviewedAt = null;
          periodStart = null;
          periodEnd = null;
        };
        payments.add(id, payment);
        #ok(payment);
      };
    };
  };

  /// Returns a customer's payments, newest first.
  public func listForCustomer(
    payments : Map.Map<Types.PaymentId, CustomersTypes.Payment>,
    customer : Types.CustomerId,
  ) : [CustomersTypes.Payment] {
    payments.values().toArray().filter(func p = p.customer == customer).sort(comparePayments);
  };

  /// Returns every payment with its customer's display details, newest first.
  /// Admin only.
  public func listAll(
    payments : Map.Map<Types.PaymentId, CustomersTypes.Payment>,
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
  ) : [CustomersTypes.AdminPayment] {
    payments.values().toArray().sort(comparePayments).map(
      func p = {
        payment = p;
        customerName = switch (customers.get(p.customer)) {
          case (?c) { c.name };
          case null { "" };
        };
        customerEmail = switch (customers.get(p.customer)) {
          case (?c) { c.email };
          case null { "" };
        };
      }
    );
  };

  /// Confirms a submitted payment and activates or renews the customer's
  /// subscription. Admin only.
  public func confirm(
    payments : Map.Map<Types.PaymentId, CustomersTypes.Payment>,
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
    subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
    id : Types.PaymentId,
  ) : Result.Result<CustomersTypes.Payment, CustomersTypes.PaymentError> {
    switch (payments.get(id)) {
      case null { #err(#paymentNotFound(id)) };
      case (?payment) {
        switch (plans.get(payment.planId)) {
          case null { #err(#planNotFound(payment.planId)) };
          case (?plan) {
            let now = Time.now();
            let periodStart = now;
            let periodEnd = now + monthNanos;
            let confirmed : CustomersTypes.Payment = {
              payment with
              status = #confirmed;
              reviewedAt = ?now;
              periodStart = ?periodStart;
              periodEnd = ?periodEnd;
            };
            payments.add(id, confirmed);
            let subscription : CustomersTypes.Subscription = {
              planId = plan.id;
              planName = plan.name;
              price = plan.price;
              billingPeriod = plan.billingPeriod;
              status = #active;
              startedAt = periodStart;
              expiresAt = periodEnd;
              renewedAt = switch (subscriptions.get(payment.customer)) {
                case (?existing) { ?existing.startedAt };
                case null { null };
              };
            };
            subscriptions.add(payment.customer, subscription);
            #ok(confirmed);
          };
        };
      };
    };
  };

  /// Rejects a submitted payment. Admin only.
  public func reject(
    payments : Map.Map<Types.PaymentId, CustomersTypes.Payment>,
    id : Types.PaymentId,
  ) : Result.Result<CustomersTypes.Payment, CustomersTypes.PaymentError> {
    switch (payments.get(id)) {
      case null { #err(#paymentNotFound(id)) };
      case (?payment) {
        let rejected : CustomersTypes.Payment = {
          payment with
          status = #rejected;
          reviewedAt = ?Time.now();
        };
        payments.add(id, rejected);
        #ok(rejected);
      };
    };
  };

  /// Returns the customer's subscription, marking it expired when its end date
  /// has passed.
  public func subscriptionFor(
    subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
    customer : Types.CustomerId,
  ) : ?CustomersTypes.Subscription {
    switch (subscriptions.get(customer)) {
      case null { null };
      case (?sub) { ?withStatus(sub, Time.now()) };
    };
  };

  /// True when the customer has a subscription that is active at `now`.
  public func hasActiveSubscription(
    subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
    customer : Types.CustomerId,
  ) : Bool {
    switch (subscriptions.get(customer)) {
      case null { false };
      case (?sub) { sub.expiresAt > Time.now() };
    };
  };

  /// Counts a customer's active listings and enforces the plan's listing
  /// allowance. Returns the allowance error when the limit is reached.
  public func checkListingAllowance(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
    customer : Types.CustomerId,
  ) : Result.Result<(), CustomersTypes.PaymentError> {
    switch (subscriptions.get(customer)) {
      case null { #err(#noActiveSubscription) };
      case (?sub) {
        if (sub.expiresAt <= Time.now()) {
          return #err(#noActiveSubscription);
        };
        switch (plans.get(sub.planId)) {
          case null { #err(#planNotFound(sub.planId)) };
          case (?plan) {
            switch (plan.listingAllowance) {
              case null { #ok(()) };
              case (?limit) {
                let count = listings.values().toArray().filter(
                  func l = l.owner == ?customer and l.published
                ).size();
                if (count >= limit) { #err(#listingLimitReached(limit)) } else { #ok(()) };
              };
            };
          };
        };
      };
    };
  };

  /// Enforces the plan's image allowance for a listing's photo count.
  public func checkImageAllowance(
    subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
    customer : Types.CustomerId,
    imageCount : Nat,
  ) : Result.Result<(), CustomersTypes.PaymentError> {
    switch (subscriptions.get(customer)) {
      case null { #err(#noActiveSubscription) };
      case (?sub) {
        if (sub.expiresAt <= Time.now()) {
          return #err(#noActiveSubscription);
        };
        switch (plans.get(sub.planId)) {
          case null { #err(#planNotFound(sub.planId)) };
          case (?plan) {
            switch (plan.imageAllowance) {
              case null { #ok(()) };
              case (?limit) {
                if (imageCount > limit) { #err(#imageLimitReached(limit)) } else { #ok(()) };
              };
            };
          };
        };
      };
    };
  };
};
