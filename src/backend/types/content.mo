import Common "common";

module {
  /// A homepage banner shown in the admin-controlled rotating slider.
  public type Banner = {
    id : Common.BannerId;
    title : Text;
    subtitle : Text;
    image : ?Common.Photo;
    linkUrl : Text;
    enabled : Bool;
    sortOrder : Nat;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  /// Fields supplied when an admin creates or edits a banner.
  public type BannerInput = {
    title : Text;
    subtitle : Text;
    image : ?Common.Photo;
    linkUrl : Text;
    enabled : Bool;
    sortOrder : Nat;
  };

  /// An advertising category shown on the public site.
  public type Category = {
    id : Common.CategoryId;
    name : Text;
    slug : Text;
    description : Text;
    enabled : Bool;
    sortOrder : Nat;
  };

  /// Fields supplied when an admin creates or edits a category.
  public type CategoryInput = {
    name : Text;
    slug : Text;
    description : Text;
    enabled : Bool;
    sortOrder : Nat;
  };

  /// A help chatbot question/answer entry, editable from the admin console.
  public type ChatbotEntry = {
    id : Common.ChatbotEntryId;
    question : Text;
    answer : Text;
    keywords : [Text];
    enabled : Bool;
    sortOrder : Nat;
    updatedAt : Common.Timestamp;
  };

  /// Fields supplied when an admin creates or edits a chatbot entry.
  public type ChatbotEntryInput = {
    question : Text;
    answer : Text;
    keywords : [Text];
    enabled : Bool;
    sortOrder : Nat;
  };

  /// Failure modes for content management operations.
  public type ContentError = {
    #notAuthorized;
    #notFound : Nat;
    #bannerLimitReached : Nat;
  };

  /// Domain state for banners, categories and chatbot content.
  public type ContentState = {
    var nextBannerId : Nat;
    var nextCategoryId : Nat;
    var nextChatbotEntryId : Nat;
  };
};
