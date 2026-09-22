import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Types "../types/common";
import ListingsTypes "../types/listings";

module {
  /// Newest first: higher `createdAt` (then higher `id`) sorts earlier.
  func byNewest(a : Types.Listing, b : Types.Listing) : { #less; #equal; #greater } {
    if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) {
      #greater;
    } else if (a.id > b.id) { #less } else if (a.id < b.id) { #greater } else {
      #equal;
    };
  };

  /// Case-insensitive substring test.
  func containsIgnoreCase(haystack : Text, needle : Text) : Bool {
    haystack.toLower().contains(#text (needle.toLower()));
  };

  /// True when `listing` satisfies every supplied filter.
  func matches(listing : Types.Listing, filter : Types.ListingFilter) : Bool {
    switch (filter.listingType) {
      case (?t) { if (listing.listingType != t) { return false } };
      case null {};
    };
    switch (filter.propertyType) {
      case (?p) { if (listing.propertyType != p) { return false } };
      case null {};
    };
    switch (filter.minPrice) {
      case (?min) { if (listing.price < min) { return false } };
      case null {};
    };
    switch (filter.maxPrice) {
      case (?max) { if (listing.price > max) { return false } };
      case null {};
    };
    switch (filter.minBedrooms) {
      case (?min) { if (listing.bedrooms < min) { return false } };
      case null {};
    };
    switch (filter.location) {
      case (?loc) {
        let hit = containsIgnoreCase(listing.city, loc) or containsIgnoreCase(
          listing.region,
          loc,
        ) or containsIgnoreCase(listing.country, loc) or containsIgnoreCase(
          listing.postcode,
          loc,
        ) or containsIgnoreCase(listing.addressLine, loc);
        if (not hit) { return false };
      };
      case null {};
    };
    switch (filter.keyword) {
      case (?kw) {
        let hit = containsIgnoreCase(listing.title, kw) or containsIgnoreCase(
          listing.description,
          kw,
        ) or containsIgnoreCase(listing.city, kw) or containsIgnoreCase(
          listing.region,
          kw,
        ) or containsIgnoreCase(listing.country, kw) or containsIgnoreCase(
          listing.addressLine,
          kw,
        );
        if (not hit) { return false };
      };
      case null {};
    };
    true;
  };

  /// Returns every published listing, newest first.
  public func listPublished(
    listings : Map.Map<Types.ListingId, Types.Listing>,
  ) : [Types.Listing] {
    listings.values().toArray().filter(func l = l.published and not l.blocked).sort(
      byNewest
    );
  };

  /// Returns published listings matching the supplied filters, newest first.
  public func searchPublished(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    filter : Types.ListingFilter,
  ) : [Types.Listing] {
    listings.values().toArray().filter(
      func l = l.published and not l.blocked and matches(l, filter)
    ).sort(byNewest);
  };

  /// Returns a single published listing, or `null` when it does not exist, is
  /// not published, or is blocked.
  public func getPublished(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    id : Types.ListingId,
  ) : ?Types.Listing {
    switch (listings.get(id)) {
      case (?l) { if (l.published and not l.blocked) { ?l } else { null } };
      case null { null };
    };
  };

  /// Returns the featured published listings, newest first.
  public func listFeatured(
    listings : Map.Map<Types.ListingId, Types.Listing>,
  ) : [Types.Listing] {
    listings.values().toArray().filter(
      func l = l.published and not l.blocked and l.featured
    ).sort(byNewest);
  };

  /// Returns every listing owned by `owner`, newest first.
  public func listByOwner(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    owner : Types.CustomerId,
  ) : [Types.Listing] {
    listings.values().toArray().filter(
      func l = switch (l.owner) {
        case (?o) { o == owner };
        case null { false };
      }
    ).sort(byNewest);
  };

  /// Counts the listings owned by `owner`.
  public func countByOwner(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    owner : Types.CustomerId,
  ) : Nat {
    listings.values().toArray().filter(
      func l = switch (l.owner) {
        case (?o) { o == owner };
        case null { false };
      }
    ).size();
  };

  /// Returns every listing regardless of published state, newest first.
  public func listAll(
    listings : Map.Map<Types.ListingId, Types.Listing>,
  ) : [Types.Listing] {
    listings.values().toArray().sort(byNewest);
  };

  /// Returns a single listing regardless of published state.
  public func get(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    id : Types.ListingId,
  ) : ?Types.Listing {
    listings.get(id);
  };

  /// Creates a listing from `input`, assigning a fresh id and timestamps.
  /// The listing starts unpublished. `owner` is the creating customer, or
  /// `null` for an administrator-created listing.
  public func create(
    state : ListingsTypes.ListingsState,
    listings : Map.Map<Types.ListingId, Types.Listing>,
    owner : ?Types.CustomerId,
    input : Types.ListingInput,
  ) : Types.Listing {
    let id = state.nextListingId;
    state.nextListingId := id + 1;
    let now = Time.now();
    let listing : Types.Listing = {
      id;
      owner;
      title = input.title;
      description = input.description;
      listingType = input.listingType;
      propertyType = input.propertyType;
      price = input.price;
      currency = input.currency;
      addressLine = input.addressLine;
      city = input.city;
      region = input.region;
      postcode = input.postcode;
      country = input.country;
      bedrooms = input.bedrooms;
      bathrooms = input.bathrooms;
      area = input.area;
      photos = input.photos;
      published = false;
      featured = false;
      blocked = false;
      createdAt = now;
      updatedAt = now;
    };
    listings.add(id, listing);
    listing;
  };

  /// Applies the supplied fields to an existing listing and refreshes
  /// `updatedAt`. Returns `null` when the listing does not exist.
  public func update(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    id : Types.ListingId,
    patch : Types.ListingUpdate,
  ) : ?Types.Listing {
    switch (listings.get(id)) {
      case null { null };
      case (?current) {
        let updated : Types.Listing = {
          current with
          title = patch.title ?? current.title;
          description = patch.description ?? current.description;
          listingType = patch.listingType ?? current.listingType;
          propertyType = patch.propertyType ?? current.propertyType;
          price = patch.price ?? current.price;
          currency = patch.currency ?? current.currency;
          addressLine = patch.addressLine ?? current.addressLine;
          city = patch.city ?? current.city;
          region = patch.region ?? current.region;
          postcode = patch.postcode ?? current.postcode;
          country = patch.country ?? current.country;
          bedrooms = patch.bedrooms ?? current.bedrooms;
          bathrooms = patch.bathrooms ?? current.bathrooms;
          area = patch.area ?? current.area;
          photos = patch.photos ?? current.photos;
          updatedAt = Time.now();
        };
        listings.add(id, updated);
        ?updated;
      };
    };
  };

  /// Sets the published flag on a listing. Returns `null` when it does not exist.
  public func setPublished(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    id : Types.ListingId,
    published : Bool,
  ) : ?Types.Listing {
    switch (listings.get(id)) {
      case null { null };
      case (?current) {
        let updated : Types.Listing = {
          current with
          published;
          updatedAt = Time.now();
        };
        listings.add(id, updated);
        ?updated;
      };
    };
  };

  /// Sets the featured flag on a listing. Returns `null` when it does not exist.
  public func setFeatured(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    id : Types.ListingId,
    featured : Bool,
  ) : ?Types.Listing {
    switch (listings.get(id)) {
      case null { null };
      case (?current) {
        let updated : Types.Listing = {
          current with
          featured;
          updatedAt = Time.now();
        };
        listings.add(id, updated);
        ?updated;
      };
    };
  };

  /// Sets the blocked flag on a listing. Returns `null` when it does not exist.
  public func setBlocked(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    id : Types.ListingId,
    blocked : Bool,
  ) : ?Types.Listing {
    switch (listings.get(id)) {
      case null { null };
      case (?current) {
        let updated : Types.Listing = {
          current with
          blocked;
          updatedAt = Time.now();
        };
        listings.add(id, updated);
        ?updated;
      };
    };
  };

  /// Deletes a listing and all enquiries belonging to it. Returns `false` when
  /// the listing does not exist.
  public func remove(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>,
    id : Types.ListingId,
  ) : Bool {
    switch (listings.get(id)) {
      case null { false };
      case (?_) {
        listings.remove(id);
        let orphans = enquiries.values().toArray().filter(func e = e.listingId == id);
        for (orphan in orphans.values()) {
          enquiries.remove(orphan.id);
        };
        true;
      };
    };
  };

  /// Appends photos to a listing and refreshes `updatedAt`. Returns `null` when
  /// the listing does not exist.
  public func addPhotos(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    id : Types.ListingId,
    photos : [Types.Photo],
  ) : ?Types.Listing {
    switch (listings.get(id)) {
      case null { null };
      case (?current) {
        let updated : Types.Listing = {
          current with
          photos = current.photos.concat(photos);
          updatedAt = Time.now();
        };
        listings.add(id, updated);
        ?updated;
      };
    };
  };

  /// Removes the photo at `index` from a listing and refreshes `updatedAt`.
  /// Returns `null` when the listing does not exist.
  public func removePhoto(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    id : Types.ListingId,
    index : Nat,
  ) : ?Types.Listing {
    switch (listings.get(id)) {
      case null { null };
      case (?current) {
        let kept = current.photos.values().enumerate().filter(
          func((i, _)) = i != index
        ).map(func((_, p)) = p).toArray();
        let updated : Types.Listing = {
          current with
          photos = kept;
          updatedAt = Time.now();
        };
        listings.add(id, updated);
        ?updated;
      };
    };
  };

  /// Counts the enquiries belonging to a listing.
  public func countEnquiries(
    enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>,
    listingId : Types.ListingId,
  ) : Nat {
    enquiries.values().toArray().filter(func e = e.listingId == listingId).size();
  };

  /// Returns admin dashboard rows: every listing with its enquiry count,
  /// newest first.
  public func adminSummaries(
    listings : Map.Map<Types.ListingId, Types.Listing>,
    enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>,
  ) : [Types.AdminListingSummary] {
    listAll(listings).map(
      func l = { listing = l; enquiryCount = countEnquiries(enquiries, l.id) }
    );
  };
};
