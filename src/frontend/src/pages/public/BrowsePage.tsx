import type { Listing, ListingFilter } from "@/backend";
import { ListingType, PropertyType } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import {
  type BrowseFilterValues,
  ListingFilters,
  hasActiveFilters,
} from "@/components/public/ListingFilters";
import { ListingGrid } from "@/components/public/ListingGrid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppBackendStatus } from "@/hooks/use-backend-status";
import { useSearchListings } from "@/hooks/use-listings";
import { formatCount } from "@/lib/format";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { useMemo } from "react";

const browseRoute = getRouteApi("/public/listings");

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "area-desc", label: "Largest area" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const LISTING_TYPE_VALUES = new Set<string>(Object.values(ListingType));
const PROPERTY_TYPE_VALUES = new Set<string>(Object.values(PropertyType));

/** Reads the filter values currently held in the URL search params. */
function readFilterValues(search: Record<string, unknown>): BrowseFilterValues {
  const read = (key: string): string => {
    const value = search[key];
    return typeof value === "string" ? value : "";
  };
  return {
    keyword: read("q"),
    listingType: read("type"),
    propertyType: read("property"),
    minPrice: read("minPrice"),
    maxPrice: read("maxPrice"),
    minBedrooms: read("beds"),
    location: read("location"),
  };
}

/** Parses a non-negative integer from a filter string, or `undefined`. */
function toPositiveInt(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.floor(parsed);
}

/** Builds the backend `ListingFilter` from the URL-backed filter values. */
function toListingFilter(values: BrowseFilterValues): ListingFilter {
  const filter: ListingFilter = {};
  if (values.keyword.trim()) filter.keyword = values.keyword.trim();
  if (values.location.trim()) filter.location = values.location.trim();
  if (LISTING_TYPE_VALUES.has(values.listingType)) {
    filter.listingType = values.listingType as ListingType;
  }
  if (PROPERTY_TYPE_VALUES.has(values.propertyType)) {
    filter.propertyType = values.propertyType as PropertyType;
  }
  const minPrice = toPositiveInt(values.minPrice);
  if (minPrice !== undefined) filter.minPrice = BigInt(minPrice);
  const maxPrice = toPositiveInt(values.maxPrice);
  if (maxPrice !== undefined) filter.maxPrice = BigInt(maxPrice);
  const minBedrooms = toPositiveInt(values.minBedrooms);
  if (minBedrooms !== undefined) filter.minBedrooms = BigInt(minBedrooms);
  return filter;
}

/** Sorts a copy of the results according to the selected sort value. */
function sortListings(listings: Listing[], sort: SortValue): Listing[] {
  const sorted = [...listings];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => Number(a.price - b.price));
    case "price-desc":
      return sorted.sort((a, b) => Number(b.price - a.price));
    case "area-desc":
      return sorted.sort((a, b) => Number(b.area - a.area));
    default:
      return sorted.sort((a, b) => Number(b.createdAt - a.createdAt));
  }
}

/** Public browse and search page for published properties. */
export function BrowsePage() {
  const search = browseRoute.useSearch();
  const navigate = useNavigate({ from: "/listings" });

  const values = useMemo(() => readFilterValues(search), [search]);
  const sort: SortValue =
    typeof search.sort === "string" &&
    SORT_OPTIONS.some((option) => option.value === search.sort)
      ? (search.sort as SortValue)
      : "newest";

  const filter = useMemo(() => toListingFilter(values), [values]);
  const { isConnecting } = useAppBackendStatus();
  const { data, isLoading, isError, isUnavailable, refetch } =
    useSearchListings(filter);

  // While the backend connection is still being established the search query is
  // disabled, so `isLoading` is false and `data` is undefined. Treat that window
  // as loading so the page never misrepresents an empty portfolio.
  const isPending = isConnecting || isLoading;

  const listings = useMemo(() => sortListings(data ?? [], sort), [data, sort]);

  const active = hasActiveFilters(values);

  /** Merges a filter patch into the URL search params. */
  const handleChange = (patch: Partial<BrowseFilterValues>) => {
    const next = { ...values, ...patch };
    void navigate({
      search: (prev) => ({
        ...prev,
        q: next.keyword || undefined,
        type: next.listingType || undefined,
        property: next.propertyType || undefined,
        minPrice: next.minPrice || undefined,
        maxPrice: next.maxPrice || undefined,
        beds: next.minBedrooms || undefined,
        location: next.location || undefined,
      }),
      replace: true,
    });
  };

  const handleClear = () => {
    void navigate({
      search: (prev) => ({ sort: prev.sort }),
      replace: true,
    });
  };

  const handleSortChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        sort: value === "newest" ? undefined : value,
      }),
      replace: true,
    });
  };

  return (
    <div data-ocid="browse.page" className="bg-background">
      <section className="border-b border-border bg-gradient-subtle">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            The portfolio
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Properties across the island
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Browse every published residence, villa and investment opportunity
            in our coastal collection. Refine by type, price, bedrooms or
            location — your search stays in the link.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <ListingFilters
          values={values}
          onChange={handleChange}
          onClear={handleClear}
        />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p
            data-ocid="browse.result_count"
            className="text-sm text-muted-foreground"
            aria-live="polite"
          >
            {isUnavailable ? (
              "Portfolio unavailable"
            ) : isPending ? (
              "Searching the portfolio…"
            ) : (
              <>
                <span className="font-semibold text-foreground tabular">
                  {formatCount(BigInt(listings.length))}
                </span>{" "}
                {listings.length === 1 ? "property" : "properties"}
                {active ? " match your filters" : " available"}
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <label
              htmlFor="browse-sort"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Sort
            </label>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger
                id="browse-sort"
                data-ocid="browse.sort_select"
                className="h-10 w-[13rem] rounded-lg"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8">
          {isUnavailable ? (
            <ErrorState
              data-ocid="browse.unavailable_state"
              title="The portfolio is temporarily unavailable"
              description="We could not reach the listings service. Your filters are still here — please try again in a moment."
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <LoadingState data-ocid="browse.loading_state" />
          ) : isError ? (
            <ErrorState
              data-ocid="browse.error_state"
              title="We could not load the portfolio"
              description="Something interrupted the search. Check your connection and try again."
              onRetry={() => void refetch()}
            />
          ) : (
            <ListingGrid
              listings={listings}
              data-ocid="browse.listing_grid"
              fallback={
                <EmptyState
                  icon={SearchX}
                  data-ocid="browse.empty_state"
                  title={active ? "No properties match" : "No properties yet"}
                  description={
                    active
                      ? "Try widening your price range, removing a filter, or searching a different location."
                      : "New residences are added regularly. Check back soon for the latest additions to the portfolio."
                  }
                  action={
                    active ? (
                      <Button
                        type="button"
                        onClick={handleClear}
                        data-ocid="browse.empty_state.clear_button"
                        className="rounded-full"
                      >
                        Clear filters
                      </Button>
                    ) : undefined
                  }
                />
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
