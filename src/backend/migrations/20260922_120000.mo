import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type OldListing = {
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
  };

  type NewListing = {
    id : Nat;
    owner : ?Principal;
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
    featured : Bool;
    blocked : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    listingsState : {
      var nextListingId : Nat;
      var nextEnquiryId : Nat;
    };
    listings : Map.Map<Nat, OldListing>;
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

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    listingsState : {
      var nextListingId : Nat;
      var nextEnquiryId : Nat;
    };
    customersState : {
      var nextPlanId : Nat;
      var nextPaymentId : Nat;
    };
    contentState : {
      var nextBannerId : Nat;
      var nextCategoryId : Nat;
      var nextChatbotEntryId : Nat;
    };
    listings : Map.Map<Nat, NewListing>;
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
    customers : Map.Map<Principal, {
      principal : Principal;
      email : Text;
      name : Text;
      phone : Text;
      whatsapp : Text;
      company : Text;
      address : Text;
      emailVerification : { #unverified; #pending; #verified };
      mobileVerification : {
        #notSubmitted;
        #pendingReview;
        #approved;
        #rejected;
      };
      blocked : Bool;
      createdAt : Int;
      updatedAt : Int;
    }>;
    plans : Map.Map<Nat, {
      id : Nat;
      name : Text;
      price : Nat;
      billingPeriod : Text;
      listingAllowance : ?Nat;
      imageAllowance : ?Nat;
      features : [Text];
      active : Bool;
      sortOrder : Nat;
    }>;
    payments : Map.Map<Nat, {
      id : Nat;
      customer : Principal;
      planId : Nat;
      planName : Text;
      amount : Nat;
      reference : Text;
      status : { #pending; #confirmed; #rejected };
      submittedAt : Int;
      reviewedAt : ?Int;
      periodStart : ?Int;
      periodEnd : ?Int;
    }>;
    subscriptions : Map.Map<Principal, {
      planId : Nat;
      planName : Text;
      price : Nat;
      billingPeriod : Text;
      status : { #active; #expired };
      startedAt : Int;
      expiresAt : Int;
      renewedAt : ?Int;
    }>;
    banners : Map.Map<Nat, {
      id : Nat;
      title : Text;
      subtitle : Text;
      image : ?{ blob : Blob; filename : Text };
      linkUrl : Text;
      enabled : Bool;
      sortOrder : Nat;
      createdAt : Int;
      updatedAt : Int;
    }>;
    categories : Map.Map<Nat, {
      id : Nat;
      name : Text;
      slug : Text;
      description : Text;
      enabled : Bool;
      sortOrder : Nat;
    }>;
    chatbotEntries : Map.Map<Nat, {
      id : Nat;
      question : Text;
      answer : Text;
      keywords : [Text];
      enabled : Bool;
      sortOrder : Nat;
      updatedAt : Int;
    }>;
  };

  /// The four monthly plans offered to customers, seeded on first load so the
  /// Plans page and home plans summary render immediately.
  let seedPlans : [{
    id : Nat;
    name : Text;
    price : Nat;
    billingPeriod : Text;
    listingAllowance : ?Nat;
    imageAllowance : ?Nat;
    features : [Text];
    active : Bool;
    sortOrder : Nat;
  }] = [
    {
      id = 0;
      name = "Individual";
      price = 1990;
      billingPeriod = "Monthly";
      listingAllowance = ?3;
      imageAllowance = ?5;
      features = [
        "Up to 3 active listings",
        "Maximum 5 images per listing",
        "Edit and manage your listings",
        "Standard listing visibility"
      ];
      active = true;
      sortOrder = 1;
    },
    {
      id = 1;
      name = "Agent";
      price = 3990;
      billingPeriod = "Monthly";
      listingAllowance = ?15;
      imageAllowance = ?15;
      features = [
        "Up to 15 active listings",
        "Maximum 15 images per listing",
        "Edit and manage your listings",
        "Priority listing visibility"
      ];
      active = true;
      sortOrder = 2;
    },
    {
      id = 2;
      name = "Business";
      price = 5990;
      billingPeriod = "Monthly";
      listingAllowance = ?50;
      imageAllowance = ?35;
      features = [
        "Up to 50 active listings",
        "Maximum 35 images per listing",
        "Edit and manage your listings",
        "Priority listing visibility"
      ];
      active = true;
      sortOrder = 3;
    },
    {
      id = 3;
      name = "Professional";
      price = 9990;
      billingPeriod = "Monthly";
      listingAllowance = null;
      imageAllowance = null;
      features = [
        "Unlimited active listings",
        "Unlimited images per listing",
        "Edit and manage your listings",
        "Top listing visibility"
      ];
      active = true;
      sortOrder = 4;
    },
  ];

  /// The six advertising categories shown on the public site.
  let seedCategories : [{
    id : Nat;
    name : Text;
    slug : Text;
    description : Text;
    enabled : Bool;
    sortOrder : Nat;
  }] = [
    {
      id = 0;
      name = "Houses";
      slug = "houses";
      description = "Family homes, villas and bungalows for sale or rent.";
      enabled = true;
      sortOrder = 1;
    },
    {
      id = 1;
      name = "Apartments";
      slug = "apartments";
      description = "Apartments and condominiums in city and coastal locations.";
      enabled = true;
      sortOrder = 2;
    },
    {
      id = 2;
      name = "Land";
      slug = "land";
      description = "Residential, commercial and agricultural land plots.";
      enabled = true;
      sortOrder = 3;
    },
    {
      id = 3;
      name = "Commercial";
      slug = "commercial";
      description = "Shops, offices and commercial buildings.";
      enabled = true;
      sortOrder = 4;
    },
    {
      id = 4;
      name = "Rooms & Annexes";
      slug = "rooms-annexes";
      description = "Rooms, annexes and shared accommodation.";
      enabled = true;
      sortOrder = 5;
    },
    {
      id = 5;
      name = "Holiday Rentals";
      slug = "holiday-rentals";
      description = "Short-stay and holiday rental properties.";
      enabled = true;
      sortOrder = 6;
    },
  ];

  /// Starter help chatbot entries covering the public site's main topics.
  let seedChatbotEntries : [{
    id : Nat;
    question : Text;
    answer : Text;
    keywords : [Text];
    enabled : Bool;
    sortOrder : Nat;
  }] = [
    {
      id = 0;
      question = "How do I browse properties?";
      answer = "Open the Browse page from the main navigation to see every published listing. You can filter by category, listing type, location and price, then open any listing for full details and photos.";
      keywords = ["browse", "search", "properties", "listings", "filter"];
      enabled = true;
      sortOrder = 1;
    },
    {
      id = 1;
      question = "How do I advertise my property?";
      answer = "Click Post Your Property in the navigation. If you are not signed in you will be asked to register or sign in first. Once signed in with an active subscription you can complete the listing form and publish your property.";
      keywords = ["advertise", "post", "property", "listing", "publish"];
      enabled = true;
      sortOrder = 2;
    },
    {
      id = 2;
      question = "How do I register or sign in?";
      answer = "Use the Sign In option in the navigation to create a customer account or sign in to an existing one. Customer accounts are separate from the administrator console.";
      keywords = ["login", "register", "sign in", "sign up", "account"];
      enabled = true;
      sortOrder = 3;
    },
    {
      id = 3;
      question = "What subscription plans are available?";
      answer = "There are four monthly plans: Individual at Rs. 1,990 (3 listings, 5 images), Agent at Rs. 3,990 (15 listings, 15 images), Business at Rs. 5,990 (50 listings, 35 images) and Professional at Rs. 9,990 (unlimited listings and images).";
      keywords = ["plans", "subscription", "pricing", "individual", "agent", "business", "professional"];
      enabled = true;
      sortOrder = 4;
    },
    {
      id = 4;
      question = "How do I pay for a plan?";
      answer = "Choose a plan on the Plans page and submit your payment reference from your account panel. Payments are reviewed and confirmed manually by an administrator, so your subscription activates once the payment is confirmed.";
      keywords = ["payment", "pay", "billing", "reference", "confirm"];
      enabled = true;
      sortOrder = 5;
    },
    {
      id = 5;
      question = "How do I activate or upgrade my plan?";
      answer = "Open My Account and use Activate Plan to renew your current monthly plan by completing payment, or Upgrade Plan to go to the Plans page and choose a different tier.";
      keywords = ["activate", "upgrade", "renew", "plan", "subscription"];
      enabled = true;
      sortOrder = 6;
    },
    {
      id = 6;
      question = "What are the listing requirements?";
      answer = "You need an active subscription before publishing. Each plan sets a maximum number of active listings and a maximum number of images per listing, and the listing form enforces your plan's image limit.";
      keywords = ["requirements", "listing", "images", "limit", "allowance"];
      enabled = true;
      sortOrder = 7;
    },
    {
      id = 7;
      question = "How do I contact support?";
      answer = "Use the Contact page in the navigation to send us a message. You can also submit an enquiry directly from any property listing.";
      keywords = ["contact", "help", "support", "enquiry", "message"];
      enabled = true;
      sortOrder = 8;
    },
    {
      id = 8;
      question = "How do I navigate the website?";
      answer = "The main navigation has Home, Browse, About, Contact and Plans. When you are signed in you also see My Account and Logout.";
      keywords = ["navigation", "menu", "website", "home", "about", "plans"];
      enabled = true;
      sortOrder = 9;
    },
  ];

  public func migration(old : OldActor) : NewActor {
    let listings = old.listings.map<Nat, OldListing, NewListing>(
      func(_, l) {
        {
          l with
          owner = null;
          featured = false;
          blocked = false;
        };
      }
    );
    let plans = Map.empty<Nat, {
      id : Nat;
      name : Text;
      price : Nat;
      billingPeriod : Text;
      listingAllowance : ?Nat;
      imageAllowance : ?Nat;
      features : [Text];
      active : Bool;
      sortOrder : Nat;
    }>();
    for (plan in seedPlans.values()) {
      plans.add(plan.id, plan);
    };
    let categories = Map.empty<Nat, {
      id : Nat;
      name : Text;
      slug : Text;
      description : Text;
      enabled : Bool;
      sortOrder : Nat;
    }>();
    for (category in seedCategories.values()) {
      categories.add(category.id, category);
    };
    let chatbotEntries = Map.empty<Nat, {
      id : Nat;
      question : Text;
      answer : Text;
      keywords : [Text];
      enabled : Bool;
      sortOrder : Nat;
      updatedAt : Int;
    }>();
    for (entry in seedChatbotEntries.values()) {
      chatbotEntries.add(entry.id, { entry with updatedAt = 0 });
    };
    {
      accessControlState = old.accessControlState;
      listingsState = old.listingsState;
      customersState = { var nextPlanId = 4; var nextPaymentId = 0 };
      contentState = {
        var nextBannerId = 0;
        var nextCategoryId = 6;
        var nextChatbotEntryId = 9;
      };
      listings;
      enquiries = old.enquiries;
      customers = Map.empty();
      plans;
      payments = Map.empty();
      subscriptions = Map.empty();
      banners = Map.empty();
      categories;
      chatbotEntries;
    };
  };
};
