import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    listingsState : {
      var nextListingId : Nat;
      var nextEnquiryId : Nat;
    };
    listings : Map.Map<Nat, {
      id : Nat;
      title : Text;
      description : Text;
      listingType : { #sale; #rent };
      propertyType : {
        #house;
        #apartment;
        #condo;
        #townhouse;
        #land;
        #commercial;
        #other;
      };
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
      photos : [{ blob : Blob; filename : Text }];
      published : Bool;
      createdAt : Int;
      updatedAt : Int;
    }>;
    enquiries : Map.Map<Nat, {
      id : Nat;
      listingId : Nat;
      name : Text;
      email : Text;
      phone : Text;
      message : Text;
      read : Bool;
      createdAt : Int;
    }>;
  };

  public func migration(old : OldActor) : NewActor {
    ignore old;
    {
      accessControlState = AccessControl.initState();
      listingsState = { var nextListingId = 0; var nextEnquiryId = 0 };
      listings = Map.empty();
      enquiries = Map.empty();
    };
  };
};
