import type {
  AdminEnquiry,
  AdminListingSummary,
  AdminPayment,
  Banner,
  BannerInput,
  Category,
  CategoryInput,
  ChatbotEntry,
  ChatbotEntryInput,
  Customer,
  CustomerAccount,
  CustomerId,
  CustomerProfileInput,
  Enquiry,
  EnquiryInput,
  Listing,
  ListingFilter,
  ListingId,
  ListingInput,
  ListingUpdate,
  Payment,
  PaymentId,
  Photo,
  Plan,
  PlanId,
  PlanInput,
  Result,
  Result_1,
  Result_2,
  Result_3,
  Result_4,
  Result_5,
  Result_6,
  Result_7,
  Result_8,
  Result_9,
  Result_10,
  Result_11,
  Result_12,
  Subscription,
} from "@/backend";
import {
  EmailVerification,
  ListingType,
  MobileVerification,
  PaymentStatus,
  PropertyType,
  SubscriptionStatus,
} from "@/backend";

/**
 * A typed, in-memory stand-in for the generated `Backend` actor.
 *
 * Every method mirrors the generated `backendInterface` signature so the
 * frontend hooks can be exercised without a replica. Tests seed the store and
 * assert on the calls the UI made.
 */
export interface MockBackend {
  listings: Listing[];
  enquiries: Enquiry[];
  plans: Plan[];
  banners: Banner[];
  categories: Category[];
  chatbotEntries: ChatbotEntry[];
  payments: Payment[];
  customers: CustomerAccount[];
  calls: {
    listPublishedListings: number;
    searchListings: ListingFilter[];
    getListing: ListingId[];
    submitEnquiry: EnquiryInput[];
    adminListListings: number;
    adminGetListing: ListingId[];
    adminCreateListing: ListingInput[];
    adminUpdateListing: { id: ListingId; patch: ListingUpdate }[];
    adminSetListingPublished: { id: ListingId; published: boolean }[];
    adminSetListingFeatured: { id: ListingId; featured: boolean }[];
    adminSetListingBlocked: { id: ListingId; blocked: boolean }[];
    adminDeleteListing: ListingId[];
    adminAddListingPhotos: { id: ListingId; photos: Photo[] }[];
    adminRemoveListingPhoto: { id: ListingId; index: bigint }[];
    adminListEnquiries: number;
    adminSetEnquiryRead: { id: bigint; read: boolean }[];
    adminDeleteEnquiry: bigint[];
    listPlans: number;
    getPlan: PlanId[];
    listBanners: number;
    listCategories: number;
    listChatbotEntries: number;
    getMyAccount: number;
    getMyPayments: number;
    getMySubscription: number;
    getMyListings: number;
    getMyListing: ListingId[];
    registerCustomer: CustomerProfileInput[];
    updateMyProfile: CustomerProfileInput[];
    requestEmailVerification: string[];
    confirmEmailVerification: string[];
    submitMobileNumber: string[];
    submitPayment: { planId: PlanId; reference: string }[];
    createMyListing: ListingInput[];
    updateMyListing: { id: ListingId; patch: ListingUpdate }[];
    deleteMyListing: ListingId[];
    addMyListingPhotos: { id: ListingId; photos: Photo[] }[];
    removeMyListingPhoto: { id: ListingId; index: bigint }[];
    adminListCustomers: number;
    adminListPlans: number;
    adminListPayments: number;
    adminListBanners: number;
    adminListCategories: number;
    adminListChatbotEntries: number;
    adminGetSubscription: CustomerId[];
    adminSetCustomerBlocked: { customer: CustomerId; blocked: boolean }[];
    adminSetMobileVerification: {
      customer: CustomerId;
      state: MobileVerification;
    }[];
    adminCreatePlan: PlanInput[];
    adminUpdatePlan: { id: PlanId; input: PlanInput }[];
    adminDeletePlan: PlanId[];
    adminCreateBanner: BannerInput[];
    adminUpdateBanner: { id: bigint; input: BannerInput }[];
    adminSetBannerEnabled: { id: bigint; enabled: boolean }[];
    adminReorderBanner: { id: bigint; sortOrder: bigint }[];
    adminDeleteBanner: bigint[];
    adminCreateCategory: CategoryInput[];
    adminUpdateCategory: { id: bigint; input: CategoryInput }[];
    adminDeleteCategory: bigint[];
    adminCreateChatbotEntry: ChatbotEntryInput[];
    adminUpdateChatbotEntry: { id: bigint; input: ChatbotEntryInput }[];
    adminDeleteChatbotEntry: bigint[];
    adminConfirmPayment: PaymentId[];
    adminRejectPayment: PaymentId[];
  };
  listPublishedListings(): Promise<Listing[]>;
  searchListings(filter: ListingFilter): Promise<Listing[]>;
  getListing(id: ListingId): Promise<Listing | null>;
  submitEnquiry(input: EnquiryInput): Promise<Result_3>;
  adminListListings(): Promise<AdminListingSummary[]>;
  adminGetListing(id: ListingId): Promise<Listing | null>;
  adminCreateListing(input: ListingInput): Promise<Result_1>;
  adminUpdateListing(id: ListingId, patch: ListingUpdate): Promise<Result_1>;
  adminSetListingPublished(
    id: ListingId,
    published: boolean,
  ): Promise<Result_1>;
  adminSetListingFeatured(id: ListingId, featured: boolean): Promise<Result_1>;
  adminSetListingBlocked(id: ListingId, blocked: boolean): Promise<Result_1>;
  adminDeleteListing(id: ListingId): Promise<Result_5>;
  adminAddListingPhotos(id: ListingId, photos: Photo[]): Promise<Result_1>;
  adminRemoveListingPhoto(id: ListingId, index: bigint): Promise<Result_1>;
  adminListEnquiries(): Promise<AdminEnquiry[]>;
  adminSetEnquiryRead(id: bigint, read: boolean): Promise<Result_10>;
  adminDeleteEnquiry(id: bigint): Promise<Result_5>;
  isCallerAdmin(): Promise<boolean>;
  listPlans(): Promise<Plan[]>;
  getPlan(id: PlanId): Promise<Plan | null>;
  listBanners(): Promise<Banner[]>;
  listCategories(): Promise<Category[]>;
  listChatbotEntries(): Promise<ChatbotEntry[]>;
  getMyAccount(): Promise<CustomerAccount | null>;
  getMyPayments(): Promise<Payment[]>;
  getMySubscription(): Promise<Subscription | null>;
  getMyListings(): Promise<Listing[]>;
  getMyListing(id: ListingId): Promise<Listing | null>;
  registerCustomer(input: CustomerProfileInput): Promise<Result>;
  updateMyProfile(input: CustomerProfileInput): Promise<Result>;
  requestEmailVerification(email: string): Promise<Result_4>;
  confirmEmailVerification(code: string): Promise<Result>;
  submitMobileNumber(phone: string): Promise<Result>;
  submitPayment(planId: PlanId, reference: string): Promise<Result_2>;
  createMyListing(input: ListingInput): Promise<Result_1>;
  updateMyListing(id: ListingId, patch: ListingUpdate): Promise<Result_1>;
  deleteMyListing(id: ListingId): Promise<Result_5>;
  addMyListingPhotos(id: ListingId, photos: Photo[]): Promise<Result_1>;
  removeMyListingPhoto(id: ListingId, index: bigint): Promise<Result_1>;
  adminListCustomers(): Promise<CustomerAccount[]>;
  adminListPlans(): Promise<Plan[]>;
  adminListPayments(): Promise<AdminPayment[]>;
  adminListBanners(): Promise<Banner[]>;
  adminListCategories(): Promise<Category[]>;
  adminListChatbotEntries(): Promise<ChatbotEntry[]>;
  adminGetSubscription(customer: CustomerId): Promise<Subscription | null>;
  adminSetCustomerBlocked(
    customer: CustomerId,
    blocked: boolean,
  ): Promise<Result>;
  adminSetMobileVerification(
    customer: CustomerId,
    state: MobileVerification,
  ): Promise<Result>;
  adminCreatePlan(input: PlanInput): Promise<Result_6>;
  adminUpdatePlan(id: PlanId, input: PlanInput): Promise<Result_6>;
  adminDeletePlan(id: PlanId): Promise<Result_11>;
  adminCreateBanner(input: BannerInput): Promise<Result_9>;
  adminUpdateBanner(id: bigint, input: BannerInput): Promise<Result_9>;
  adminSetBannerEnabled(id: bigint, enabled: boolean): Promise<Result_9>;
  adminReorderBanner(id: bigint, sortOrder: bigint): Promise<Result_9>;
  adminDeleteBanner(id: bigint): Promise<Result_12>;
  adminCreateCategory(input: CategoryInput): Promise<Result_8>;
  adminUpdateCategory(id: bigint, input: CategoryInput): Promise<Result_8>;
  adminDeleteCategory(id: bigint): Promise<Result_12>;
  adminCreateChatbotEntry(input: ChatbotEntryInput): Promise<Result_7>;
  adminUpdateChatbotEntry(
    id: bigint,
    input: ChatbotEntryInput,
  ): Promise<Result_7>;
  adminDeleteChatbotEntry(id: bigint): Promise<Result_12>;
  adminConfirmPayment(id: PaymentId): Promise<Result_2>;
  adminRejectPayment(id: PaymentId): Promise<Result_2>;
}

