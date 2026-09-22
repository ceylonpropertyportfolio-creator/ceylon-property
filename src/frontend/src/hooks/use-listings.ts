import { createActor } from "@/backend";
import type { Listing, ListingFilter, ListingId } from "@/backend";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { useQuery } from "@tanstack/react-query";

/**
 * Converts a `ListingFilter` into a JSON-safe shape for React Query key
 * hashing. React Query serializes keys with `JSON.stringify`, which throws on
 * raw `bigint` values, so every bigint field becomes its decimal string.
 */
function serializeFilter(filter: ListingFilter): Record<string, string> {
  const serialized: Record<string, string> = {};
  if (filter.keyword !== undefined) serialized.keyword = filter.keyword;
  if (filter.location !== undefined) serialized.location = filter.location;
  if (filter.listingType !== undefined) {
    serialized.listingType = filter.listingType;
  }
  if (filter.propertyType !== undefined) {
    serialized.propertyType = filter.propertyType;
  }
  if (filter.minPrice !== undefined) {
    serialized.minPrice = filter.minPrice.toString();
  }
  if (filter.maxPrice !== undefined) {
    serialized.maxPrice = filter.maxPrice.toString();
  }
  if (filter.minBedrooms !== undefined) {
    serialized.minBedrooms = filter.minBedrooms.toString();
  }
  return serialized;
}

/** Query key root for every public listing read. */
export const listingKeys = {
  all: ["listings"] as const,
  published: () => [...listingKeys.all, "published"] as const,
  search: (filter: ListingFilter) =>
    [...listingKeys.all, "search", serializeFilter(filter)] as const,
  detail: (id: ListingId) =>
    [...listingKeys.all, "detail", id.toString()] as const,
};

/**
 * Every published listing, newest first.
 *
 * The query is enabled only once the backend is ready, so a failed connection
 * leaves the query idle rather than pending forever. Callers read
 * `isUnavailable` to distinguish "backend unreachable" from "still loading".
 */
export function usePublishedListings() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Listing[]>({
    queryKey: listingKeys.published(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPublishedListings();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** Published listings matching the supplied filter. */
export function useSearchListings(filter: ListingFilter) {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Listing[]>({
    queryKey: listingKeys.search(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchListings(filter);
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** A single published listing, or `null` when it is missing or unpublished. */
export function useListing(id: ListingId | null) {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Listing | null>({
    queryKey: listingKeys.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getListing(id);
    },
    enabled: isReady && id !== null,
  });
  return { ...query, isUnavailable };
}
