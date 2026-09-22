import {
  AdminListingForm,
  type AdvertiserValues,
  EMPTY_LISTING_FORM,
  type ListingFlags,
  listingToFormValues,
} from "@/components/admin/AdminListingForm";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddListingPhotos,
  useAdminListing,
  useCreateListing,
  useRemoveListingPhoto,
  useSetListingBlocked,
  useSetListingFeatured,
  useSetListingPublished,
  useUpdateListing,
} from "@/hooks/use-admin";
import type {
  ListingFormValues,
  ListingInput,
  ListingUpdate,
  Photo,
} from "@/types/listing";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const EMPTY_ADVERTISER: AdvertiserValues = {
  name: "",
  phone: "",
  email: "",
  whatsapp: "",
};

const EMPTY_FLAGS: ListingFlags = {
  published: false,
  featured: false,
  blocked: false,
};

/** Converts a validated draft into the backend create payload. */
function toListingInput(values: ListingFormValues): ListingInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    listingType: values.listingType,
    propertyType: values.propertyType,
    price: BigInt(values.price),
    currency: values.currency,
    addressLine: values.addressLine.trim(),
    city: values.city.trim(),
    region: values.region.trim(),
    postcode: values.postcode.trim(),
    country: values.country.trim(),
    bedrooms: BigInt(values.bedrooms),
    bathrooms: BigInt(values.bathrooms),
    area: BigInt(values.area),
    photos: [],
  };
}

/** Converts a validated draft into the backend partial-update payload. */
function toListingUpdate(values: ListingFormValues): ListingUpdate {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    listingType: values.listingType,
    propertyType: values.propertyType,
    price: BigInt(values.price),
    currency: values.currency,
    addressLine: values.addressLine.trim(),
    city: values.city.trim(),
    region: values.region.trim(),
    postcode: values.postcode.trim(),
    country: values.country.trim(),
    bedrooms: BigInt(values.bedrooms),
    bathrooms: BigInt(values.bathrooms),
    area: BigInt(values.area),
  };
}

/** Parses the `$listingId` route param, returning null when it is not a number. */
function parseListingId(raw: string | undefined): bigint | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

/**
 * The admin listing editor. Serves both `/admin/listings/new` (create) and
 * `/admin/listings/$listingId/edit` (edit, prefilled from the backend).
 */