/** A fully-populated listing fixture with sensible defaults. */
export function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 1n,
    title: "Beachfront villa with infinity pool",
    description:
      "A four-bedroom coastal villa with an infinity pool overlooking the Indian Ocean.",
    listingType: ListingType.sale,
    propertyType: PropertyType.house,
    price: 1_300_000n,
    currency: "LKR",
    addressLine: "42 Lighthouse Road",
    city: "Galle",
    region: "Southern Province",
    postcode: "80000",
    country: "Sri Lanka",
    bedrooms: 4n,
    bathrooms: 3n,
    area: 2400n,
    photos: [],
    published: true,
    featured: false,
    blocked: false,
    createdAt: 1_700_000_000_000_000_000n,
    updatedAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

/** An enquiry fixture bound to a listing id. */
export function makeEnquiry(overrides: Partial<Enquiry> = {}): Enquiry {
  return {
    id: 1n,
    listingId: 1n,
    name: "Amara Perera",
    email: "amara@example.com",
    phone: "+94 77 123 4567",
    message: "I would like to arrange a viewing of this property.",
    read: false,
    createdAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

/** An admin summary wrapping a listing and its enquiry count. */
export function makeSummary(
  listing: Listing,
  enquiryCount = 0n,
): AdminListingSummary {
  return { listing, enquiryCount };
}

/** An admin enquiry wrapping an enquiry and its listing title. */
export function makeAdminEnquiry(
  enquiry: Enquiry,
  listingTitle: string,
): AdminEnquiry {
  return { listingTitle, enquiry };
}

/** A photo fixture with sensible defaults. */
export function makePhoto(overrides: Partial<Photo> = {}): Photo {
  return {
    blob: new Uint8Array([1, 2, 3]),
    filename: "villa.png",
    ...overrides,
  };
}

/** A plan fixture with sensible defaults. */
export function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 1n,
    name: "Individual",
    features: ["3 active listings", "5 photos per listing"],
    active: true,
    sortOrder: 1n,
    listingAllowance: 3n,
    billingPeriod: "monthly",
    imageAllowance: 5n,
    price: 1_990n,
    ...overrides,
  };
}

