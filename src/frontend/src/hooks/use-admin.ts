import { createActor } from "@/backend";
import type {
  AdminEnquiry,
  AdminListingSummary,
  AdminPayment,
  Banner,
  BannerId,
  BannerInput,
  Category,
  CategoryId,
  CategoryInput,
  ChatbotEntry,
  ChatbotEntryId,
  ChatbotEntryInput,
  Customer,
  CustomerAccount,
  CustomerId,
  Enquiry,
  EnquiryId,
  Listing,
  ListingId,
  ListingInput,
  ListingUpdate,
  MobileVerification,
  Payment,
  PaymentId,
  Photo,
  Plan,
  PlanId,
  PlanInput,
  Subscription,
} from "@/backend";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { contentKeys } from "@/hooks/use-content";
import { listingKeys } from "@/hooks/use-listings";
import { planKeys } from "@/hooks/use-plans";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Query key root for every admin console read. */
export const adminKeys = {
  all: ["admin"] as const,
  listings: () => [...adminKeys.all, "listings"] as const,
  listing: (id: ListingId) =>
    [...adminKeys.all, "listing", id.toString()] as const,
  enquiries: () => [...adminKeys.all, "enquiries"] as const,
  isAdmin: () => [...adminKeys.all, "isAdmin"] as const,
  customers: () => [...adminKeys.all, "customers"] as const,
  plans: () => [...adminKeys.all, "plans"] as const,
  payments: () => [...adminKeys.all, "payments"] as const,
  banners: () => [...adminKeys.all, "banners"] as const,
  categories: () => [...adminKeys.all, "categories"] as const,
  chatbot: () => [...adminKeys.all, "chatbot"] as const,
};

/** True when the signed-in caller holds the administrator role. */
export function useIsAdmin() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<boolean>({
    queryKey: adminKeys.isAdmin(),
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: isReady,
    retry: false,
  });
  return { ...query, isUnavailable };
}