export function AdminListingEditorPage() {
  const params = useParams({ strict: false }) as { listingId?: string };
  const navigate = useNavigate();
  const rawListingId = params.listingId;
  const listingId = parseListingId(rawListingId);
  const isEdit = rawListingId !== undefined;

  const listingQuery = useAdminListing(isEdit ? listingId : null);
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const addPhotos = useAddListingPhotos();
  const removePhoto = useRemoveListingPhoto();
  const setPublished = useSetListingPublished();
  const setFeatured = useSetListingFeatured();
  const setBlocked = useSetListingBlocked();

  const [values, setValues] = useState<ListingFormValues>(EMPTY_LISTING_FORM);
  const [advertiser, setAdvertiser] =
    useState<AdvertiserValues>(EMPTY_ADVERTISER);
  const [flags, setFlags] = useState<ListingFlags>(EMPTY_FLAGS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);
  const initializedFor = useRef<string | null>(null);

  const listing = listingQuery.data ?? null;

  // Prefill the draft once per listing id; never overwrite in-progress edits.
  useEffect(() => {
    if (!isEdit || !listing) return;
    const key = listing.id.toString();
    if (initializedFor.current === key) return;
    initializedFor.current = key;
    setValues(listingToFormValues(listing));
    setFlags({
      published: listing.published,
      featured: listing.featured,
      blocked: listing.blocked,
    });
  }, [isEdit, listing]);

  const isSaving = createListing.isPending || updateListing.isPending;
  const isPhotoBusy = addPhotos.isPending || removePhoto.isPending;

  function goToListings() {
    void navigate({ to: "/admin/listings" });
  }

  /** Applies the publication flags after the listing itself is saved. */
  async function applyFlags(id: bigint) {
    if (flags.published !== (listing?.published ?? false)) {
      await setPublished.mutateAsync({ id, published: flags.published });
    }
    if (flags.featured !== (listing?.featured ?? false)) {
      await setFeatured.mutateAsync({ id, featured: flags.featured });
    }
    if (flags.blocked !== (listing?.blocked ?? false)) {
      await setBlocked.mutateAsync({ id, blocked: flags.blocked });
    }
  }

  function handleSubmit(next: ListingFormValues) {
    setErrorMessage(null);
    if (isEdit && listingId !== null) {
      updateListing.mutate(
        { id: listingId, patch: toListingUpdate(next) },
        {
          onSuccess: async () => {
            try {
              await applyFlags(listingId);
            } catch {
              setErrorMessage(
                "The listing was saved, but its publication flags could not be updated. Reopen the listing to retry.",
              );
              return;
            }
            goToListings();
          },
          onError: () =>
            setErrorMessage(
              "We could not save this listing. Your administrator session may have expired — sign in again and retry.",
            ),
        },
      );
      return;
    }
    createListing.mutate(toListingInput(next), {
      onSuccess: async (created) => {
        if (pendingPhotos.length > 0) {
          try {
            await addPhotos.mutateAsync({
              id: created.id,
              photos: pendingPhotos,
            });
          } catch {
            setErrorMessage(
              "The listing was created, but its photos could not be uploaded. Reopen the listing to attach them.",
            );
            return;
          }
        }
        try {
          await applyFlags(created.id);
        } catch {
          setErrorMessage(
            "The listing was created, but its publication flags could not be set. Reopen the listing to retry.",
          );
          return;
        }
        goToListings();
      },
      onError: () =>
        setErrorMessage(
          "We could not create this listing. Your administrator session may have expired — sign in again and retry.",
        ),
    });
  }

  async function handleUpload(photos: Photo[]) {
    if (listingId === null) {
      setPendingPhotos((current) => [...current, ...photos]);
      return;
    }
    await addPhotos.mutateAsync({ id: listingId, photos });
  }

  async function handleRemovePhoto(index: number) {
    if (listingId === null) {
      setPendingPhotos((current) =>
        current.filter((_, position) => position !== index),
      );
      return;
    }
    await removePhoto.mutateAsync({ id: listingId, index });
  }

  const invalidId = isEdit && listingId === null;

  return (
    <div
      data-ocid="admin_listing_editor.page"
      className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/listings"
            data-ocid="admin_listing_editor.back_link"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to listings
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            {isEdit ? "Edit listing" : "New listing"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit
              ? "Update the property details, photos, advertiser contact and publication state."
              : "Add a property to the portfolio. It stays unpublished until you publish it."}
          </p>
        </div>
      </div>

      {invalidId ? (
        <ErrorState
          data-ocid="admin_listing_editor.error_state"
          title="Listing not found"
          description="That listing reference is not valid. Return to the listings table and open a listing from there."
        />
      ) : isEdit && listingQuery.isLoading ? (
        <div
          data-ocid="admin_listing_editor.loading_state"
          className="space-y-4"
        >
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ) : isEdit && listingQuery.isError ? (
        <ErrorState
          data-ocid="admin_listing_editor.error_state"
          title="Could not load this listing"
          description="We could not reach the backend for this listing. Check your connection and retry."
          onRetry={() => void listingQuery.refetch()}
        />
      ) : isEdit && !listing ? (
        <ErrorState
          data-ocid="admin_listing_editor.not_found_state"
          title="Listing not found"
          description="This listing no longer exists. It may have been deleted from the console."
        />
      ) : (
        <AdminListingForm
          values={values}
          onChange={setValues}
          advertiser={advertiser}
          onAdvertiserChange={setAdvertiser}
          flags={flags}
          onFlagsChange={setFlags}
          photos={isEdit ? (listing?.photos ?? []) : pendingPhotos}
          onUploadPhotos={handleUpload}
          onRemovePhoto={handleRemovePhoto}
          isPhotoBusy={isPhotoBusy}
          onSubmit={handleSubmit}
          onCancel={goToListings}
          isSaving={isSaving}
          errorMessage={errorMessage}
          submitLabel={isEdit ? "Save changes" : "Create listing"}
        />
      )}

      {isEdit && listingId !== null && listing ? (
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-ocid="admin_listing_editor.view_public_button"
            asChild
            className="rounded-md text-muted-foreground"
          >
            <Link
              to="/listings/$listingId"
              params={{ listingId: listingId.toString() }}
              data-ocid="admin_listing_editor.public_link"
            >
              View public page
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
