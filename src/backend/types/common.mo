import Principal "mo:core/Principal";

module {
  /// Identifier for a property listing.
  public type ListingId = Nat;

  /// Identifier for an enquiry submitted against a listing.
  public type EnquiryId = Nat;

  /// Identifier for a customer account.
  public type CustomerId = Principal;

  /// Identifier for a subscription plan.
  public type PlanId = Nat;

  /// Identifier for a payment record.
  public type PaymentId = Nat;

  /// Identifier for a homepage banner.
  public type BannerId = Nat;

  /// Identifier for an advertising category.
  public type CategoryId = Nat;

  /// Identifier for a help chatbot entry.
  public type ChatbotEntryId = Nat;

  /// Nanoseconds since the Unix epoch (as returned by `Time.now()`).
  public type Timestamp = Int;

  /// Whether a listing is offered for sale or for rent.
  public type ListingType = {
    #sale;
    #rent;
  };

  /// The kind of property being listed.
  public type PropertyType = {
    #house;
    #apartment;
    #condo;
    #townhouse;
    #land;
    #commercial;
    #other;
  };

  /// A single photo attached to a listing. `blob` is the platform object-storage
  /// reference; `filename` is retained for display and file-type detection.
  public type Photo = {
    blob : Blob;
    filename : Text;
  };

  /// A property listing as stored and returned by the backend.
  ///
  /// `owner` is the customer principal that created the listing, or `null` for
  /// listings created by an administrator. `featured` promotes a listing on the
  /// public site; `blocked` hides it from the public site without deleting it.
  public type Listing = {
    id : ListingId;
    owner : ?CustomerId;
    title : Text;
    description : Text;
    listingType : ListingType;
    propertyType : PropertyType;
    price : Nat;
    currency : Text;
    addressLine : Text;
    city : Text;
    region : Text;
    postcode : Text;
    country : Text;
    bedrooms : Nat;
    bathrooms : Nat;
    area : Nat;
    photos : [Photo];
    published : Bool;
    featured : Bool;
    blocked : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// An enquiry submitted by a visitor against a specific listing.
  public type Enquiry = {
    id : EnquiryId;
    listingId : ListingId;
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
    read : Bool;
    createdAt : Timestamp;
  };

  /// A listing row for the admin dashboard: the listing plus its enquiry count.
  public type AdminListingSummary = {
    listing : Listing;
    enquiryCount : Nat;
  };

  /// An enquiry row for the admin inbox, carrying the related listing title.
  public type AdminEnquiry = {
    enquiry : Enquiry;
    listingTitle : Text;
  };

  /// Optional filters applied to the public listing search.
  public type ListingFilter = {
    keyword : ?Text;
    listingType : ?ListingType;
    propertyType : ?PropertyType;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    minBedrooms : ?Nat;
    location : ?Text;
  };

  /// Fields supplied when creating a listing. `id`, `owner`, `published`,
  /// `featured`, `blocked`, `createdAt` and `updatedAt` are assigned by the
  /// backend.
  public type ListingInput = {
    title : Text;
    description : Text;
    listingType : ListingType;
    propertyType : PropertyType;
    price : Nat;
    currency : Text;
    addressLine : Text;
    city : Text;
    region : Text;
    postcode : Text;
    country : Text;
    bedrooms : Nat;
    bathrooms : Nat;
    area : Nat;
    photos : [Photo];
  };

  /// Fields supplied when editing a listing. Every field is optional; only the
  /// supplied fields are changed.
  public type ListingUpdate = {
    title : ?Text;
    description : ?Text;
    listingType : ?ListingType;
    propertyType : ?PropertyType;
    price : ?Nat;
    currency : ?Text;
    addressLine : ?Text;
    city : ?Text;
    region : ?Text;
    postcode : ?Text;
    country : ?Text;
    bedrooms : ?Nat;
    bathrooms : ?Nat;
    area : ?Nat;
    photos : ?[Photo];
  };

  /// Fields supplied when submitting an enquiry.
  public type EnquiryInput = {
    listingId : ListingId;
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
  };

  /// Failure modes for listing management operations.
  public type ListingError = {
    #notAuthorized;
    #notFound : ListingId;
    #noActiveSubscription;
    #listingLimitReached : Nat;
    #imageLimitReached : Nat;
  };

  /// Failure modes for enquiry submission.
  public type EnquiryError = {
    #listingNotFound : ListingId;
    #listingNotPublished : ListingId;
  };

  /// Failure modes for enquiry management operations.
  public type EnquiryAdminError = {
    #notAuthorized;
    #notFound : EnquiryId;
  };
};
