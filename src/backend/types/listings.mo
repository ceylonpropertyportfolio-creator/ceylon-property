module {
  /// Domain state for listings, photos and enquiries.
  ///
  /// `listings` and `enquiries` are keyed by their numeric ids; `nextListingId`
  /// and `nextEnquiryId` are the monotonic id counters. The `var` fields are
  /// held in a record so the same binding can be shared by reference with the
  /// listings and enquiries mixins.
  public type ListingsState = {
    var nextListingId : Nat;
    var nextEnquiryId : Nat;
  };
};
