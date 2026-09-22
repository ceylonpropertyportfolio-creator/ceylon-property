import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { ListingAttributes } from "@/components/public/ListingAttributes";
import { PhotoGallery } from "@/components/public/PhotoGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useListing } from "@/hooks/use-listings";
import {
  formatDate,
  formatLocation,
  formatPrice,
  listingTypeLabel,
  propertyTypeLabel,
} from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";

/** The full, unfiltered search state required by the `/listings` route. */
const EMPTY_LISTING_SEARCH = {
  q: undefined,
  type: undefined,
  property: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  beds: undefined,
  location: undefined,
  sort: undefined,
};

/** Parses the `$listingId` route param into a backend listing id. */
function parseListingId(raw: string): bigint | null {
  if (!/^\d+$/.test(raw)) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

/** Public property detail page: gallery, attributes, description and enquiry. */
export function ListingDetailPage() {
  const { listingId } = useParams({ from: "/public/listings/$listingId" });
  const id = parseListingId(listingId);
  const {
    data: listing,
    isPending,
    isError,
    isUnavailable,
    refetch,
  } = useListing(id);

  if (id === null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <ErrorState
          data-ocid="listing_detail.error_state"
          title="Property not found"
          description="This property link is not valid. It may have been removed or the address was mistyped."
        />
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link
              to="/listings"
              search={EMPTY_LISTING_SEARCH}
              data-ocid="listing_detail.back_link"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to all properties
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isUnavailable) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <ErrorState
          data-ocid="listing_detail.unavailable_state"
          title="This property is temporarily unavailable"
          description="We could not reach the listings service. Please try again in a moment."
          onRetry={() => void refetch()}
        />
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link
              to="/listings"
              search={EMPTY_LISTING_SEARCH}
              data-ocid="listing_detail.back_link"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to all properties
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingState
          data-ocid="listing_detail.loading_state"
          count={3}
          className="lg:grid-cols-3"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <ErrorState
          data-ocid="listing_detail.error_state"
          title="We could not load this property"
          description="Something went wrong while fetching this listing. Please try again."
          onRetry={() => void refetch()}
        />
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link
              to="/listings"
              search={EMPTY_LISTING_SEARCH}
              data-ocid="listing_detail.back_link"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to all properties
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <ErrorState
          data-ocid="listing_detail.error_state"
          title="This property is no longer available"
          description="The listing you are looking for has been removed or is not currently published."
        />
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link
              to="/listings"
              search={EMPTY_LISTING_SEARCH}
              data-ocid="listing_detail.back_link"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to all properties
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article
      data-ocid="listing_detail.page"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <Link
        to="/listings"
        search={EMPTY_LISTING_SEARCH}
        data-ocid="listing_detail.back_link"
        className="inline-flex items-center gap-2 rounded-full text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All properties
      </Link>

      <header className="mt-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            data-ocid="listing_detail.listing_type_badge"
            className="rounded-full border-transparent bg-primary/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-primary"
          >
            {listingTypeLabel(listing.listingType)}
          </Badge>
          <Badge
            variant="outline"
            data-ocid="listing_detail.property_type_badge"
            className="rounded-full border-border bg-card px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
          >
            {propertyTypeLabel(listing.propertyType)}
          </Badge>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              {listing.title}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-base text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="break-words">
                {formatLocation({
                  city: listing.city,
                  region: listing.region,
                  country: listing.country,
                })}
              </span>
            </p>
          </div>
          <div className="shrink-0">
            <p
              data-ocid="listing_detail.price"
              className="inline-block rounded-xl bg-accent/20 px-4 py-2 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
            >
              {formatPrice(listing.price, listing.currency)}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-10">
          <PhotoGallery
            photos={listing.photos}
            title={listing.title}
            className="animate-fade-in"
          />

          <ListingAttributes listing={listing} />

          <section
            data-ocid="listing_detail.description_section"
            aria-labelledby="listing-description-heading"
            className="rounded-2xl border border-border bg-card p-6 shadow-subtle sm:p-8"
          >
            <h2
              id="listing-description-heading"
              className="font-display text-2xl font-semibold tracking-tight text-foreground"
            >
              About this property
            </h2>
            <Separator className="my-5" />
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Listed {formatDate(listing.createdAt)}
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div
            data-ocid="listing_detail.enquiry_panel"
            className="rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-7"
          >
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Enquire about this property
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Send your details and our team will arrange a viewing or answer
              your questions.
            </p>
            <Separator className="my-5" />
            <EnquiryForm listingId={listing.id} listingTitle={listing.title} />
          </div>
        </aside>
      </div>
    </article>
  );
}
