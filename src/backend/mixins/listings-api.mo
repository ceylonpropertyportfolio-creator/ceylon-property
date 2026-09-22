import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/common";
import ListingsTypes "../types/listings";
import CustomersTypes "../types/customers";
import ListingsLib "../lib/listings";
import EnquiriesLib "../lib/enquiries";
import PaymentsLib "../lib/payments";

mixin (
  accessControlState : AccessControl.AccessControlState,
  state : ListingsTypes.ListingsState,
  listings : Map.Map<Types.ListingId, Types.Listing>,
  enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>,
  customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>,
  subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>,
  plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
) {
  /// True only for a registered caller holding the administrator role.
  /// Anonymous and unregistered callers are never administrators.
  func listingsCallerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?role) { role == #admin };
      case null { false };
    };
  };

  /// True when `caller` is a registered customer account.
  func callerIsCustomer(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (customers.get(caller)) {
      case (?_) { true };
      case null { false };
    };
  };

  // --- Public reads -------------------------------------------------------

  /// Returns every published listing, newest first.
  public query func listPublishedListings() : async [Types.Listing] {
    ListingsLib.listPublished(listings);
  };

  /// Returns published listings matching the supplied filters, newest first.
  public query func searchListings(filter : Types.ListingFilter) : async [Types.Listing] {
    ListingsLib.searchPublished(listings, filter);
  };

  /// Returns a single published listing, or `null` when it does not exist or is
  /// not published.
  public query func getListing(id : Types.ListingId) : async ?Types.Listing {
    ListingsLib.getPublished(listings, id);
  };

  /// Returns the featured published listings, newest first.
  public query func listFeaturedListings() : async [Types.Listing] {
    ListingsLib.listFeatured(listings);
  };

  // --- Public writes ------------------------------------------------------

  /// Submits an enquiry against a published listing.
  public shared ({ caller }) func submitEnquiry(
    input : Types.EnquiryInput,
  ) : async Result.Result<Types.Enquiry, Types.EnquiryError> {
    ignore caller;
    EnquiriesLib.submit(state, listings, enquiries, input);
  };

  // --- Customer: own listings ---------------------------------------------

  /// Returns the calling customer's own listings, newest first.
  public query ({ caller }) func getMyListings() : async [Types.Listing] {
    if (not callerIsCustomer(caller)) { return [] };
    ListingsLib.listByOwner(listings, caller);
  };

  /// Returns one of the calling customer's own listings, or `null`.
  public query ({ caller }) func getMyListing(id : Types.ListingId) : async ?Types.Listing {
    if (not callerIsCustomer(caller)) { return null };
    switch (ListingsLib.get(listings, id)) {
      case (?l) {
        switch (l.owner) {
          case (?o) { if (o == caller) { ?l } else { null } };
          case null { null };
        };
      };
      case null { null };
    };
  };

  /// True when `caller` owns the listing identified by `id`.
  func callerOwnsListing(caller : Principal, id : Types.ListingId) : Bool {
    switch (ListingsLib.get(listings, id)) {
      case (?l) {
        switch (l.owner) {
          case (?o) { o == caller };
          case null { false };
        };
      };
      case null { false };
    };
  };

  /// Maps a payment-allowance failure onto the listing error surface.
  func allowanceError(
    result : Result.Result<(), CustomersTypes.PaymentError>,
  ) : ?Types.ListingError {
    switch (result) {
      case (#ok(())) { null };
      case (#err(e)) {
        switch (e) {
          case (#noActiveSubscription) { ?#noActiveSubscription };
          case (#listingLimitReached(limit)) { ?#listingLimitReached(limit) };
          case (#imageLimitReached(limit)) { ?#imageLimitReached(limit) };
          case (_) { ?#notAuthorized };
        };
      };
    };
  };

  /// Creates a listing owned by the calling customer. Requires an active
  /// subscription and enforces the plan's listing and image allowances.
  public shared ({ caller }) func createMyListing(
    input : Types.ListingInput,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not callerIsCustomer(caller)) { return #err(#notAuthorized) };
    switch (allowanceError(PaymentsLib.checkListingAllowance(listings, subscriptions, plans, caller))) {
      case (?e) { return #err(e) };
      case null {};
    };
    switch (allowanceError(PaymentsLib.checkImageAllowance(subscriptions, plans, caller, input.photos.size()))) {
      case (?e) { return #err(e) };
      case null {};
    };
    #ok(ListingsLib.create(state, listings, ?caller, input));
  };

  /// Applies a partial update to one of the calling customer's own listings.
  public shared ({ caller }) func updateMyListing(
    id : Types.ListingId,
    patch : Types.ListingUpdate,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not callerIsCustomer(caller)) { return #err(#notAuthorized) };
    if (not callerOwnsListing(caller, id)) { return #err(#notFound(id)) };
    switch (patch.photos) {
      case (?photos) {
        switch (allowanceError(PaymentsLib.checkImageAllowance(subscriptions, plans, caller, photos.size()))) {
          case (?e) { return #err(e) };
          case null {};
        };
      };
      case null {};
    };
    switch (ListingsLib.update(listings, id, patch)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  /// Deletes one of the calling customer's own listings.
  public shared ({ caller }) func deleteMyListing(
    id : Types.ListingId,
  ) : async Result.Result<(), Types.ListingError> {
    if (not callerIsCustomer(caller)) { return #err(#notAuthorized) };
    if (not callerOwnsListing(caller, id)) { return #err(#notFound(id)) };
    if (ListingsLib.remove(listings, enquiries, id)) {
      #ok(());
    } else {
      #err(#notFound(id));
    };
  };

  /// Appends photos to one of the calling customer's own listings, enforcing
  /// the plan's image allowance.
  public shared ({ caller }) func addMyListingPhotos(
    id : Types.ListingId,
    photos : [Types.Photo],
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not callerIsCustomer(caller)) { return #err(#notAuthorized) };
    if (not callerOwnsListing(caller, id)) { return #err(#notFound(id)) };
    let existing = switch (ListingsLib.get(listings, id)) {
      case (?l) { l.photos.size() };
      case null { 0 };
    };
    switch (allowanceError(PaymentsLib.checkImageAllowance(subscriptions, plans, caller, existing + photos.size()))) {
      case (?e) { return #err(e) };
      case null {};
    };
    switch (ListingsLib.addPhotos(listings, id, photos)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  /// Removes the photo at `index` from one of the calling customer's own
  /// listings.
  public shared ({ caller }) func removeMyListingPhoto(
    id : Types.ListingId,
    index : Nat,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not callerIsCustomer(caller)) { return #err(#notAuthorized) };
    if (not callerOwnsListing(caller, id)) { return #err(#notFound(id)) };
    switch (ListingsLib.removePhoto(listings, id, index)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  // --- Admin: listings ----------------------------------------------------

  /// Returns every listing with its enquiry count, newest first. Admin only.
  public query ({ caller }) func adminListListings() : async [Types.AdminListingSummary] {
    if (not listingsCallerIsAdmin(caller)) { return [] };
    ListingsLib.adminSummaries(listings, enquiries);
  };

  /// Returns a single listing regardless of published state. Admin only.
  public query ({ caller }) func adminGetListing(id : Types.ListingId) : async ?Types.Listing {
    if (not listingsCallerIsAdmin(caller)) { return null };
    ListingsLib.get(listings, id);
  };

  /// Creates a listing. Admin only.
  public shared ({ caller }) func adminCreateListing(
    input : Types.ListingInput,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    #ok(ListingsLib.create(state, listings, null, input));
  };

  /// Applies a partial update to a listing. Admin only.
  public shared ({ caller }) func adminUpdateListing(
    id : Types.ListingId,
    patch : Types.ListingUpdate,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    switch (ListingsLib.update(listings, id, patch)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  /// Publishes or unpublishes a listing. Admin only.
  public shared ({ caller }) func adminSetListingPublished(
    id : Types.ListingId,
    published : Bool,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    switch (ListingsLib.setPublished(listings, id, published)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  /// Features or unfeatures a listing. Admin only.
  public shared ({ caller }) func adminSetListingFeatured(
    id : Types.ListingId,
    featured : Bool,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    switch (ListingsLib.setFeatured(listings, id, featured)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  /// Blocks or unblocks a listing. Admin only.
  public shared ({ caller }) func adminSetListingBlocked(
    id : Types.ListingId,
    blocked : Bool,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    switch (ListingsLib.setBlocked(listings, id, blocked)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  /// Deletes a listing and its enquiries. Admin only.
  public shared ({ caller }) func adminDeleteListing(
    id : Types.ListingId,
  ) : async Result.Result<(), Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    if (ListingsLib.remove(listings, enquiries, id)) {
      #ok(());
    } else {
      #err(#notFound(id));
    };
  };

  /// Appends uploaded photos to a listing. Admin only.
  public shared ({ caller }) func adminAddListingPhotos(
    id : Types.ListingId,
    photos : [Types.Photo],
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    switch (ListingsLib.addPhotos(listings, id, photos)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  /// Removes the photo at `index` from a listing. Admin only.
  public shared ({ caller }) func adminRemoveListingPhoto(
    id : Types.ListingId,
    index : Nat,
  ) : async Result.Result<Types.Listing, Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    switch (ListingsLib.removePhoto(listings, id, index)) {
      case (?listing) { #ok(listing) };
      case null { #err(#notFound(id)) };
    };
  };

  // --- Admin: enquiries ---------------------------------------------------

  /// Returns every enquiry, newest first, each with its listing title. Admin only.
  public query ({ caller }) func adminListEnquiries() : async [Types.AdminEnquiry] {
    if (not listingsCallerIsAdmin(caller)) { return [] };
    EnquiriesLib.listAll(listings, enquiries);
  };

  /// Sets the read flag on an enquiry. Admin only.
  public shared ({ caller }) func adminSetEnquiryRead(
    id : Types.EnquiryId,
    read : Bool,
  ) : async Result.Result<Types.Enquiry, Types.EnquiryAdminError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    switch (EnquiriesLib.setRead(enquiries, id, read)) {
      case (?enquiry) { #ok(enquiry) };
      case null { #err(#notFound(id)) };
    };
  };

  /// Deletes an enquiry. Admin only.
  public shared ({ caller }) func adminDeleteEnquiry(
    id : Types.EnquiryId,
  ) : async Result.Result<(), Types.ListingError> {
    if (not listingsCallerIsAdmin(caller)) { return #err(#notAuthorized) };
    if (EnquiriesLib.remove(enquiries, id)) {
      #ok(());
    } else {
      #err(#notFound(id));
    };
  };
};
