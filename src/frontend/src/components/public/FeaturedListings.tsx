import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { ListingCard } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/button";
import { usePublishedListings } from "@/hooks/use-listings";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Home } from "lucide-react";

/** How many of the newest published listings the home page surfaces. */
const FEATURED_COUNT = 6;

/** The empty browse search state, matching the `/listings` route contract. */
const EMPTY_BROWSE_SEARCH = {
  q: undefined,
  type: undefined,
  property: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  beds: undefined,
  location: undefined,
  sort: undefined,
};

/**
 * Featured listings band: the newest published properties rendered through the
 * shared `ListingCard`, with a clear route into the full browse page.
 */
export function FeaturedListings() {
  const { data, isPending, isError, isUnavailable, refetch } =
    usePublishedListings();
  const featured = (data ?? []).slice(0, FEATURED_COUNT);

  return (
    <section
      data-ocid="home.featured_section"
      className="border-y border-border bg-muted/40 py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              The portfolio
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Featured properties
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The most recently published homes and land in our collection, each
              with its full gallery, attributes and direct enquiry line.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="shrink-0 rounded-full border-primary/30 text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
          >
            <Link
              to="/listings"
              search={EMPTY_BROWSE_SEARCH}
              data-ocid="home.browse_all_button"
            >
              Browse all listings
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-12">
          {isUnavailable ? (
            <ErrorState
              data-ocid="home.featured_unavailable"
              title="The portfolio is temporarily unavailable"
              description="We could not reach the listings service. The rest of the page is still here — please try again in a moment."
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <LoadingState
              count={FEATURED_COUNT}
              data-ocid="home.featured_loading"
            />
          ) : isError ? (
            <ErrorState
              data-ocid="home.featured_error"
              title="We could not load the portfolio"
              description="The listings service did not respond. Please try again in a moment."
              onRetry={() => void refetch()}
            />
          ) : featured.length === 0 ? (
            <EmptyState
              icon={Home}
              data-ocid="home.featured_empty"
              title="No published listings yet"
              description="Our portfolio is being prepared. Check back shortly, or get in touch to hear about upcoming properties first."
              action={
                <Button asChild className="rounded-full">
                  <Link
                    to="/contact"
                    data-ocid="home.featured_empty_contact_button"
                  >
                    Contact us
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
              {featured.map((listing, index) => (
                <ListingCard
                  key={listing.id.toString()}
                  listing={listing}
                  index={index}
                  className="animate-fade-in-up"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
