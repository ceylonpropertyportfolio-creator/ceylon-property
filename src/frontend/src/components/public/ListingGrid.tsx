import type { Listing } from "@/backend";
import { ListingCard } from "@/components/listing/ListingCard";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ListingGridProps {
  listings: Listing[];
  /** Optional empty/loading/error surface rendered in place of the grid. */
  fallback?: ReactNode;
  className?: string;
  "data-ocid"?: string;
}

/**
 * Responsive grid wrapper for public property cards.
 * Renders `fallback` when there are no listings to show.
 */
export function ListingGrid({
  listings,
  fallback,
  className,
  "data-ocid": dataOcid = "listing.grid",
}: ListingGridProps) {
  if (listings.length === 0 && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8",
        className,
      )}
    >
      {listings.map((listing, index) => (
        <ListingCard
          key={listing.id.toString()}
          listing={listing}
          index={index}
        />
      ))}
    </div>
  );
}
