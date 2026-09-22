import type { Listing } from "@/backend";
import { Separator } from "@/components/ui/separator";
import { formatArea, formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Bath,
  BedDouble,
  Building2,
  Globe2,
  Hash,
  MapPin,
  Ruler,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ListingAttributesProps {
  listing: Listing;
  className?: string;
}

interface AttributeRow {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

/** Full attribute panel for a property: counts, area and full address. */
export function ListingAttributes({
  listing,
  className,
}: ListingAttributesProps) {
  const rows: AttributeRow[] = [
    {
      id: "bedrooms",
      icon: BedDouble,
      label: "Bedrooms",
      value: formatCount(listing.bedrooms),
    },
    {
      id: "bathrooms",
      icon: Bath,
      label: "Bathrooms",
      value: formatCount(listing.bathrooms),
    },
    {
      id: "area",
      icon: Ruler,
      label: "Floor area",
      value: formatArea(listing.area),
    },
    {
      id: "address",
      icon: MapPin,
      label: "Address",
      value: listing.addressLine || "—",
    },
    {
      id: "city",
      icon: Building2,
      label: "City",
      value: listing.city || "—",
    },
    {
      id: "region",
      icon: MapPin,
      label: "Region",
      value: listing.region || "—",
    },
    {
      id: "postcode",
      icon: Hash,
      label: "Postcode",
      value: listing.postcode || "—",
    },
    {
      id: "country",
      icon: Globe2,
      label: "Country",
      value: listing.country || "—",
    },
  ];

  return (
    <section
      data-ocid="listing_detail.attributes_panel"
      aria-labelledby="listing-attributes-heading"
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-subtle sm:p-8",
        className,
      )}
    >
      <h2
        id="listing-attributes-heading"
        className="font-display text-2xl font-semibold tracking-tight text-foreground"
      >
        Property details
      </h2>
      <Separator className="my-5" />
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
              <row.icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 break-words text-sm font-medium text-foreground">
                {row.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
