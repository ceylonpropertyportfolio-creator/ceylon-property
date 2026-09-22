import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/common";
import CustomersTypes "../types/customers";
import CustomersLib "../lib/customers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  state : CustomersTypes.CustomersState,
  customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
  subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
) {
  /// True only for a registered caller holding the administrator role.
  /// `AccessControl.isAdmin` traps for anonymous/unregistered callers, so the
  /// role map is read directly and null/anonymous is treated as non-admin.
  func customersCallerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    switch (accessControlState.userRoles.get(caller)) {
      case null { false };
      case (?role) { role == #admin };
    };
  };

  // --- Customer account ---------------------------------------------------

  /// Registers the calling principal as a customer.
  public shared ({ caller }) func registerCustomer(
    input : CustomersTypes.CustomerProfileInput,
  ) : async Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    if (caller.isAnonymous()) {
      return #err(#notAuthorized);
    };
    CustomersLib.register(state, customers, caller, input);
  };

  /// Returns the calling customer's account with its subscription summary.
  public query ({ caller }) func getMyAccount() : async ?CustomersTypes.CustomerAccount {
    CustomersLib.account(customers, subscriptions, caller);
  };

  /// Updates the calling customer's profile.
  public shared ({ caller }) func updateMyProfile(
    input : CustomersTypes.CustomerProfileInput,
  ) : async Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    if (caller.isAnonymous()) {
      return #err(#notAuthorized);
    };
    CustomersLib.updateProfile(customers, caller, input);
  };

  /// Requests an email verification code for the supplied address.
  public shared ({ caller }) func requestEmailVerification(
    email : Text,
  ) : async Result.Result<(), CustomersTypes.CustomerError> {
    if (caller.isAnonymous()) {
      return #err(#notAuthorized);
    };
    CustomersLib.requestEmailCode(customers, caller, email);
  };

  /// Confirms the email verification code.
  public shared ({ caller }) func confirmEmailVerification(
    code : Text,
  ) : async Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    if (caller.isAnonymous()) {
      return #err(#notAuthorized);
    };
    CustomersLib.confirmEmailCode(customers, caller, code);
  };

  /// Records a mobile number for admin review. No SMS provider is configured.
  public shared ({ caller }) func submitMobileNumber(
    phone : Text,
  ) : async Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    if (caller.isAnonymous()) {
      return #err(#notAuthorized);
    };
    CustomersLib.submitMobile(customers, caller, phone);
  };

  // --- Admin: customers ---------------------------------------------------

  /// Returns every customer account. Admin only.
  public query ({ caller }) func adminListCustomers() : async [CustomersTypes.CustomerAccount] {
    if (not customersCallerIsAdmin(caller)) {
      return [];
    };
    CustomersLib.listAll(customers, subscriptions);
  };

  /// Blocks or unblocks a customer account. Admin only.
  public shared ({ caller }) func adminSetCustomerBlocked(
    customer : Types.CustomerId,
    blocked : Bool,
  ) : async Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    if (not customersCallerIsAdmin(caller)) {
      return #err(#notAuthorized);
    };
    CustomersLib.setBlocked(customers, customer, blocked);
  };

  /// Approves or rejects a customer's submitted mobile number. Admin only.
  public shared ({ caller }) func adminSetMobileVerification(
    customer : Types.CustomerId,
    state : CustomersTypes.MobileVerification,
  ) : async Result.Result<CustomersTypes.Customer, CustomersTypes.CustomerError> {
    if (not customersCallerIsAdmin(caller)) {
      return #err(#notAuthorized);
    };
    CustomersLib.setMobileVerification(customers, customer, state);
  };
};
