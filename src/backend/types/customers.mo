import Common "common";

module {
  /// Verification state of a customer's typed-in email address.
  public type EmailVerification = {
    #unverified;
    #pending;
    #verified;
  };

  /// Review state of a customer's mobile number. No SMS provider is configured,
  /// so a submitted number is recorded and shown to an admin for review.
  public type MobileVerification = {
    #notSubmitted;
    #pendingReview;
    #approved;
    #rejected;
  };

  /// A customer account. Customers authenticate separately from administrators.
  public type Customer = {
    principal : Common.CustomerId;
    email : Text;
    name : Text;
    phone : Text;
    whatsapp : Text;
    company : Text;
    address : Text;
    emailVerification : EmailVerification;
    mobileVerification : MobileVerification;
    blocked : Bool;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  /// Fields a customer may set when registering or updating their profile.
  public type CustomerProfileInput = {
    email : Text;
    name : Text;
    phone : Text;
    whatsapp : Text;
    company : Text;
    address : Text;
  };

  /// A customer account plus its current subscription summary, for the account
  /// panel and the admin customer list.
  public type CustomerAccount = {
    customer : Customer;
    subscription : ?Subscription;
  };

  /// Lifecycle state of a subscription.
  public type SubscriptionStatus = {
    #active;
    #expired;
  };

  /// A customer's subscription to a plan.
  public type Subscription = {
    planId : Common.PlanId;
    planName : Text;
    price : Nat;
    billingPeriod : Text;
    status : SubscriptionStatus;
    startedAt : Common.Timestamp;
    expiresAt : Common.Timestamp;
    renewedAt : ?Common.Timestamp;
  };

  /// A subscription plan offered to customers.
  public type Plan = {
    id : Common.PlanId;
    name : Text;
    price : Nat;
    billingPeriod : Text;
    listingAllowance : ?Nat;
    imageAllowance : ?Nat;
    features : [Text];
    active : Bool;
    sortOrder : Nat;
  };

  /// Fields supplied when an admin creates or edits a plan.
  public type PlanInput = {
    name : Text;
    price : Nat;
    billingPeriod : Text;
    listingAllowance : ?Nat;
    imageAllowance : ?Nat;
    features : [Text];
    active : Bool;
    sortOrder : Nat;
  };

  /// Payment review state. Payments are confirmed manually by an admin; no
  /// payment is ever marked successful automatically.
  public type PaymentStatus = {
    #pending;
    #confirmed;
    #rejected;
  };

  /// A payment submitted by a customer against a plan.
  public type Payment = {
    id : Common.PaymentId;
    customer : Common.CustomerId;
    planId : Common.PlanId;
    planName : Text;
    amount : Nat;
    reference : Text;
    status : PaymentStatus;
    submittedAt : Common.Timestamp;
    reviewedAt : ?Common.Timestamp;
    periodStart : ?Common.Timestamp;
    periodEnd : ?Common.Timestamp;
  };

  /// A payment row for the admin console, carrying the customer's display name.
  public type AdminPayment = {
    payment : Payment;
    customerName : Text;
    customerEmail : Text;
  };

  /// Failure modes for customer account operations.
  public type CustomerError = {
    #notAuthorized;
    #notRegistered;
    #alreadyRegistered;
    #invalidCode;
    #notFound : Common.CustomerId;
  };

  /// Failure modes for plan and payment operations.
  public type PaymentError = {
    #notAuthorized;
    #notRegistered;
    #planNotFound : Common.PlanId;
    #paymentNotFound : Common.PaymentId;
    #noActiveSubscription;
    #listingLimitReached : Nat;
    #imageLimitReached : Nat;
  };

  /// Domain state for customers, plans, payments and subscriptions.
  public type CustomersState = {
    var nextPlanId : Nat;
    var nextPaymentId : Nat;
  };
};
