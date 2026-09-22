import { createActor } from "@/backend";
import type {
  Customer,
  CustomerAccount,
  CustomerProfileInput,
  Listing,
  ListingError,
  ListingId,
  ListingInput,
  ListingUpdate,
  Payment,
  Photo,
  PlanId,
  Subscription,
} from "@/backend";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { listingKeys } from "@/hooks/use-listings";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Query key root for every customer-account read. */
export const customerKeys = {
  all: ["customer"] as const,
  account: () => [...customerKeys.all, "account"] as const,
  payments: () => [...customerKeys.all, "payments"] as const,
  subscription: () => [...customerKeys.all, "subscription"] as const,
  listings: () => [...customerKeys.all, "listings"] as const,
  listing: (id: ListingId) =>
    [...customerKeys.all, "listing", id.toString()] as const,
};

/**
 * The signed-in customer's account with its subscription summary, or `null`
 * when the caller has not registered yet.
 */
export function useMyAccount() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<CustomerAccount | null>({
    queryKey: customerKeys.account(),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyAccount();
    },
    enabled: isReady,
    retry: false,
  });
  return { ...query, isUnavailable };
}

/** The signed-in customer's payment history, newest first. */
export function useMyPayments() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Payment[]>({
    queryKey: customerKeys.payments(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPayments();
    },
    enabled: isReady,
    retry: false,
  });
  return { ...query, isUnavailable };
}

/** The signed-in customer's subscription, or `null` when none exists. */
export function useMySubscription() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Subscription | null>({
    queryKey: customerKeys.subscription(),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMySubscription();
    },
    enabled: isReady,
    retry: false,
  });
  return { ...query, isUnavailable };
}

function useInvalidateCustomer() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: customerKeys.all });
  };
}

/** Registers the calling principal as a customer. */
export function useRegisterCustomer() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCustomer();
  return useMutation<Customer, Error, CustomerProfileInput>({
    mutationFn: async (input: CustomerProfileInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.registerCustomer(input);
      if (result.__kind__ === "err") {
        throw new Error(
          result.err.__kind__ === "alreadyRegistered"
            ? "This account is already registered."
            : "Could not create your account.",
        );
      }
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Updates the calling customer's profile. */
export function useUpdateMyProfile() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCustomer();
  return useMutation<Customer, Error, CustomerProfileInput>({
    mutationFn: async (input: CustomerProfileInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.updateMyProfile(input);
      if (result.__kind__ === "err")
        throw new Error("Could not save your profile.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Requests an email verification code for the supplied address. */
export function useRequestEmailVerification() {
  const { actor } = useActor(createActor);
  return useMutation<null, Error, string>({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.requestEmailVerification(email);
      if (result.__kind__ === "err")
        throw new Error("Could not send the verification code.");
      return result.ok;
    },
  });
}

/** Confirms the email verification code. */
export function useConfirmEmailVerification() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCustomer();
  return useMutation<Customer, Error, string>({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.confirmEmailVerification(code);
      if (result.__kind__ === "err") {
        throw new Error(
          result.err.__kind__ === "invalidCode"
            ? "That code is not valid. Check the email and try again."
            : "Could not confirm the code.",
        );
      }
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Records a mobile number for admin review. No SMS provider is configured. */
export function useSubmitMobileNumber() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCustomer();
  return useMutation<Customer, Error, string>({
    mutationFn: async (phone: string) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.submitMobileNumber(phone);
      if (result.__kind__ === "err")
        throw new Error("Could not submit your mobile number.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Submits a payment reference for a plan. Stays pending until admin review. */
export function useSubmitPayment() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCustomer();
  return useMutation<Payment, Error, { planId: PlanId; reference: string }>({
    mutationFn: async ({ planId, reference }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.submitPayment(planId, reference);
      if (result.__kind__ === "err") {
        throw new Error(
          result.err.__kind__ === "notRegistered"
            ? "Create your account before choosing a plan."
            : "Could not submit your payment reference.",
        );
      }
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** The signed-in customer's own listings, newest first. */
export function useMyListings() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Listing[]>({
    queryKey: customerKeys.listings(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyListings();
    },
    enabled: isReady,
    retry: false,
  });
  return { ...query, isUnavailable };
}

/** One of the signed-in customer's own listings, or `null`. */
export function useMyListing(id: ListingId | null) {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Listing | null>({
    queryKey: customerKeys.listing(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getMyListing(id);
    },
    enabled: isReady && id !== null,
    retry: false,
  });
  return { ...query, isUnavailable };
}

function useInvalidateMyListings() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: customerKeys.listings() });
    void queryClient.invalidateQueries({ queryKey: listingKeys.all });
  };
}

/** Creates a listing owned by the calling customer. Requires a subscription. */
export function useCreateMyListing() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateMyListings();
  return useMutation<Listing, Error, ListingInput>({
    mutationFn: async (input: ListingInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.createMyListing(input);
      if (result.__kind__ === "err") {
        throw new Error(listingErrorMessage(result.err));
      }
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Applies a partial update to one of the calling customer's own listings. */
export function useUpdateMyListing() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateMyListings();
  return useMutation<Listing, Error, { id: ListingId; patch: ListingUpdate }>({
    mutationFn: async ({ id, patch }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.updateMyListing(id, patch);
      if (result.__kind__ === "err") {
        throw new Error(listingErrorMessage(result.err));
      }
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Deletes one of the calling customer's own listings. */
export function useDeleteMyListing() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateMyListings();
  return useMutation<null, Error, ListingId>({
    mutationFn: async (id: ListingId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.deleteMyListing(id);
      if (result.__kind__ === "err")
        throw new Error("Could not delete the listing.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Appends photos to one of the calling customer's own listings. */
export function useAddMyListingPhotos() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateMyListings();
  return useMutation<Listing, Error, { id: ListingId; photos: Photo[] }>({
    mutationFn: async ({ id, photos }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.addMyListingPhotos(id, photos);
      if (result.__kind__ === "err") {
        throw new Error(listingErrorMessage(result.err));
      }
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Removes the photo at `index` from one of the customer's own listings. */
export function useRemoveMyListingPhoto() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateMyListings();
  return useMutation<Listing, Error, { id: ListingId; index: number }>({
    mutationFn: async ({ id, index }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.removeMyListingPhoto(id, BigInt(index));
      if (result.__kind__ === "err")
        throw new Error("Could not remove the photo.");
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Maps a backend listing error onto a message a customer can act on. */
function listingErrorMessage(error: ListingError): string {
  switch (error.__kind__) {
    case "noActiveSubscription":
      return "An active advertising plan is required before you can publish a listing. Choose a plan first.";
    case "listingLimitReached":
      return `Your plan allows up to ${error.listingLimitReached.toString()} active listings. Upgrade your plan to add more properties.`;
    case "imageLimitReached":
      return `Your plan allows up to ${error.imageLimitReached.toString()} photos per listing. Upgrade your plan to add more photos.`;
    case "notAuthorized":
      return "Your session has expired. Sign in again and retry.";
    default:
      return "We could not save this listing. Please try again.";
  }
}