/** A banner fixture with sensible defaults. */
export function makeBanner(overrides: Partial<Banner> = {}): Banner {
  return {
    id: 1n,
    title: "Featured announcement",
    linkUrl: "https://example.com/announcement",
    sortOrder: 1n,
    createdAt: 1_700_000_000_000_000_000n,
    enabled: true,
    updatedAt: 1_700_000_000_000_000_000n,
    subtitle: "A short subtitle for the announcement.",
    ...overrides,
  };
}

/** A category fixture with sensible defaults. */
export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1n,
    sortOrder: 1n,
    name: "Houses",
    slug: "houses",
    description: "Family homes across the island.",
    enabled: true,
    ...overrides,
  };
}

/** A chatbot help entry fixture with sensible defaults. */
export function makeChatbotEntry(
  overrides: Partial<ChatbotEntry> = {},
): ChatbotEntry {
  return {
    id: 1n,
    question: "How do I list my property?",
    sortOrder: 1n,
    answer: "Choose a plan, then submit your property from the post page.",
    enabled: true,
    keywords: ["list", "property", "advertise"],
    updatedAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

/** A customer fixture with sensible defaults. */
export function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    principal: { toText: () => "customer-principal" } as unknown as CustomerId,
    blocked: false,
    mobileVerification: MobileVerification.notSubmitted,
    name: "Amara Perera",
    createdAt: 1_700_000_000_000_000_000n,
    whatsapp: "+94 77 123 4567",
    email: "amara@example.com",
    updatedAt: 1_700_000_000_000_000_000n,
    company: "Perera Estates",
    address: "42 Lighthouse Road, Galle",
    phone: "+94 77 123 4567",
    emailVerification: EmailVerification.unverified,
    ...overrides,
  };
}

/** A subscription fixture with sensible defaults. */
export function makeSubscription(
  overrides: Partial<Subscription> = {},
): Subscription {
  return {
    status: SubscriptionStatus.active,
    startedAt: 1_700_000_000_000_000_000n,
    expiresAt: 1_702_592_000_000_000_000n,
    planId: 1n,
    billingPeriod: "monthly",
    price: 1_990n,
    planName: "Individual",
    ...overrides,
  };
}

/** A payment fixture with sensible defaults. */
export function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1n,
    status: PaymentStatus.pending,
    customer: { toText: () => "customer-principal" } as unknown as CustomerId,
    planId: 1n,
    reference: "BANK-REF-001",
    submittedAt: 1_700_000_000_000_000_000n,
    amount: 1_990n,
    planName: "Individual",
    ...overrides,
  };
}

