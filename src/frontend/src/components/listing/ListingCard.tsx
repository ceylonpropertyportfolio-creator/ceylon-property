import type { Listing } from "@/backend";
import { Badge } from "@/components/ui/badge";
import {
  formatArea,
  formatCount,
  formatPrice,
  formatShortLocation,
} from "@/lib/format";
import { photoUrl } from "@/lib/photo";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, ImageOff, MapPin, Ruler } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  /** Position in the rendered list, used for a stable deterministic marker. */
  index?: number;
  className?: string;
}

/** Public property card: photo, price, location, bedrooms, bathrooms and area. */
export function ListingCard({ listing, index, className }: ListingCardProps) {
  const cover = listing.photos[0];
  const coverUrl = cover ? photoUrl(cover) : null;
  const ocid =
    index === undefined ? "listing.card" : `listing.card.${index + 1}`;

  return (
    <Link
      to="/listings/$listingId"
      params={{ listingId: listing.id.toString() }}
      data-ocid={ocid}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-1 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={listing.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" aria-hidden="true" />
          </div>
        )}
        <Badge
          variant="outline"
          className="absolute left-3 top-3 rounded-full border-transparent bg-card/90 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground backdrop-blur"
        >
          {listing.listingType === "sale" ? "For sale" : "For rent"}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-2xl font-semibold leading-tight text-foreground">
          {formatPrice(listing.price, listing.currency)}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {formatShortLocation(listing.city, listing.region)}
          </span>
        </p>
        <h3 className="mt-3 line-clamp-2 font-display text-base font-medium leading-snug text-foreground">
          {listing.title}
        </h3>

        <dl className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BedDouble className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Bedrooms</dt>
            <dd className="tabular">{formatCount(listing.bedrooms)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Bathrooms</dt>
            <dd className="tabular">{formatCount(listing.bathrooms)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Area</dt>
            <dd className="tabular">{formatArea(listing.area)}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
