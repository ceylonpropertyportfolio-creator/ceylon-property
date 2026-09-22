import Map "mo:core/Map";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/common";
import CustomersTypes "../types/customers";
import PlansLib "../lib/plans";
import PaymentsLib "../lib/payments";

mixin (
  accessControlState : AccessControl.AccessControlState,
  state : CustomersTypes.CustomersState,
  plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
  payments : Map.Map<Types.PaymentId, CustomersTypes.Payment>,
  subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
  customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
) {
  /// True only for a registered caller holding the administrator role. Reads the
  /// role map directly so an anonymous or unregistered caller is simply
  /// non-admin rather than trapping.
  func plansCallerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  // --- Public: plans ------------------------------------------------------

  /// Returns every active plan ordered by `sortOrder`.
  public query func listPlans() : async [CustomersTypes.Plan] {
    PlansLib.listActive(plans);
  };

  /// Returns a single plan, or `null` when it does not exist.
  public query func getPlan(id : Types.PlanId) : async ?CustomersTypes.Plan {
    PlansLib.get(plans, id);
  };

  // --- Customer: payments and subscription --------------------------------

  /// Submits a payment reference for a plan. The payment stays pending until an
  /// admin confirms it.
  public shared ({ caller }) func submitPayment(
    planId : Types.PlanId,
    reference : Text,
  ) : async Result.Result<CustomersTypes.Payment, CustomersTypes.PaymentError> {
    if (caller.isAnonymous()) { return #err(#notAuthorized) };
    switch (customers.get(caller)) {
      case null { #err(#notRegistered) };
      case (?_) { PaymentsLib.submit(state, plans, payments, caller, planId, reference) };
    };
  };

  /// Returns the calling customer's payment history, newest first.
  public query ({ caller }) func getMyPayments() : async [CustomersTypes.Payment] {
    if (caller.isAnonymous()) { return [] };
    PaymentsLib.listForCustomer(payments, caller);
  };

  /// Returns the calling customer's subscription, or `null` when none exists.
  public query ({ caller }) func getMySubscription() : async ?CustomersTypes.Subscription {
    if (caller.isAnonymous()) { return null };
    PaymentsLib.subscriptionFor(subscriptions, caller);
  };

  // --- Admin: plans -------------------------------------------------------

  /// Returns every plan, active or not. Admin only.
  public query ({ caller }) func adminListPlans() : async [CustomersTypes.Plan] {
    if (not plansCallerIsAdmin(caller)) { return [] };
    PlansLib.listAll(plans);
  };

  /// Creates a plan. Admin only.
  public shared ({ caller }) func adminCreatePlan(
    input : CustomersTypes.PlanInput,
  ) : async Result.Result<CustomersTypes.Plan, CustomersTypes.PaymentError> {
    if (not plansCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    #ok(PlansLib.create(state, plans, input));
  };

  /// Applies a full edit to a plan. Admin only.
  public shared ({ caller }) func adminUpdatePlan(
    id : Types.PlanId,
    input : CustomersTypes.PlanInput,
  ) : async Result.Result<CustomersTypes.Plan, CustomersTypes.PaymentError> {
    if (not plansCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    PlansLib.update(plans, id, input);
  };

  /// Deletes a plan. Admin only.
  public shared ({ caller }) func adminDeletePlan(
    id : Types.PlanId,
  ) : async Result.Result<(), CustomersTypes.PaymentError> {
    if (not plansCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    PlansLib.remove(plans, id);
  };

  // --- Admin: payments and subscriptions ----------------------------------

  /// Returns every payment with its customer's details. Admin only.
  public query ({ caller }) func adminListPayments() : async [CustomersTypes.AdminPayment] {
    if (not plansCallerIsAdmin(caller)) { return [] };
    PaymentsLib.listAll(payments, customers);
  };

  /// Confirms a submitted payment and activates or renews the subscription.
  /// Admin only.
  public shared ({ caller }) func adminConfirmPayment(
    id : Types.PaymentId,
  ) : async Result.Result<CustomersTypes.Payment, CustomersTypes.PaymentError> {
    if (not plansCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    PaymentsLib.confirm(payments, plans, subscriptions, id);
  };

  /// Rejects a submitted payment. Admin only.
  public shared ({ caller }) func adminRejectPayment(
    id : Types.PaymentId,
  ) : async Result.Result<CustomersTypes.Payment, CustomersTypes.PaymentError> {
    if (not plansCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    PaymentsLib.reject(payments, id);
  };

  /// Returns a customer's subscription. Admin only.
  public query ({ caller }) func adminGetSubscription(
    customer : Types.CustomerId,
  ) : async ?CustomersTypes.Subscription {
    if (not plansCallerIsAdmin(caller)) { return null };
    PaymentsLib.subscriptionFor(subscriptions, customer);
  };
};