/** An admin payment wrapping a payment and its customer's details. */
export function makeAdminPayment(
  payment: Payment,
  customerName = "Amara Perera",
  customerEmail = "amara@example.com",
): AdminPayment {
  return { payment, customerName, customerEmail };
}

/**
 * Builds a mock backend. Pass `seed` to pre-populate listings, enquiries,
 * plans, content, payments and the signed-in customer; the store is mutable so
 * create/update/delete flows behave like the real one.
 */
export function createMockBackend(seed?: {
  listings?: Listing[];
  enquiries?: Enquiry[];
  plans?: Plan[];
  banners?: Banner[];
  categories?: Category[];
  chatbotEntries?: ChatbotEntry[];
  payments?: Payment[];
  /** The signed-in customer's account, or `null` when not registered. */
  account?: CustomerAccount | null;
  /** Whether the signed-in caller holds the administrator role. */
  isAdmin?: boolean;
}): MockBackend {
  const listings: Listing[] = [...(seed?.listings ?? [])];
  const enquiries: Enquiry[] = [...(seed?.enquiries ?? [])];
  const plans: Plan[] = [...(seed?.plans ?? [])];
  const banners: Banner[] = [...(seed?.banners ?? [])];
  const categories: Category[] = [...(seed?.categories ?? [])];
  const chatbotEntries: ChatbotEntry[] = [...(seed?.chatbotEntries ?? [])];
  const payments: Payment[] = [...(seed?.payments ?? [])];
  const customers: CustomerAccount[] = seed?.account ? [seed.account] : [];
  let account: CustomerAccount | null = seed?.account ?? null;
  let nextListingId =
    listings.reduce((max, l) => (l.id >= max ? l.id + 1n : max), 1n) - 1n;
  let nextEnquiryId =
    enquiries.reduce((max, e) => (e.id >= max ? e.id + 1n : max), 1n) - 1n;
  let nextPaymentId =
    payments.reduce((max, p) => (p.id >= max ? p.id + 1n : max), 1n) - 1n;

  const calls: MockBackend["calls"] = {
    listPublishedListings: 0,
    searchListings: [],
    getListing: [],
    submitEnquiry: [],
    adminListListings: 0,
    adminGetListing: [],
    adminCreateListing: [],
    adminUpdateListing: [],
    adminSetListingPublished: [],
    adminSetListingFeatured: [],
    adminSetListingBlocked: [],
    adminDeleteListing: [],
    adminAddListingPhotos: [],
    adminRemoveListingPhoto: [],
    adminListEnquiries: 0,
    adminSetEnquiryRead: [],
    adminDeleteEnquiry: [],
    listPlans: 0,
    getPlan: [],
    listBanners: 0,
    listCategories: 0,
    listChatbotEntries: 0,
    getMyAccount: 0,
    getMyPayments: 0,
    getMySubscription: 0,
    getMyListings: 0,
    getMyListing: [],
    registerCustomer: [],
    updateMyProfile: [],
    requestEmailVerification: [],
    confirmEmailVerification: [],
    submitMobileNumber: [],
    submitPayment: [],
    createMyListing: [],
    updateMyListing: [],
    deleteMyListing: [],
    addMyListingPhotos: [],
    removeMyListingPhoto: [],
    adminListCustomers: 0,
    adminListPlans: 0,
    adminListPayments: 0,
    adminListBanners: 0,
    adminListCategories: 0,
    adminListChatbotEntries: 0,
    adminGetSubscription: [],
    adminSetCustomerBlocked: [],
    adminSetMobileVerification: [],
    adminCreatePlan: [],
    adminUpdatePlan: [],
    adminDeletePlan: [],
    adminCreateBanner: [],
    adminUpdateBanner: [],
    adminSetBannerEnabled: [],
    adminReorderBanner: [],
    adminDeleteBanner: [],
    adminCreateCategory: [],
    adminUpdateCategory: [],
    adminDeleteCategory: [],
    adminCreateChatbotEntry: [],
    adminUpdateChatbotEntry: [],
    adminDeleteChatbotEntry: [],
    adminConfirmPayment: [],
    adminRejectPayment: [],
  };

  const published = () => listings.filter((l) => l.published);

  /**
   * The active plan's allowances for the signed-in customer, mirroring the
   * backend's limit checks. `undefined` means the plan is unlimited.
   */
  const activeAllowances = (): {
    listingAllowance: bigint | undefined;
    imageAllowance: bigint | undefined;
  } => {
    const planId = account?.subscription?.planId;
    const plan = plans.find((p) => p.id === planId);
    return {
      listingAllowance: plan?.listingAllowance,
      imageAllowance: plan?.imageAllowance,
    };
  };

  /** The customer's own listings, used for the listing-count limit. */
  const myListings = () => listings;

  const matches = (listing: Listing, filter: ListingFilter): boolean => {
    if (filter.listingType && listing.listingType !== filter.listingType) {
      return false;
    }
    if (filter.propertyType && listing.propertyType !== filter.propertyType) {
      return false;
    }
    if (filter.minPrice !== undefined && listing.price < filter.minPrice) {
      return false;
    }
    if (filter.maxPrice !== undefined && listing.price > filter.maxPrice) {
      return false;
    }
    if (
      filter.minBedrooms !== undefined &&
      listing.bedrooms < filter.minBedrooms
    ) {
      return false;
    }
    if (filter.location) {
      const needle = filter.location.toLowerCase();
      const haystack =
        `${listing.city} ${listing.region} ${listing.country}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (filter.keyword) {
      const needle = filter.keyword.toLowerCase();
      const haystack =
        `${listing.title} ${listing.description} ${listing.city} ${listing.region}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  };

  return {
    listings,
    enquiries,
    plans,
    banners,
    categories,
    chatbotEntries,
    payments,
    customers,
    calls,
    async listPublishedListings() {
      calls.listPublishedListings += 1;
      return published();
    },
    async searchListings(filter) {
      calls.searchListings.push(filter);
      return published().filter((l) => matches(l, filter));
    },
    async getListing(id) {
      calls.getListing.push(id);
      return published().find((l) => l.id === id) ?? null;
    },
    async submitEnquiry(input) {
      calls.submitEnquiry.push(input);
      const listing = listings.find((l) => l.id === input.listingId);
      if (!listing) {
        return {
          __kind__: "err",
          err: {
            __kind__: "listingNotFound",
            listingNotFound: input.listingId,
          },
        };
      }
      if (!listing.published) {
        return {
          __kind__: "err",
          err: {
            __kind__: "listingNotPublished",
            listingNotPublished: input.listingId,
          },
        };
      }
      nextEnquiryId += 1n;
      const enquiry: Enquiry = {
        id: nextEnquiryId,
        listingId: input.listingId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        read: false,
        createdAt: 1_700_000_000_000_000_000n,
      };
      enquiries.push(enquiry);
      return { __kind__: "ok", ok: enquiry };
    },
    async adminListListings() {
      calls.adminListListings += 1;
      return listings.map((listing) =>
        makeSummary(
          listing,
          BigInt(enquiries.filter((e) => e.listingId === listing.id).length),
        ),
      );
    },
    async adminGetListing(id) {
      calls.adminGetListing.push(id);
      return listings.find((l) => l.id === id) ?? null;
    },
    async adminCreateListing(input) {
      calls.adminCreateListing.push(input);
      nextListingId += 1n;
      const listing: Listing = {
        ...input,
        id: nextListingId,
        published: false,
        featured: false,
        blocked: false,
        createdAt: 1_700_000_000_000_000_000n,
        updatedAt: 1_700_000_000_000_000_000n,
      };
      listings.push(listing);
      return { __kind__: "ok", ok: listing };
    },
    async adminUpdateListing(id, patch) {
      calls.adminUpdateListing.push({ id, patch });
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const updated: Listing = {
        ...listings[index],
        ...patch,
        updatedAt: 1_700_000_000_000_000_000n,
      };
      listings[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminSetListingPublished(id, isPublished) {
      calls.adminSetListingPublished.push({ id, published: isPublished });
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const updated: Listing = { ...listings[index], published: isPublished };
      listings[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminSetListingFeatured(id, featured) {
      calls.adminSetListingFeatured.push({ id, featured });
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const updated: Listing = { ...listings[index], featured };
      listings[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminSetListingBlocked(id, blocked) {
      calls.adminSetListingBlocked.push({ id, blocked });
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const updated: Listing = { ...listings[index], blocked };
      listings[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminDeleteListing(id) {
      calls.adminDeleteListing.push(id);
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      listings.splice(index, 1);
      for (let i = enquiries.length - 1; i >= 0; i -= 1) {
        if (enquiries[i].listingId === id) enquiries.splice(i, 1);
      }
      return { __kind__: "ok", ok: null };
    },
    async adminAddListingPhotos(id, photos) {
      calls.adminAddListingPhotos.push({ id, photos });
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const updated: Listing = {
        ...listings[index],
        photos: [...listings[index].photos, ...photos],
      };
      listings[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminRemoveListingPhoto(id, index) {
      calls.adminRemoveListingPhoto.push({ id, index });
      const listingIndex = listings.findIndex((l) => l.id === id);
      if (listingIndex === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const photos = [...listings[listingIndex].photos];
      photos.splice(Number(index), 1);
      const updated: Listing = { ...listings[listingIndex], photos };
      listings[listingIndex] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminListEnquiries() {
      calls.adminListEnquiries += 1;
      return enquiries.map((enquiry) =>
        makeAdminEnquiry(
          enquiry,
          listings.find((l) => l.id === enquiry.listingId)?.title ?? "",
        ),
      );
    },
    async adminSetEnquiryRead(id, read) {
      calls.adminSetEnquiryRead.push({ id, read });
      const index = enquiries.findIndex((e) => e.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const updated: Enquiry = { ...enquiries[index], read };
      enquiries[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminDeleteEnquiry(id) {
      calls.adminDeleteEnquiry.push(id);
      const index = enquiries.findIndex((e) => e.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      enquiries.splice(index, 1);
      return { __kind__: "ok", ok: null };
    },
    async isCallerAdmin() {
      return seed?.isAdmin ?? false;
    },
    async listPlans() {
      calls.listPlans += 1;
      return plans.filter((plan) => plan.active);
    },
    async getPlan(id) {
      calls.getPlan.push(id);
      return plans.find((plan) => plan.id === id) ?? null;
    },
    async listBanners() {
      calls.listBanners += 1;
      return banners.filter((banner) => banner.enabled);
    },
    async listCategories() {
      calls.listCategories += 1;
      return categories.filter((category) => category.enabled);
    },
    async listChatbotEntries() {
      calls.listChatbotEntries += 1;
      return chatbotEntries.filter((entry) => entry.enabled);
    },
    async getMyAccount() {
      calls.getMyAccount += 1;
      return account;
    },
    async getMyPayments() {
      calls.getMyPayments += 1;
      return payments;
    },
    async getMySubscription() {
      calls.getMySubscription += 1;
      return account?.subscription ?? null;
    },
    async getMyListings() {
      calls.getMyListings += 1;
      return listings;
    },
    async getMyListing(id) {
      calls.getMyListing.push(id);
      return listings.find((l) => l.id === id) ?? null;
    },
    async registerCustomer(input) {
      calls.registerCustomer.push(input);
      const customer = makeCustomer({
        name: input.name,
        email: input.email,
        phone: input.phone,
        whatsapp: input.whatsapp,
        company: input.company,
        address: input.address,
      });
      account = { customer };
      customers.push(account);
      return { __kind__: "ok", ok: customer };
    },
    async updateMyProfile(input) {
      calls.updateMyProfile.push(input);
      if (!account) {
        return {
          __kind__: "err",
          err: { __kind__: "notRegistered", notRegistered: null },
        };
      }
      const customer: Customer = { ...account.customer, ...input };
      account = { ...account, customer };
      return { __kind__: "ok", ok: customer };
    },
    async requestEmailVerification(email) {
      calls.requestEmailVerification.push(email);
      if (!account) {
        return {
          __kind__: "err",
          err: { __kind__: "notRegistered", notRegistered: null },
        };
      }
      const customer: Customer = {
        ...account.customer,
        emailVerification: EmailVerification.pending,
      };
      account = { ...account, customer };
      return { __kind__: "ok", ok: null };
    },
    async confirmEmailVerification(code) {
      calls.confirmEmailVerification.push(code);
      if (!account) {
        return {
          __kind__: "err",
          err: { __kind__: "notRegistered", notRegistered: null },
        };
      }
      if (code.trim() !== "123456") {
        return {
          __kind__: "err",
          err: { __kind__: "invalidCode", invalidCode: null },
        };
      }
      const customer: Customer = {
        ...account.customer,
        emailVerification: EmailVerification.verified,
      };
      account = { ...account, customer };
      return { __kind__: "ok", ok: customer };
    },
    async submitMobileNumber(phone) {
      calls.submitMobileNumber.push(phone);
      if (!account) {
        return {
          __kind__: "err",
          err: { __kind__: "notRegistered", notRegistered: null },
        };
      }
      const customer: Customer = {
        ...account.customer,
        phone,
        mobileVerification: MobileVerification.pendingReview,
      };
      account = { ...account, customer };
      return { __kind__: "ok", ok: customer };
    },
    async submitPayment(planId, reference) {
      calls.submitPayment.push({ planId, reference });
      if (!account) {
        return {
          __kind__: "err",
          err: { __kind__: "notRegistered", notRegistered: null },
        };
      }
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        return {
          __kind__: "err",
          err: { __kind__: "planNotFound", planNotFound: planId },
        };
      }
      nextPaymentId += 1n;
      const payment: Payment = {
        id: nextPaymentId,
        status: PaymentStatus.pending,
        customer: account.customer.principal,
        planId,
        reference,
        submittedAt: 1_700_000_000_000_000_000n,
        amount: plan.price,
        planName: plan.name,
      };
      payments.push(payment);
      return { __kind__: "ok", ok: payment };
    },
    async createMyListing(input) {
      calls.createMyListing.push(input);
      if (!account?.subscription) {
        return {
          __kind__: "err",
          err: { __kind__: "noActiveSubscription", noActiveSubscription: null },
        };
      }
      const { listingAllowance } = activeAllowances();
      if (
        listingAllowance !== undefined &&
        BigInt(myListings().length) >= listingAllowance
      ) {
        return {
          __kind__: "err",
          err: {
            __kind__: "listingLimitReached",
            listingLimitReached: listingAllowance,
          },
        };
      }
      nextListingId += 1n;
      const listing: Listing = {
        ...input,
        id: nextListingId,
        published: false,
        featured: false,
        blocked: false,
        createdAt: 1_700_000_000_000_000_000n,
        updatedAt: 1_700_000_000_000_000_000n,
      };
      listings.push(listing);
      return { __kind__: "ok", ok: listing };
    },
    async updateMyListing(id, patch) {
      calls.updateMyListing.push({ id, patch });
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const updated: Listing = {
        ...listings[index],
        ...patch,
        updatedAt: 1_700_000_000_000_000_000n,
      };
      listings[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async deleteMyListing(id) {
      calls.deleteMyListing.push(id);
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      listings.splice(index, 1);
      return { __kind__: "ok", ok: null };
    },
    async addMyListingPhotos(id, photos) {
      calls.addMyListingPhotos.push({ id, photos });
      const index = listings.findIndex((l) => l.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const { imageAllowance } = activeAllowances();
      if (
        imageAllowance !== undefined &&
        BigInt(listings[index].photos.length + photos.length) > imageAllowance
      ) {
        return {
          __kind__: "err",
          err: {
            __kind__: "imageLimitReached",
            imageLimitReached: imageAllowance,
          },
        };
      }
      const updated: Listing = {
        ...listings[index],
        photos: [...listings[index].photos, ...photos],
      };
      listings[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async removeMyListingPhoto(id, index) {
      calls.removeMyListingPhoto.push({ id, index });
      const listingIndex = listings.findIndex((l) => l.id === id);
      if (listingIndex === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const photos = [...listings[listingIndex].photos];
      photos.splice(Number(index), 1);
      const updated: Listing = { ...listings[listingIndex], photos };
      listings[listingIndex] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminListCustomers() {
      calls.adminListCustomers += 1;
      return customers;
    },
    async adminListPlans() {
      calls.adminListPlans += 1;
      return plans;
    },
    async adminListPayments() {
      calls.adminListPayments += 1;
      return payments.map((payment) =>
        makeAdminPayment(
          payment,
          account?.customer.name ?? "Amara Perera",
          account?.customer.email ?? "amara@example.com",
        ),
      );
    },
    async adminListBanners() {
      calls.adminListBanners += 1;
      return banners;
    },
    async adminListCategories() {
      calls.adminListCategories += 1;
      return categories;
    },
    async adminListChatbotEntries() {
      calls.adminListChatbotEntries += 1;
      return chatbotEntries;
    },
    async adminGetSubscription(customer) {
      calls.adminGetSubscription.push(customer);
      return account?.subscription ?? null;
    },
    async adminSetCustomerBlocked(customer, blocked) {
      calls.adminSetCustomerBlocked.push({ customer, blocked });
      if (!account) {
        return {
          __kind__: "err",
          err: { __kind__: "notFound", notFound: customer },
        };
      }
      const updated: Customer = { ...account.customer, blocked };
      account = { ...account, customer: updated };
      customers[0] = account;
      return { __kind__: "ok", ok: updated };
    },
    async adminSetMobileVerification(customer, state) {
      calls.adminSetMobileVerification.push({ customer, state });
      if (!account) {
        return {
          __kind__: "err",
          err: { __kind__: "notFound", notFound: customer },
        };
      }
      const updated: Customer = {
        ...account.customer,
        mobileVerification: state,
      };
      account = { ...account, customer: updated };
      customers[0] = account;
      return { __kind__: "ok", ok: updated };
    },
    async adminCreatePlan(input) {
      calls.adminCreatePlan.push(input);
      const id = plans.reduce((max, p) => (p.id >= max ? p.id + 1n : max), 1n);
      const plan: Plan = { ...input, id };
      plans.push(plan);
      return { __kind__: "ok", ok: plan };
    },
    async adminUpdatePlan(id, input) {
      calls.adminUpdatePlan.push({ id, input });
      const index = plans.findIndex((p) => p.id === id);
      if (index === -1) {
        return {
          __kind__: "err",
          err: { __kind__: "planNotFound", planNotFound: id },
        };
      }
      const plan: Plan = { ...input, id };
      plans[index] = plan;
      return { __kind__: "ok", ok: plan };
    },
    async adminDeletePlan(id) {
      calls.adminDeletePlan.push(id);
      const index = plans.findIndex((p) => p.id === id);
      if (index === -1) {
        return {
          __kind__: "err",
          err: { __kind__: "planNotFound", planNotFound: id },
        };
      }
      plans.splice(index, 1);
      return { __kind__: "ok", ok: null };
    },
    async adminCreateBanner(input) {
      calls.adminCreateBanner.push(input);
      const id = banners.reduce(
        (max, b) => (b.id >= max ? b.id + 1n : max),
        1n,
      );
      const banner: Banner = {
        ...input,
        id,
        createdAt: 1_700_000_000_000_000_000n,
        updatedAt: 1_700_000_000_000_000_000n,
      };
      banners.push(banner);
      return { __kind__: "ok", ok: banner };
    },
    async adminUpdateBanner(id, input) {
      calls.adminUpdateBanner.push({ id, input });
      const index = banners.findIndex((b) => b.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const banner: Banner = {
        ...banners[index],
        ...input,
        updatedAt: 1_700_000_000_000_000_000n,
      };
      banners[index] = banner;
      return { __kind__: "ok", ok: banner };
    },
    async adminSetBannerEnabled(id, enabled) {
      calls.adminSetBannerEnabled.push({ id, enabled });
      const index = banners.findIndex((b) => b.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const banner: Banner = { ...banners[index], enabled };
      banners[index] = banner;
      return { __kind__: "ok", ok: banner };
    },
    async adminReorderBanner(id, sortOrder) {
      calls.adminReorderBanner.push({ id, sortOrder });
      const index = banners.findIndex((b) => b.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const banner: Banner = { ...banners[index], sortOrder };
      banners[index] = banner;
      return { __kind__: "ok", ok: banner };
    },
    async adminDeleteBanner(id) {
      calls.adminDeleteBanner.push(id);
      const index = banners.findIndex((b) => b.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      banners.splice(index, 1);
      return { __kind__: "ok", ok: null };
    },
    async adminCreateCategory(input) {
      calls.adminCreateCategory.push(input);
      const id = categories.reduce(
        (max, c) => (c.id >= max ? c.id + 1n : max),
        1n,
      );
      const category: Category = { ...input, id };
      categories.push(category);
      return { __kind__: "ok", ok: category };
    },
    async adminUpdateCategory(id, input) {
      calls.adminUpdateCategory.push({ id, input });
      const index = categories.findIndex((c) => c.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const category: Category = { ...input, id };
      categories[index] = category;
      return { __kind__: "ok", ok: category };
    },
    async adminDeleteCategory(id) {
      calls.adminDeleteCategory.push(id);
      const index = categories.findIndex((c) => c.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      categories.splice(index, 1);
      return { __kind__: "ok", ok: null };
    },
    async adminCreateChatbotEntry(input) {
      calls.adminCreateChatbotEntry.push(input);
      const id = chatbotEntries.reduce(
        (max, e) => (e.id >= max ? e.id + 1n : max),
        1n,
      );
      const entry: ChatbotEntry = {
        ...input,
        id,
        updatedAt: 1_700_000_000_000_000_000n,
      };
      chatbotEntries.push(entry);
      return { __kind__: "ok", ok: entry };
    },
    async adminUpdateChatbotEntry(id, input) {
      calls.adminUpdateChatbotEntry.push({ id, input });
      const index = chatbotEntries.findIndex((e) => e.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      const entry: ChatbotEntry = {
        ...input,
        id,
        updatedAt: 1_700_000_000_000_000_000n,
      };
      chatbotEntries[index] = entry;
      return { __kind__: "ok", ok: entry };
    },
    async adminDeleteChatbotEntry(id) {
      calls.adminDeleteChatbotEntry.push(id);
      const index = chatbotEntries.findIndex((e) => e.id === id);
      if (index === -1) {
        return { __kind__: "err", err: { __kind__: "notFound", notFound: id } };
      }
      chatbotEntries.splice(index, 1);
      return { __kind__: "ok", ok: null };
    },
    async adminConfirmPayment(id) {
      calls.adminConfirmPayment.push(id);
      const index = payments.findIndex((p) => p.id === id);
      if (index === -1) {
        return {
          __kind__: "err",
          err: { __kind__: "paymentNotFound", paymentNotFound: id },
        };
      }
      const updated: Payment = {
        ...payments[index],
        status: PaymentStatus.confirmed,
        reviewedAt: 1_700_000_000_000_000_000n,
      };
      payments[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
    async adminRejectPayment(id) {
      calls.adminRejectPayment.push(id);
      const index = payments.findIndex((p) => p.id === id);
      if (index === -1) {
        return {
          __kind__: "err",
          err: { __kind__: "paymentNotFound", paymentNotFound: id },
        };
      }
      const updated: Payment = {
        ...payments[index],
        status: PaymentStatus.rejected,
        reviewedAt: 1_700_000_000_000_000_000n,
      };
      payments[index] = updated;
      return { __kind__: "ok", ok: updated };
    },
  };
}
