import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Types "../types/common";
import CustomersTypes "../types/customers";

module {
  /// Returns the customer account for `principal`, or `null` when unregistered.
  public func get(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    principal : Types.CustomerId,
  ) : ?CustomersTypes.Customer {
    customers.get(principal);
  };

  /// Registers a new customer account for `principal`. Fails when the caller is
  /// already registered.
  public func register(
    state : CustomersTypes.CustomersState,
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    principal : Types.CustomerId,
    input : CustomersTypes.CustomerProfileInput,
  ) : Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    ignore state;
    if (customers.get(principal) != null) {
      return #err(#alreadyRegistered);
    };
    let now = Time.now();
    let customer : CustomersTypes.Customer = {
      principal;
      email = input.email;
      name = input.name;
      phone = input.phone;
      whatsapp = input.whatsapp;
      company = input.company;
      address = input.address;
      emailVerification = #unverified;
      mobileVerification = #notSubmitted;
      blocked = false;
      createdAt = now;
      updatedAt = now;
    };
    customers.add(principal, customer);
    #ok(customer);
  };

  /// Updates the profile fields of a registered customer.
  public func updateProfile(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    principal : Types.CustomerId,
    input : CustomersTypes.CustomerProfileInput,
  ) : Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    switch (customers.get(principal)) {
      case null { #err(#notRegistered) };
      case (?existing) {
        let updated : CustomersTypes.Customer = {
          principal = existing.principal;
          email = input.email;
          name = input.name;
          phone = input.phone;
          whatsapp = input.whatsapp;
          company = input.company;
          address = input.address;
          emailVerification = existing.emailVerification;
          mobileVerification = existing.mobileVerification;
          blocked = existing.blocked;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        customers.add(principal, updated);
        #ok(updated);
      };
    };
  };

  /// Records a verification code request for the customer's typed-in email.
  /// The code is not delivered by any provider; the customer confirms with the
  /// code returned to the frontend flow.
  public func requestEmailCode(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    principal : Types.CustomerId,
    email : Text,
  ) : Result.Result<(), CustomersTypes.CustomerError> {
    switch (customers.get(principal)) {
      case null { #err(#notRegistered) };
      case (?existing) {
        let updated : CustomersTypes.Customer = {
          principal = existing.principal;
          email;
          name = existing.name;
          phone = existing.phone;
          whatsapp = existing.whatsapp;
          company = existing.company;
          address = existing.address;
          emailVerification = #pending;
          mobileVerification = existing.mobileVerification;
          blocked = existing.blocked;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        customers.add(principal, updated);
        #ok(());
      };
    };
  };

  /// Confirms the email verification code for the customer. The code is the
  /// customer's typed-in email address, so a matching value marks the address
  /// verified.
  public func confirmEmailCode(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    principal : Types.CustomerId,
    code : Text,
  ) : Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    switch (customers.get(principal)) {
      case null { #err(#notRegistered) };
      case (?existing) {
        if (existing.emailVerification != #pending or code != existing.email) {
          return #err(#invalidCode);
        };
        let updated : CustomersTypes.Customer = {
          principal = existing.principal;
          email = existing.email;
          name = existing.name;
          phone = existing.phone;
          whatsapp = existing.whatsapp;
          company = existing.company;
          address = existing.address;
          emailVerification = #verified;
          mobileVerification = existing.mobileVerification;
          blocked = existing.blocked;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        customers.add(principal, updated);
        #ok(updated);
      };
    };
  };

  /// Records a mobile number for admin review. No SMS provider is configured.
  public func submitMobile(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    principal : Types.CustomerId,
    phone : Text,
  ) : Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    switch (customers.get(principal)) {
      case null { #err(#notRegistered) };
      case (?existing) {
        let updated : CustomersTypes.Customer = {
          principal = existing.principal;
          email = existing.email;
          name = existing.name;
          phone;
          whatsapp = existing.whatsapp;
          company = existing.company;
          address = existing.address;
          emailVerification = existing.emailVerification;
          mobileVerification = #pendingReview;
          blocked = existing.blocked;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        customers.add(principal, updated);
        #ok(updated);
      };
    };
  };

  /// Returns the customer account with its current subscription summary.
  public func account(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
    principal : Types.CustomerId,
  ) : ?CustomersTypes.CustomerAccount {
    switch (customers.get(principal)) {
      case null { null };
      case (?customer) {
        ?{ customer; subscription = subscriptions.get(principal) };
      };
    };
  };

  /// Returns every customer account, newest first. Admin only.
  public func listAll(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
  ) : [CustomersTypes.CustomerAccount] {
    let accounts = customers.values().map(
      func(customer) { { customer; subscription = subscriptions.get(customer.principal) } }
    ).toArray();
    accounts.sort(func(a, b) = Int.compare(b.customer.createdAt, a.customer.createdAt));
  };

  /// Sets the blocked flag on a customer account. Admin only.
  public func setBlocked(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    principal : Types.CustomerId,
    blocked : Bool,
  ) : Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    switch (customers.get(principal)) {
      case null { #err(#notFound(principal)) };
      case (?existing) {
        let updated : CustomersTypes.Customer = {
          principal = existing.principal;
          email = existing.email;
          name = existing.name;
          phone = existing.phone;
          whatsapp = existing.whatsapp;
          company = existing.company;
          address = existing.address;
          emailVerification = existing.emailVerification;
          mobileVerification = existing.mobileVerification;
          blocked;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        customers.add(principal, updated);
        #ok(updated);
      };
    };
  };

  /// Sets the mobile verification review state. Admin only.
  public func setMobileVerification(
    customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
    principal : Types.CustomerId,
    state : CustomersTypes.MobileVerification,
  ) : Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    switch (customers.get(principal)) {
      case null { #err(#notFound(principal)) };
      case (?existing) {
        let updated : CustomersTypes.Customer = {
          principal = existing.principal;
          email = existing.email;
          name = existing.name;
          phone = existing.phone;
          whatsapp = existing.whatsapp;
          company = existing.company;
          address = existing.address;
          emailVerification = existing.emailVerification;
          mobileVerification = state;
          blocked = existing.blocked;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        customers.add(principal, updated);
        #ok(updated);
      };
    };
  };
};
