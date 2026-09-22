import Map "mo:core/Map";
import Order "mo:core/Order";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Types "../types/common";
import ContentTypes "../types/content";

module {
  /// Maximum number of banners the homepage slider supports.
  let maxBanners = 10;

  /// Orders two records by their `sortOrder`, then by `id` for stability.
  func compareOrder(aOrder : Nat, aId : Nat, bOrder : Nat, bId : Nat) : Order.Order {
    if (aOrder < bOrder) { #less } else if (aOrder > bOrder) { #greater } else if (aId < bId) {
      #less;
    } else if (aId > bId) { #greater } else { #equal };
  };

  // --- Banners ------------------------------------------------------------

  /// Returns every banner ordered by `sortOrder`.
  public func listBanners(
    banners : Map.Map<Types.BannerId, ContentTypes.Banner>,
  ) : [ContentTypes.Banner] {
    banners.values().toArray().sort(func(a, b) = compareOrder(a.sortOrder, a.id, b.sortOrder, b.id));
  };

  /// Returns only enabled banners ordered by `sortOrder`.
  public func listEnabledBanners(
    banners : Map.Map<Types.BannerId, ContentTypes.Banner>,
  ) : [ContentTypes.Banner] {
    listBanners(banners).filter(func(banner) = banner.enabled);
  };

  /// Creates a banner. Fails when the maximum of 10 banners already exists.
  public func createBanner(
    state : ContentTypes.ContentState,
    banners : Map.Map<Types.BannerId, ContentTypes.Banner>,
    input : ContentTypes.BannerInput,
  ) : Result.Result<ContentTypes.Banner, ContentTypes.ContentError> {
    if (banners.size() >= maxBanners) {
      return #err(#bannerLimitReached(maxBanners));
    };
    let id = state.nextBannerId;
    state.nextBannerId := id + 1;
    let now = Time.now();
    let banner : ContentTypes.Banner = {
      id;
      title = input.title;
      subtitle = input.subtitle;
      image = input.image;
      linkUrl = input.linkUrl;
      enabled = input.enabled;
      sortOrder = input.sortOrder;
      createdAt = now;
      updatedAt = now;
    };
    banners.add(id, banner);
    #ok(banner);
  };

  /// Applies a full edit to a banner.
  public func updateBanner(
    banners : Map.Map<Types.BannerId, ContentTypes.Banner>,
    id : Types.BannerId,
    input : ContentTypes.BannerInput,
  ) : Result.Result<ContentTypes.Banner, ContentTypes.ContentError> {
    switch (banners.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        let updated : ContentTypes.Banner = {
          id = existing.id;
          title = input.title;
          subtitle = input.subtitle;
          image = input.image;
          linkUrl = input.linkUrl;
          enabled = input.enabled;
          sortOrder = input.sortOrder;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        banners.add(id, updated);
        #ok(updated);
      };
    };
  };

  /// Enables or disables a banner.
  public func setBannerEnabled(
    banners : Map.Map<Types.BannerId, ContentTypes.Banner>,
    id : Types.BannerId,
    enabled : Bool,
  ) : Result.Result<ContentTypes.Banner, ContentTypes.ContentError> {
    switch (banners.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        let updated : ContentTypes.Banner = {
          id = existing.id;
          title = existing.title;
          subtitle = existing.subtitle;
          image = existing.image;
          linkUrl = existing.linkUrl;
          enabled;
          sortOrder = existing.sortOrder;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        banners.add(id, updated);
        #ok(updated);
      };
    };
  };

  /// Moves a banner to a new position in the slider order.
  public func reorderBanner(
    banners : Map.Map<Types.BannerId, ContentTypes.Banner>,
    id : Types.BannerId,
    sortOrder : Nat,
  ) : Result.Result<ContentTypes.Banner, ContentTypes.ContentError> {
    switch (banners.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        let updated : ContentTypes.Banner = {
          id = existing.id;
          title = existing.title;
          subtitle = existing.subtitle;
          image = existing.image;
          linkUrl = existing.linkUrl;
          enabled = existing.enabled;
          sortOrder;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        banners.add(id, updated);
        #ok(updated);
      };
    };
  };

  /// Deletes a banner.
  public func removeBanner(
    banners : Map.Map<Types.BannerId, ContentTypes.Banner>,
    id : Types.BannerId,
  ) : Result.Result<(), ContentTypes.ContentError> {
    switch (banners.get(id)) {
      case null { #err(#notFound(id)) };
      case (?_) {
        banners.remove(id);
        #ok(());
      };
    };
  };

  // --- Categories ---------------------------------------------------------

  /// Returns every category ordered by `sortOrder`.
  public func listCategories(
    categories : Map.Map<Types.CategoryId, ContentTypes.Category>,
  ) : [ContentTypes.Category] {
    categories.values().toArray().sort(func(a, b) = compareOrder(a.sortOrder, a.id, b.sortOrder, b.id));
  };

  /// Returns only enabled categories ordered by `sortOrder`.
  public func listEnabledCategories(
    categories : Map.Map<Types.CategoryId, ContentTypes.Category>,
  ) : [ContentTypes.Category] {
    listCategories(categories).filter(func(category) = category.enabled);
  };

  /// Creates a category.
  public func createCategory(
    state : ContentTypes.ContentState,
    categories : Map.Map<Types.CategoryId, ContentTypes.Category>,
    input : ContentTypes.CategoryInput,
  ) : ContentTypes.Category {
    let id = state.nextCategoryId;
    state.nextCategoryId := id + 1;
    let category : ContentTypes.Category = {
      id;
      name = input.name;
      slug = input.slug;
      description = input.description;
      enabled = input.enabled;
      sortOrder = input.sortOrder;
    };
    categories.add(id, category);
    category;
  };

  /// Applies a full edit to a category.
  public func updateCategory(
    categories : Map.Map<Types.CategoryId, ContentTypes.Category>,
    id : Types.CategoryId,
    input : ContentTypes.CategoryInput,
  ) : Result.Result<ContentTypes.Category, ContentTypes.ContentError> {
    switch (categories.get(id)) {
      case null { #err(#notFound(id)) };
      case (?_) {
        let updated : ContentTypes.Category = {
          id;
          name = input.name;
          slug = input.slug;
          description = input.description;
          enabled = input.enabled;
          sortOrder = input.sortOrder;
        };
        categories.add(id, updated);
        #ok(updated);
      };
    };
  };

  /// Deletes a category.
  public func removeCategory(
    categories : Map.Map<Types.CategoryId, ContentTypes.Category>,
    id : Types.CategoryId,
  ) : Result.Result<(), ContentTypes.ContentError> {
    switch (categories.get(id)) {
      case null { #err(#notFound(id)) };
      case (?_) {
        categories.remove(id);
        #ok(());
      };
    };
  };

  // --- Chatbot ------------------------------------------------------------

  /// Returns every chatbot entry ordered by `sortOrder`.
  public func listChatbotEntries(
    entries : Map.Map<Types.ChatbotEntryId, ContentTypes.ChatbotEntry>,
  ) : [ContentTypes.ChatbotEntry] {
    entries.values().toArray().sort(func(a, b) = compareOrder(a.sortOrder, a.id, b.sortOrder, b.id));
  };

  /// Returns only enabled chatbot entries ordered by `sortOrder`.
  public func listEnabledChatbotEntries(
    entries : Map.Map<Types.ChatbotEntryId, ContentTypes.ChatbotEntry>,
  ) : [ContentTypes.ChatbotEntry] {
    listChatbotEntries(entries).filter(func(entry) = entry.enabled);
  };

  /// Creates a chatbot entry.
  public func createChatbotEntry(
    state : ContentTypes.ContentState,
    entries : Map.Map<Types.ChatbotEntryId, ContentTypes.ChatbotEntry>,
    input : ContentTypes.ChatbotEntryInput,
  ) : ContentTypes.ChatbotEntry {
    let id = state.nextChatbotEntryId;
    state.nextChatbotEntryId := id + 1;
    let entry : ContentTypes.ChatbotEntry = {
      id;
      question = input.question;
      answer = input.answer;
      keywords = input.keywords;
      enabled = input.enabled;
      sortOrder = input.sortOrder;
      updatedAt = Time.now();
    };
    entries.add(id, entry);
    entry;
  };

  /// Applies a full edit to a chatbot entry.
  public func updateChatbotEntry(
    entries : Map.Map<Types.ChatbotEntryId, ContentTypes.ChatbotEntry>,
    id : Types.ChatbotEntryId,
    input : ContentTypes.ChatbotEntryInput,
  ) : Result.Result<ContentTypes.ChatbotEntry, ContentTypes.ContentError> {
    switch (entries.get(id)) {
      case null { #err(#notFound(id)) };
      case (?_) {
        let updated : ContentTypes.ChatbotEntry = {
          id;
          question = input.question;
          answer = input.answer;
          keywords = input.keywords;
          enabled = input.enabled;
          sortOrder = input.sortOrder;
          updatedAt = Time.now();
        };
        entries.add(id, updated);
        #ok(updated);
      };
    };
  };

  /// Deletes a chatbot entry.
  public func removeChatbotEntry(
    entries : Map.Map<Types.ChatbotEntryId, ContentTypes.ChatbotEntry>,
    id : Types.ChatbotEntryId,
  ) : Result.Result<(), ContentTypes.ContentError> {
    switch (entries.get(id)) {
      case null { #err(#notFound(id)) };
      case (?_) {
        entries.remove(id);
        #ok(());
      };
    };
  };
};