/** Every listing with its enquiry count, newest first. Admin only. */
export function useAdminListings() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<AdminListingSummary[]>({
    queryKey: adminKeys.listings(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListListings();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** A single listing regardless of published state. Admin only. */
export function useAdminListing(id: ListingId | null) {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Listing | null>({
    queryKey: adminKeys.listing(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.adminGetListing(id);
    },
    enabled: isReady && id !== null,
  });
  return { ...query, isUnavailable };
}

/** Every enquiry, newest first, each with its listing title. Admin only. */
export function useAdminEnquiries() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<AdminEnquiry[]>({
    queryKey: adminKeys.enquiries(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListEnquiries();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** Every customer account with its subscription summary. Admin only. */
export function useAdminCustomers() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<CustomerAccount[]>({
    queryKey: adminKeys.customers(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListCustomers();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** Every plan, active or not, ordered by `sortOrder`. Admin only. */
export function useAdminPlans() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Plan[]>({
    queryKey: adminKeys.plans(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListPlans();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** Every payment with its customer's details, newest first. Admin only. */
export function useAdminPayments() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<AdminPayment[]>({
    queryKey: adminKeys.payments(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListPayments();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** Every banner, enabled or not, ordered by `sortOrder`. Admin only. */
export function useAdminBanners() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Banner[]>({
    queryKey: adminKeys.banners(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListBanners();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** Every advertising category, enabled or not. Admin only. */
export function useAdminCategories() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Category[]>({
    queryKey: adminKeys.categories(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListCategories();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** Every chatbot help entry, enabled or not. Admin only. */
export function useAdminChatbotEntries() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<ChatbotEntry[]>({
    queryKey: adminKeys.chatbot(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListChatbotEntries();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** A customer's subscription, or `null` when none exists. Admin only. */
export function useAdminSubscription(customer: CustomerId | null) {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Subscription | null>({
    queryKey: [...adminKeys.all, "subscription", customer?.toString() ?? ""],
    queryFn: async () => {
      if (!actor || customer === null) return null;
      return actor.adminGetSubscription(customer);
    },
    enabled: isReady && customer !== null,
  });
  return { ...query, isUnavailable };
}

/** Invalidates every admin read plus the public surfaces an admin change feeds. */
function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    void queryClient.invalidateQueries({ queryKey: listingKeys.all });
    void queryClient.invalidateQueries({ queryKey: contentKeys.all });
    void queryClient.invalidateQueries({ queryKey: planKeys.all });
  };
}

/** Creates a listing. Admin only. */
export function useCreateListing() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Listing, Error, ListingInput>({
    mutationFn: async (input: ListingInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminCreateListing(input);
      if (result.__kind__ === "err")
        throw new Error("Could not create the listing.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Applies a partial update to a listing. Admin only. */
export function useUpdateListing() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Listing, Error, { id: ListingId; patch: ListingUpdate }>({
    mutationFn: async ({ id, patch }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminUpdateListing(id, patch);
      if (result.__kind__ === "err")
        throw new Error("Could not save the listing.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Publishes or unpublishes a listing. Admin only. */
export function useSetListingPublished() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Listing, Error, { id: ListingId; published: boolean }>({
    mutationFn: async ({ id, published }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminSetListingPublished(id, published);
      if (result.__kind__ === "err")
        throw new Error("Could not update the listing status.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Features or unfeatures a listing so it is promoted publicly. Admin only. */
export function useSetListingFeatured() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Listing, Error, { id: ListingId; featured: boolean }>({
    mutationFn: async ({ id, featured }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminSetListingFeatured(id, featured);
      if (result.__kind__ === "err")
        throw new Error("Could not update the featured state.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Blocks or unblocks a listing from the public site. Admin only. */
export function useSetListingBlocked() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Listing, Error, { id: ListingId; blocked: boolean }>({
    mutationFn: async ({ id, blocked }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminSetListingBlocked(id, blocked);
      if (result.__kind__ === "err")
        throw new Error("Could not update the blocked state.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Deletes a listing and its enquiries. Admin only. */
export function useDeleteListing() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<null, Error, ListingId>({
    mutationFn: async (id: ListingId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminDeleteListing(id);
      if (result.__kind__ === "err")
        throw new Error("Could not delete the listing.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Appends uploaded photos to a listing. Admin only. */
export function useAddListingPhotos() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Listing, Error, { id: ListingId; photos: Photo[] }>({
    mutationFn: async ({ id, photos }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminAddListingPhotos(id, photos);
      if (result.__kind__ === "err")
        throw new Error("Could not upload the photos.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Removes the photo at `index` from a listing. Admin only. */
export function useRemoveListingPhoto() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Listing, Error, { id: ListingId; index: number }>({
    mutationFn: async ({ id, index }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminRemoveListingPhoto(id, BigInt(index));
      if (result.__kind__ === "err")
        throw new Error("Could not remove the photo.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Sets the read flag on an enquiry. Admin only. */
export function useSetEnquiryRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<Enquiry, Error, { id: EnquiryId; read: boolean }>({
    mutationFn: async ({ id, read }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminSetEnquiryRead(id, read);
      if (result.__kind__ === "err")
        throw new Error("Could not update the enquiry.");
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.enquiries() });
    },
  });
}

/** Deletes an enquiry. Admin only. */
export function useDeleteEnquiry() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<null, Error, EnquiryId>({
    mutationFn: async (id: EnquiryId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminDeleteEnquiry(id);
      if (result.__kind__ === "err")
        throw new Error("Could not delete the enquiry.");
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.enquiries() });
    },
  });
}

/** Blocks or unblocks a customer account. Admin only. */
export function useSetCustomerBlocked() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<
    Customer,
    Error,
    { customer: CustomerId; blocked: boolean }
  >({
    mutationFn: async ({ customer, blocked }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminSetCustomerBlocked(customer, blocked);
      if (result.__kind__ === "err")
        throw new Error("Could not update the customer account.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Approves or rejects a customer's submitted mobile number. Admin only. */
export function useSetMobileVerification() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<
    Customer,
    Error,
    { customer: CustomerId; state: MobileVerification }
  >({
    mutationFn: async ({ customer, state }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminSetMobileVerification(customer, state);
      if (result.__kind__ === "err")
        throw new Error("Could not update the mobile verification state.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Creates a plan. Admin only. */
export function useCreatePlan() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Plan, Error, PlanInput>({
    mutationFn: async (input: PlanInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminCreatePlan(input);
      if (result.__kind__ === "err")
        throw new Error("Could not create the plan.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Applies a full edit to a plan. Admin only. */
export function useUpdatePlan() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Plan, Error, { id: PlanId; input: PlanInput }>({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminUpdatePlan(id, input);
      if (result.__kind__ === "err")
        throw new Error("Could not save the plan.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Deletes a plan. Admin only. */
export function useDeletePlan() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<null, Error, PlanId>({
    mutationFn: async (id: PlanId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminDeletePlan(id);
      if (result.__kind__ === "err")
        throw new Error("Could not delete the plan.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/**
 * Confirms a submitted payment reference and activates the subscription.
 * Admin only — a payment is never marked successful automatically.
 */
export function useConfirmPayment() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Payment, Error, PaymentId>({
    mutationFn: async (id: PaymentId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminConfirmPayment(id);
      if (result.__kind__ === "err")
        throw new Error("Could not confirm the payment.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Rejects a submitted payment. Admin only. */
export function useRejectPayment() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Payment, Error, PaymentId>({
    mutationFn: async (id: PaymentId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminRejectPayment(id);
      if (result.__kind__ === "err")
        throw new Error("Could not reject the payment.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Creates a homepage banner. Admin only. */
export function useCreateBanner() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Banner, Error, BannerInput>({
    mutationFn: async (input: BannerInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminCreateBanner(input);
      if (result.__kind__ === "err")
        throw new Error(bannerErrorMessage(result.err.__kind__));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Applies a full edit to a banner. Admin only. */
export function useUpdateBanner() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Banner, Error, { id: BannerId; input: BannerInput }>({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminUpdateBanner(id, input);
      if (result.__kind__ === "err")
        throw new Error(bannerErrorMessage(result.err.__kind__));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Enables or disables a banner. Admin only. */
export function useSetBannerEnabled() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Banner, Error, { id: BannerId; enabled: boolean }>({
    mutationFn: async ({ id, enabled }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminSetBannerEnabled(id, enabled);
      if (result.__kind__ === "err")
        throw new Error("Could not update the banner.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Moves a banner to a new slider position. Admin only. */
export function useReorderBanner() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Banner, Error, { id: BannerId; sortOrder: bigint }>({
    mutationFn: async ({ id, sortOrder }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminReorderBanner(id, sortOrder);
      if (result.__kind__ === "err")
        throw new Error("Could not reorder the banner.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Deletes a banner. Admin only. */
export function useDeleteBanner() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<null, Error, BannerId>({
    mutationFn: async (id: BannerId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminDeleteBanner(id);
      if (result.__kind__ === "err")
        throw new Error("Could not delete the banner.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Creates an advertising category. Admin only. */
export function useCreateCategory() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Category, Error, CategoryInput>({
    mutationFn: async (input: CategoryInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminCreateCategory(input);
      if (result.__kind__ === "err")
        throw new Error("Could not create the category.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Applies a full edit to a category. Admin only. */
export function useUpdateCategory() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<Category, Error, { id: CategoryId; input: CategoryInput }>(
    {
      mutationFn: async ({ id, input }) => {
        if (!actor) throw new Error("Backend is not ready");
        const result = await actor.adminUpdateCategory(id, input);
        if (result.__kind__ === "err")
          throw new Error("Could not save the category.");
        return result.ok;
      },
      onSuccess: () => {
        invalidate();
      },
    },
  );
}

/** Deletes a category. Admin only. */
export function useDeleteCategory() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<null, Error, CategoryId>({
    mutationFn: async (id: CategoryId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminDeleteCategory(id);
      if (result.__kind__ === "err")
        throw new Error("Could not delete the category.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Creates a chatbot help entry. Admin only. */
export function useCreateChatbotEntry() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<ChatbotEntry, Error, ChatbotEntryInput>({
    mutationFn: async (input: ChatbotEntryInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminCreateChatbotEntry(input);
      if (result.__kind__ === "err")
        throw new Error("Could not create the help entry.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Applies a full edit to a chatbot help entry. Admin only. */
export function useUpdateChatbotEntry() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<
    ChatbotEntry,
    Error,
    { id: ChatbotEntryId; input: ChatbotEntryInput }
  >({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminUpdateChatbotEntry(id, input);
      if (result.__kind__ === "err")
        throw new Error("Could not save the help entry.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Deletes a chatbot help entry. Admin only. */
export function useDeleteChatbotEntry() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateAdmin();
  return useMutation<null, Error, ChatbotEntryId>({
    mutationFn: async (id: ChatbotEntryId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.adminDeleteChatbotEntry(id);
      if (result.__kind__ === "err")
        throw new Error("Could not delete the help entry.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Maps a content error kind onto a message an administrator can act on. */
function bannerErrorMessage(kind: string): string {
  switch (kind) {
    case "bannerLimitReached":
      return "The homepage supports up to 10 banners. Delete one before adding another.";
    case "notAuthorized":
      return "Your administrator session has expired. Sign in again and retry.";
    default:
      return "We could not save the banner. Please try again.";
  }
}
