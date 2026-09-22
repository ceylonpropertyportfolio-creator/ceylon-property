import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import {
  CustomerListingForm,
  listingToCustomerFormValues,
} from "@/components/customer/CustomerListingForm";
import { ListingStatusBadge } from "@/components/listing/ListingStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddMyListingPhotos,
  useDeleteMyListing,
  useMyListings,
  useRemoveMyListingPhoto,
  useUpdateMyListing,
} from "@/hooks/use-customer";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import type {
  Listing,
  ListingFormValues,
  ListingUpdate,
} from "@/types/listing";
import { Link } from "@tanstack/react-router";
import { Home, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

/** Converts a validated draft into a backend partial update. */
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

/**
 * The customer's own listings with inline edit and delete actions. Editing
 * happens in place so the customer never leaves their account page, and
 * deleting is confirmed inline so a stray click never removes a property.
 */
export function MyListingsPanel() {
  const listingsQuery = useMyListings();
  const updateListing = useUpdateMyListing();
  const deleteListing = useDeleteMyListing();
  const addPhotos = useAddMyListingPhotos();
  const removePhoto = useRemoveMyListingPhoto();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ListingFormValues | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const listings = listingsQuery.data ?? [];
  const editingListing =
    listings.find((listing) => listing.id.toString() === editingId) ?? null;

  function startEditing(listing: Listing) {
    setErrorMessage(null);
    setConfirmingId(null);
    setEditingId(listing.id.toString());
    setDraft(listingToCustomerFormValues(listing));
  }

  function stopEditing() {
    setEditingId(null);
    setDraft(null);
    setErrorMessage(null);
  }

  function handleSave(values: ListingFormValues) {
    if (!editingListing) return;
    setErrorMessage(null);
    updateListing.mutate(
      { id: editingListing.id, patch: toListingUpdate(values) },
      {
        onSuccess: () => stopEditing(),
        onError: (error) => setErrorMessage(error.message),
      },
    );
  }

  function handleDelete(listing: Listing) {
    deleteListing.mutate(listing.id, {
      onSettled: () => setConfirmingId(null),
    });
  }

  async function handleUploadPhotos(
    photos: Parameters<typeof addPhotos.mutateAsync>[0]["photos"],
  ) {
    if (!editingListing) return;
    await addPhotos.mutateAsync({ id: editingListing.id, photos });
  }

  async function handleRemovePhoto(index: number) {
    if (!editingListing) return;
    await removePhoto.mutateAsync({ id: editingListing.id, index });
  }

  return (
    <section
      data-ocid="account.listings_section"
      className="rounded-3xl border border-border bg-card p-7 shadow-subtle md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Home className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              My listings
            </h2>
            <p className="text-sm text-muted-foreground">
              Create, edit and remove the properties you advertise.
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
        >
          <Link to="/post-property" data-ocid="account.add_listing_button">
            <Plus className="size-4" aria-hidden="true" />
            Add
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        {listingsQuery.isLoading ? (
          <div data-ocid="account.listings_loading_state" className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : listingsQuery.isError || listingsQuery.isUnavailable ? (
          <ErrorState
            data-ocid="account.listings_error_state"
            title="We could not load your listings"
            description="The listings service did not respond. Please try again in a moment."
            onRetry={() => void listingsQuery.refetch()}
          />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Home}
            data-ocid="account.listings_empty_state"
            title="No listings yet"
            description="Post your first property and it will appear here while our team reviews it."
            action={
              <Button asChild className="rounded-full">
                <Link
                  to="/post-property"
                  data-ocid="account.listings_empty_post_button"
                >
                  Post your property
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {listings.map((listing, index) => {
              const isConfirming = confirmingId === listing.id.toString();
              return (
                <li
                  key={listing.id.toString()}
                  data-ocid={`account.listing_row.${index + 1}`}
                  className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {listing.title}
                      </p>
                      {listing.blocked ? (
                        <Badge
                          variant="outline"
                          className="rounded-full border-destructive/30 bg-destructive/10 text-destructive"
                        >
                          Blocked
                        </Badge>
                      ) : (
                        <ListingStatusBadge published={listing.published} />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(listing.price, listing.currency)} ·{" "}
                      {listing.city || "—"} · updated{" "}
                      {formatRelativeTime(listing.updatedAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {isConfirming ? (
                      <>
                        <span className="text-sm text-muted-foreground">
                          Delete this listing?
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          data-ocid={`account.listing_delete_confirm_button.${index + 1}`}
                          disabled={deleteListing.isPending}
                          onClick={() => handleDelete(listing)}
                          className="rounded-full"
                        >
                          {deleteListing.isPending ? (
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : null}
                          {deleteListing.isPending ? "Deleting…" : "Delete"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          data-ocid={`account.listing_delete_cancel_button.${index + 1}`}
                          disabled={deleteListing.isPending}
                          onClick={() => setConfirmingId(null)}
                          className="rounded-full"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          data-ocid={`account.listing_edit_button.${index + 1}`}
                          onClick={() => startEditing(listing)}
                          className="rounded-full"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          data-ocid={`account.listing_delete_button.${index + 1}`}
                          onClick={() => setConfirmingId(listing.id.toString())}
                          className="rounded-full text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {deleteListing.isError ? (
          <p
            data-ocid="account.listing_delete_error"
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {deleteListing.error.message}
          </p>
        ) : null}
      </div>

      {editingListing && draft ? (
        <div
          data-ocid="account.listing_editor"
          className="mt-8 border-t border-border pt-8"
        >
          <h3 className="font-display text-lg font-semibold text-foreground">
            Edit “{editingListing.title}”
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the details below, then save your changes.
          </p>
          <div className="mt-6">
            <CustomerListingForm
              values={draft}
              onChange={setDraft}
              onSubmit={handleSave}
              onCancel={stopEditing}
              isSaving={updateListing.isPending}
              errorMessage={errorMessage}
              submitLabel="Save changes"
              photos={editingListing.photos}
              onUploadPhotos={handleUploadPhotos}
              onRemovePhoto={handleRemovePhoto}
              isPhotoBusy={addPhotos.isPending || removePhoto.isPending}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
