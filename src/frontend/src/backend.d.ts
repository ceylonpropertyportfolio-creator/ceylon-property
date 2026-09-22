import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AdminEnquiry {
    listingTitle: string;
    enquiry: Enquiry;
}
export interface AdminListingSummary {
    listing: Listing;
    enquiryCount: bigint;
}
export interface AdminPayment {
    customerName: string;
    customerEmail: string;
    payment: Payment;
}
export interface Banner {
    id: BannerId;
    title: string;
    linkUrl: string;
    sortOrder: bigint;
    createdAt: Timestamp;
    enabled: boolean;
    updatedAt: Timestamp;
    image?: Photo;
    subtitle: string;
}
export type BannerId = bigint;
export interface BannerInput {
    title: string;
    linkUrl: string;
    sortOrder: bigint;
    enabled: boolean;
    image?: Photo;
    subtitle: string;
}
export interface Category {
    id: CategoryId;
    sortOrder: bigint;
    name: string;
    slug: string;
    description: string;
    enabled: boolean;
}
export type CategoryId = bigint;
export interface CategoryInput {
    sortOrder: bigint;
    name: string;
    slug: string;
    description: string;
    enabled: boolean;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface ChatbotEntry {
    id: ChatbotEntryId;
    question: string;
    sortOrder: bigint;
    answer: string;
    enabled: boolean;
    keywords: Array<string>;
    updatedAt: Timestamp;
}
export type ChatbotEntryId = bigint;
export interface ChatbotEntryInput {
    question: string;
    sortOrder: bigint;
    answer: string;
    enabled: boolean;
    keywords: Array<string>;
}
export type ContentError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "notFound";
    notFound: bigint;
} | {
    __kind__: "bannerLimitReached";
    bannerLimitReached: bigint;
};
export interface Customer {
    principal: CustomerId;
    blocked: boolean;
    mobileVerification: MobileVerification;
    name: string;
    createdAt: Timestamp;
    whatsapp: string;
    email: string;
    updatedAt: Timestamp;
    company: string;
    address: string;
    phone: string;
    emailVerification: EmailVerification;
}
export interface CustomerAccount {
    customer: Customer;
    subscription?: Subscription;
}
export type CustomerError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "notFound";
    notFound: CustomerId;
} | {
    __kind__: "invalidCode";
    invalidCode: null;
} | {
    __kind__: "alreadyRegistered";
    alreadyRegistered: null;
} | {
    __kind__: "notRegistered";
    notRegistered: null;
};
export type CustomerId = Principal;
export interface CustomerProfileInput {
    name: string;
    whatsapp: string;
    email: string;
    company: string;
    address: string;
    phone: string;
}
export interface Enquiry {
    id: EnquiryId;
    listingId: ListingId;
    name: string;
    createdAt: Timestamp;
    read: boolean;
    email: string;
    message: string;
    phone: string;
}
export type EnquiryAdminError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "notFound";
    notFound: EnquiryId;
};
export type EnquiryError = {
    __kind__: "listingNotPublished";
    listingNotPublished: ListingId;
} | {
    __kind__: "listingNotFound";
    listingNotFound: ListingId;
};
export type EnquiryId = bigint;
export interface EnquiryInput {
    listingId: ListingId;
    name: string;
    email: string;
    message: string;
    phone: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Listing {
    id: ListingId;
    region: string;
    title: string;
    featured: boolean;
    postcode: string;
    country: string;
    propertyType: PropertyType;
    bedrooms: bigint;
    owner?: CustomerId;
    area: bigint;
    city: string;
    blocked: boolean;
    published: boolean;
    createdAt: Timestamp;
    description: string;
    listingType: ListingType;
    updatedAt: Timestamp;
    currency: string;
    addressLine: string;
    bathrooms: bigint;
    price: bigint;
    photos: Array<Photo>;
}
export type ListingError = {
    __kind__: "listingLimitReached";
    listingLimitReached: bigint;
} | {
    __kind__: "noActiveSubscription";
    noActiveSubscription: null;
} | {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "imageLimitReached";
    imageLimitReached: bigint;
} | {
    __kind__: "notFound";
    notFound: ListingId;
};
export interface ListingFilter {
    propertyType?: PropertyType;
    minBedrooms?: bigint;
    maxPrice?: bigint;
    listingType?: ListingType;
    keyword?: string;
    minPrice?: bigint;
    location?: string;
}
export type ListingId = bigint;
export interface ListingInput {
    region: string;
    title: string;
    postcode: string;
    country: string;
    propertyType: PropertyType;
    bedrooms: bigint;
    area: bigint;
    city: string;
    description: string;
    listingType: ListingType;
    currency: string;
    addressLine: string;
    bathrooms: bigint;
    price: bigint;
    photos: Array<Photo>;
}
export interface ListingUpdate {
    region?: string;
    title?: string;
    postcode?: string;
    country?: string;
    propertyType?: PropertyType;
    bedrooms?: bigint;
    area?: bigint;
    city?: string;
    description?: string;
    listingType?: ListingType;
    currency?: string;
    addressLine?: string;
    bathrooms?: bigint;
    price?: bigint;
    photos?: Array<Photo>;
}
export interface Payment {
    id: PaymentId;
    status: PaymentStatus;
    customer: CustomerId;
    planId: PlanId;
    reference: string;
    submittedAt: Timestamp;
    reviewedAt?: Timestamp;
    periodEnd?: Timestamp;
    periodStart?: Timestamp;
    amount: bigint;
    planName: string;
}
export type PaymentError = {
    __kind__: "planNotFound";
    planNotFound: PlanId;
} | {
    __kind__: "listingLimitReached";
    listingLimitReached: bigint;
} | {
    __kind__: "noActiveSubscription";
    noActiveSubscription: null;
} | {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "imageLimitReached";
    imageLimitReached: bigint;
} | {
    __kind__: "paymentNotFound";
    paymentNotFound: PaymentId;
} | {
    __kind__: "notRegistered";
    notRegistered: null;
};
export type PaymentId = bigint;
export interface Photo {
    blob: Uint8Array;
    filename: string;
}
export interface Plan {
    id: PlanId;
    features: Array<string>;
    active: boolean;
    sortOrder: bigint;
    name: string;
    listingAllowance?: bigint;
    billingPeriod: string;
    imageAllowance?: bigint;
    price: bigint;
}
export type PlanId = bigint;
export interface PlanInput {
    features: Array<string>;
    active: boolean;
    sortOrder: bigint;
    name: string;
    listingAllowance?: bigint;
    billingPeriod: string;
    imageAllowance?: bigint;
    price: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: Customer;
} | {
    __kind__: "err";
    err: CustomerError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: Listing;
} | {
    __kind__: "err";
    err: ListingError;
};
export type Result_10 = {
    __kind__: "ok";
    ok: Enquiry;
} | {
    __kind__: "err";
    err: EnquiryAdminError;
};
export type Result_11 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: PaymentError;
};
export type Result_12 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: ContentError;
};
export type Result_13 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Result_2 = {
    __kind__: "ok";
    ok: Payment;
} | {
    __kind__: "err";
    err: PaymentError;
};
export type Result_3 = {
    __kind__: "ok";
    ok: Enquiry;
} | {
    __kind__: "err";
    err: EnquiryError;
};
export type Result_4 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: CustomerError;
};
export type Result_5 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: ListingError;
};
export type Result_6 = {
    __kind__: "ok";
    ok: Plan;
} | {
    __kind__: "err";
    err: PaymentError;
};
export type Result_7 = {
    __kind__: "ok";
    ok: ChatbotEntry;
} | {
    __kind__: "err";
    err: ContentError;
};
export type Result_8 = {
    __kind__: "ok";
    ok: Category;
} | {
    __kind__: "err";
    err: ContentError;
};
export type Result_9 = {
    __kind__: "ok";
    ok: Banner;
} | {
    __kind__: "err";
    err: ContentError;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Subscription {
    status: SubscriptionStatus;
    startedAt: Timestamp;
    expiresAt: Timestamp;
    planId: PlanId;
    billingPeriod: string;
    renewedAt?: Timestamp;
    price: bigint;
    planName: string;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum EmailVerification {
    verified = "verified",
    pending = "pending",
    unverified = "unverified"
}
export enum ListingType {
    rent = "rent",
    sale = "sale"
}
export enum MobileVerification {
    pendingReview = "pendingReview",
    notSubmitted = "notSubmitted",
    approved = "approved",
    rejected = "rejected"
}
export enum PaymentStatus {
    pending = "pending",
    rejected = "rejected",
    confirmed = "confirmed"
}
export enum PropertyType {
    commercial = "commercial",
    house = "house",
    other = "other",
    land = "land",
    condo = "condo",
    apartment = "apartment",
    townhouse = "townhouse"
}
export enum SubscriptionStatus {
    active = "active",
    expired = "expired"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Appends photos to one of the calling customer's own listings, enforcing
     * / the plan's image allowance.
     */
    addMyListingPhotos(id: ListingId, photos: Array<Photo>): Promise<Result_1>;
    /**
     * / Appends uploaded photos to a listing. Admin only.
     */
    adminAddListingPhotos(id: ListingId, photos: Array<Photo>): Promise<Result_1>;
    /**
     * / Confirms a submitted payment and activates or renews the subscription.
     * / Admin only.
     */
    adminConfirmPayment(id: PaymentId): Promise<Result_2>;
    /**
     * / Creates a banner. Admin only.
     */
    adminCreateBanner(input: BannerInput): Promise<Result_9>;
    /**
     * / Creates a category. Admin only.
     */
    adminCreateCategory(input: CategoryInput): Promise<Result_8>;
    /**
     * / Creates a chatbot entry. Admin only.
     */
    adminCreateChatbotEntry(input: ChatbotEntryInput): Promise<Result_7>;
    /**
     * / Creates a listing. Admin only.
     */
    adminCreateListing(input: ListingInput): Promise<Result_1>;
    /**
     * / Creates a plan. Admin only.
     */
    adminCreatePlan(input: PlanInput): Promise<Result_6>;
    /**
     * / Deletes a banner. Admin only.
     */
    adminDeleteBanner(id: BannerId): Promise<Result_12>;
    /**
     * / Deletes a category. Admin only.
     */
    adminDeleteCategory(id: CategoryId): Promise<Result_12>;
    /**
     * / Deletes a chatbot entry. Admin only.
     */
    adminDeleteChatbotEntry(id: ChatbotEntryId): Promise<Result_12>;
    /**
     * / Deletes an enquiry. Admin only.
     */
    adminDeleteEnquiry(id: EnquiryId): Promise<Result_5>;
    /**
     * / Deletes a listing and its enquiries. Admin only.
     */
    adminDeleteListing(id: ListingId): Promise<Result_5>;
    /**
     * / Deletes a plan. Admin only.
     */
    adminDeletePlan(id: PlanId): Promise<Result_11>;
    /**
     * / Returns a single listing regardless of published state. Admin only.
     */
    adminGetListing(id: ListingId): Promise<Listing | null>;
    /**
     * / Returns a customer's subscription. Admin only.
     */
    adminGetSubscription(customer: CustomerId): Promise<Subscription | null>;
    /**
     * / Returns every banner, enabled or not. Admin only.
     */
    adminListBanners(): Promise<Array<Banner>>;
    /**
     * / Returns every category, enabled or not. Admin only.
     */
    adminListCategories(): Promise<Array<Category>>;
    /**
     * / Returns every chatbot entry, enabled or not. Admin only.
     */
    adminListChatbotEntries(): Promise<Array<ChatbotEntry>>;
    /**
     * / Returns every customer account. Admin only.
     */
    adminListCustomers(): Promise<Array<CustomerAccount>>;
    /**
     * / Returns every enquiry, newest first, each with its listing title. Admin only.
     */
    adminListEnquiries(): Promise<Array<AdminEnquiry>>;
    /**
     * / Returns every listing with its enquiry count, newest first. Admin only.
     */
    adminListListings(): Promise<Array<AdminListingSummary>>;
    /**
     * / Returns every payment with its customer's details. Admin only.
     */
    adminListPayments(): Promise<Array<AdminPayment>>;
    /**
     * / Returns every plan, active or not. Admin only.
     */
    adminListPlans(): Promise<Array<Plan>>;
    /**
     * / Rejects a submitted payment. Admin only.
     */
    adminRejectPayment(id: PaymentId): Promise<Result_2>;
    /**
     * / Removes the photo at `index` from a listing. Admin only.
     */
    adminRemoveListingPhoto(id: ListingId, index: bigint): Promise<Result_1>;
    /**
     * / Moves a banner to a new slider position. Admin only.
     */
    adminReorderBanner(id: BannerId, sortOrder: bigint): Promise<Result_9>;
    /**
     * / Enables or disables a banner. Admin only.
     */
    adminSetBannerEnabled(id: BannerId, enabled: boolean): Promise<Result_9>;
    /**
     * / Blocks or unblocks a customer account. Admin only.
     */
    adminSetCustomerBlocked(customer: CustomerId, blocked: boolean): Promise<Result>;
    /**
     * / Sets the read flag on an enquiry. Admin only.
     */
    adminSetEnquiryRead(id: EnquiryId, read: boolean): Promise<Result_10>;
    /**
     * / Blocks or unblocks a listing. Admin only.
     */
    adminSetListingBlocked(id: ListingId, blocked: boolean): Promise<Result_1>;
    /**
     * / Features or unfeatures a listing. Admin only.
     */
    adminSetListingFeatured(id: ListingId, featured: boolean): Promise<Result_1>;
    /**
     * / Publishes or unpublishes a listing. Admin only.
     */
    adminSetListingPublished(id: ListingId, published: boolean): Promise<Result_1>;
    /**
     * / Approves or rejects a customer's submitted mobile number. Admin only.
     */
    adminSetMobileVerification(customer: CustomerId, state: MobileVerification): Promise<Result>;
    /**
     * / Applies a full edit to a banner. Admin only.
     */
    adminUpdateBanner(id: BannerId, input: BannerInput): Promise<Result_9>;
    /**
     * / Applies a full edit to a category. Admin only.
     */
    adminUpdateCategory(id: CategoryId, input: CategoryInput): Promise<Result_8>;
    /**
     * / Applies a full edit to a chatbot entry. Admin only.
     */
    adminUpdateChatbotEntry(id: ChatbotEntryId, input: ChatbotEntryInput): Promise<Result_7>;
    /**
     * / Applies a partial update to a listing. Admin only.
     */
    adminUpdateListing(id: ListingId, patch: ListingUpdate): Promise<Result_1>;
    /**
     * / Applies a full edit to a plan. Admin only.
     */
    adminUpdatePlan(id: PlanId, input: PlanInput): Promise<Result_6>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Confirms the email verification code.
     */
    confirmEmailVerification(code: string): Promise<Result>;
    /**
     * / Creates a listing owned by the calling customer. Requires an active
     * / subscription and enforces the plan's listing and image allowances.
     */
    createMyListing(input: ListingInput): Promise<Result_1>;
    /**
     * / Deletes one of the calling customer's own listings.
     */
    deleteMyListing(id: ListingId): Promise<Result_5>;
    execute(qJson: string): Promise<Result__1>;
    /**
     * / Returns the backend API reference as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Returns a single published listing, or `null` when it does not exist or is
     * / not published.
     */
    getListing(id: ListingId): Promise<Listing | null>;
    /**
     * / Returns the calling customer's account with its subscription summary.
     */
    getMyAccount(): Promise<CustomerAccount | null>;
    /**
     * / Returns one of the calling customer's own listings, or `null`.
     */
    getMyListing(id: ListingId): Promise<Listing | null>;
    /**
     * / Returns the calling customer's own listings, newest first.
     */
    getMyListings(): Promise<Array<Listing>>;
    /**
     * / Returns the calling customer's payment history, newest first.
     */
    getMyPayments(): Promise<Array<Payment>>;
    /**
     * / Returns the calling customer's subscription, or `null` when none exists.
     */
    getMySubscription(): Promise<Subscription | null>;
    /**
     * / Returns a single plan, or `null` when it does not exist.
     */
    getPlan(id: PlanId): Promise<Plan | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Returns the enabled homepage banners ordered by `sortOrder`.
     */
    listBanners(): Promise<Array<Banner>>;
    /**
     * / Returns the enabled advertising categories ordered by `sortOrder`.
     */
    listCategories(): Promise<Array<Category>>;
    /**
     * / Returns the enabled help chatbot entries ordered by `sortOrder`.
     */
    listChatbotEntries(): Promise<Array<ChatbotEntry>>;
    /**
     * / Returns the featured published listings, newest first.
     */
    listFeaturedListings(): Promise<Array<Listing>>;
    /**
     * / Returns every active plan ordered by `sortOrder`.
     */
    listPlans(): Promise<Array<Plan>>;
    /**
     * / Returns every published listing, newest first.
     */
    listPublishedListings(): Promise<Array<Listing>>;
    /**
     * / Registers the calling principal as a customer.
     */
    registerCustomer(input: CustomerProfileInput): Promise<Result>;
    /**
     * / Removes the photo at `index` from one of the calling customer's own
     * / listings.
     */
    removeMyListingPhoto(id: ListingId, index: bigint): Promise<Result_1>;
    /**
     * / Requests an email verification code for the supplied address.
     */
    requestEmailVerification(email: string): Promise<Result_4>;
    schema(): Promise<string>;
    /**
     * / Returns published listings matching the supplied filters, newest first.
     */
    searchListings(filter: ListingFilter): Promise<Array<Listing>>;
    /**
     * / Submits an enquiry against a published listing.
     */
    submitEnquiry(input: EnquiryInput): Promise<Result_3>;
    /**
     * / Records a mobile number for admin review. No SMS provider is configured.
     */
    submitMobileNumber(phone: string): Promise<Result>;
    /**
     * / Submits a payment reference for a plan. The payment stays pending until an
     * / admin confirms it.
     */
    submitPayment(planId: PlanId, reference: string): Promise<Result_2>;
    /**
     * / Applies a partial update to one of the calling customer's own listings.
     */
    updateMyListing(id: ListingId, patch: ListingUpdate): Promise<Result_1>;
    /**
     * / Updates the calling customer's profile.
     */
    updateMyProfile(input: CustomerProfileInput): Promise<Result>;
}
