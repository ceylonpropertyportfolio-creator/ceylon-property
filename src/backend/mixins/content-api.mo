import Map "mo:core/Map";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/common";
import ContentTypes "../types/content";
import ContentLib "../lib/content";

mixin (
  accessControlState : AccessControl.AccessControlState,
  state : ContentTypes.ContentState,
  banners : Map.Map<Types.BannerId, ContentTypes.Banner>,
  categories : Map.Map<Types.CategoryId, ContentTypes.Category>,
  chatbotEntries : Map.Map<Types.ChatbotEntryId, ContentTypes.ChatbotEntry>,
) {
  /// True only for a registered caller holding the administrator role.
  /// Anonymous callers are never administrators.
  func contentCallerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false; };
    switch (accessControlState.userRoles.get(caller)) {
      case null { false };
      case (?role) { role == #admin };
    };
  };

  // --- Public: banners, categories, chatbot -------------------------------

  /// Returns the enabled homepage banners ordered by `sortOrder`.
  public query func listBanners() : async [ContentTypes.Banner] {
    ContentLib.listEnabledBanners(banners);
  };

  /// Returns the enabled advertising categories ordered by `sortOrder`.
  public query func listCategories() : async [ContentTypes.Category] {
    ContentLib.listEnabledCategories(categories);
  };

  /// Returns the enabled help chatbot entries ordered by `sortOrder`.
  public query func listChatbotEntries() : async [ContentTypes.ChatbotEntry] {
    ContentLib.listEnabledChatbotEntries(chatbotEntries);
  };

  // --- Admin: banners -----------------------------------------------------

  /// Returns every banner, enabled or not. Admin only.
  public query ({ caller }) func adminListBanners() : async [ContentTypes.Banner] {
    if (not contentCallerIsAdmin(caller)) { return []; };
    ContentLib.listBanners(banners);
  };

  /// Creates a banner. Admin only.
  public shared ({ caller }) func adminCreateBanner(
    input : ContentTypes.BannerInput,
  ) : async Result.Result<ContentTypes.Banner, ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.createBanner(state, banners, input);
  };

  /// Applies a full edit to a banner. Admin only.
  public shared ({ caller }) func adminUpdateBanner(
    id : Types.BannerId,
    input : ContentTypes.BannerInput,
  ) : async Result.Result<ContentTypes.Banner, ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.updateBanner(banners, id, input);
  };

  /// Enables or disables a banner. Admin only.
  public shared ({ caller }) func adminSetBannerEnabled(
    id : Types.BannerId,
    enabled : Bool,
  ) : async Result.Result<ContentTypes.Banner, ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.setBannerEnabled(banners, id, enabled);
  };

  /// Moves a banner to a new slider position. Admin only.
  public shared ({ caller }) func adminReorderBanner(
    id : Types.BannerId,
    sortOrder : Nat,
  ) : async Result.Result<ContentTypes.Banner, ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.reorderBanner(banners, id, sortOrder);
  };

  /// Deletes a banner. Admin only.
  public shared ({ caller }) func adminDeleteBanner(
    id : Types.BannerId,
  ) : async Result.Result<(), ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.removeBanner(banners, id);
  };

  // --- Admin: categories --------------------------------------------------

  /// Returns every category, enabled or not. Admin only.
  public query ({ caller }) func adminListCategories() : async [ContentTypes.Category] {
    if (not contentCallerIsAdmin(caller)) { return []; };
    ContentLib.listCategories(categories);
  };

  /// Creates a category. Admin only.
  public shared ({ caller }) func adminCreateCategory(
    input : ContentTypes.CategoryInput,
  ) : async Result.Result<ContentTypes.Category, ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    #ok(ContentLib.createCategory(state, categories, input));
  };

  /// Applies a full edit to a category. Admin only.
  public shared ({ caller }) func adminUpdateCategory(
    id : Types.CategoryId,
    input : ContentTypes.CategoryInput,
  ) : async Result.Result<ContentTypes.Category, ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.updateCategory(categories, id, input);
  };

  /// Deletes a category. Admin only.
  public shared ({ caller }) func adminDeleteCategory(
    id : Types.CategoryId,
  ) : async Result.Result<(), ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.removeCategory(categories, id);
  };

  // --- Admin: chatbot -----------------------------------------------------

  /// Returns every chatbot entry, enabled or not. Admin only.
  public query ({ caller }) func adminListChatbotEntries() : async [ContentTypes.ChatbotEntry] {
    if (not contentCallerIsAdmin(caller)) { return []; };
    ContentLib.listChatbotEntries(chatbotEntries);
  };

  /// Creates a chatbot entry. Admin only.
  public shared ({ caller }) func adminCreateChatbotEntry(
    input : ContentTypes.ChatbotEntryInput,
  ) : async Result.Result<ContentTypes.ChatbotEntry, ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    #ok(ContentLib.createChatbotEntry(state, chatbotEntries, input));
  };

  /// Applies a full edit to a chatbot entry. Admin only.
  public shared ({ caller }) func adminUpdateChatbotEntry(
    id : Types.ChatbotEntryId,
    input : ContentTypes.ChatbotEntryInput,
  ) : async Result.Result<ContentTypes.ChatbotEntry, ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.updateChatbotEntry(chatbotEntries, id, input);
  };

  /// Deletes a chatbot entry. Admin only.
  public shared ({ caller }) func adminDeleteChatbotEntry(
    id : Types.ChatbotEntryId,
  ) : async Result.Result<(), ContentTypes.ContentError> {
    if (not contentCallerIsAdmin(caller)) { return #err(#notAuthorized); };
    ContentLib.removeChatbotEntry(chatbotEntries, id);
  };
};
