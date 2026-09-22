import Map "mo:core/Map";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Types "../types/common";
import ListingsTypes "../types/listings";

module {
  /// Newest first: higher `createdAt` (then higher `id`) sorts earlier.
  func byNewest(a : Types.Enquiry, b : Types.Enquiry) : { #less; #equal; #greater } {
    if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) {
      #greater;
    } else if (a.id > b.id) { #less } else if (a.id < b.id) { #greater } else {
      #equal;
    };
  };

  /// Records an enquiry against a published listing. Returns the stored enquiry,
  /// or an error when the listing is missing or unpublished.
  public func submit(
    state : ListingsTypes.ListingsState,
    listings : Map.Map<Types.ListingId, Types.Listing>,
    enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>,
    input : Types.EnquiryInput,
  ) : Result.Result<Types.Enquiry, Types.EnquiryError> {
    switch (listings.get(input.listingId)) {
      case null { #err(#listingNotFound(input.listingId)) };
      case (?listing) {
        if (not listing.published) {
          return #err(#listingNotPublished(input.listingId));
        };
        let id = state.nextEnquiryId;
        state.nextEnquiryId := id + 1;
        let enquiry : Types.Enquiry = {
          id;
          listingId = input.listingId;
          name = input.name;
          email = input.email;
          phone = input.phone;
          message = input.message;
          read = false;
          createdAt = Time.now();
        };
        enquiries.add(id, enquiry);
        #ok(enquiry);
      };
    };
  };

  /// Returns every enquiry, newest first, each paired with its listing title.
  public func listAll(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>,
  ) : [Types.AdminEnquiry] {
    enquiries.values().toArray().sort(byNewest).map(
      func e = {
        enquiry = e;
        listingTitle = switch (listings.get(e.listingId)) {
          case (?l) { l.title };
          case null { "" };
        };
      }
    );
  };

  /// Sets the read flag on an enquiry. Returns `null` when it does not exist.
  public func setRead(
    enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>,
    id : Types.EnquiryId,
    read : Bool,
  ) : ?Types.Enquiry {
    switch (enquiries.get(id)) {
      case null { null };
      case (?current) {
        let updated : Types.Enquiry = { current with read };
        enquiries.add(id, updated);
        ?updated;
      };
    };
  };

  /// Deletes an enquiry. Returns `false` when it does not exist.
  public func remove(
    enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>,
    id : Types.EnquiryId,
  ) : Bool {
    switch (enquiries.get(id)) {
      case null { false };
      case (?_) {
        enquiries.remove(id);
        true;
      };
    };
  };
};
