import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BEDROOM_OPTIONS,
  LISTING_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/lib/listing-options";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

/** The filter values owned by the browse page and mirrored in the URL. */
export interface BrowseFilterValues {
  keyword: string;
  listingType: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  location: string;
}

export const EMPTY_BROWSE_FILTERS: BrowseFilterValues = {
  keyword: "",
  listingType: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  location: "",
};

/** True when at least one filter is set. */
export function hasActiveFilters(values: BrowseFilterValues): boolean {
  return Object.values(values).some((value) => value !== "");
}

interface ListingFiltersProps {
  values: BrowseFilterValues;
  onChange: (patch: Partial<BrowseFilterValues>) => void;
  onClear: () => void;
  className?: string;
}

const ALL = "all";

/** Filter panel for the public browse page: keyword, type, price, beds, location. */
export function ListingFilters({
  values,
  onChange,
  onClear,
  className,
}: ListingFiltersProps) {
  const [keywordDraft, setKeywordDraft] = useState(values.keyword);

  // Keep the draft in sync when the URL changes from outside (back/forward, clear).
  useEffect(() => {
    setKeywordDraft(values.keyword);
  }, [values.keyword]);

  const active = hasActiveFilters(values);

  return (
    <form
      data-ocid="browse.filters.panel"
      onSubmit={(event) => {
        event.preventDefault();
        onChange({ keyword: keywordDraft.trim() });
      }}
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <SlidersHorizontal
            className="size-4 text-primary"
            aria-hidden="true"
          />
          Refine your search
        </h2>
        {active ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            data-ocid="browse.filters.clear_button"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-3">
          <Label
            htmlFor="browse-keyword"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Keyword
          </Label>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="browse-keyword"
                type="search"
                value={keywordDraft}
                onChange={(event) => setKeywordDraft(event.target.value)}
                placeholder="Beachfront villa, Galle, pool…"
                data-ocid="browse.filters.search_input"
                className="h-11 rounded-lg pl-9"
              />
            </div>
            <Button
              type="submit"
              data-ocid="browse.filters.search_button"
              className="h-11 rounded-full px-6"
            >
              Search
            </Button>
          </div>
        </div>

        <div>
          <Label
            htmlFor="browse-listing-type"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Listing type
          </Label>
          <Select
            value={values.listingType || ALL}
            onValueChange={(value) =>
              onChange({ listingType: value === ALL ? "" : value })
            }
          >
            <SelectTrigger
              id="browse-listing-type"
              data-ocid="browse.filters.listing_type_select"
              className="mt-2 h-11 rounded-lg"
            >
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any listing type</SelectItem>
              {LISTING_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="browse-property-type"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Property type
          </Label>
          <Select
            value={values.propertyType || ALL}
            onValueChange={(value) =>
              onChange({ propertyType: value === ALL ? "" : value })
            }
          >
            <SelectTrigger
              id="browse-property-type"
              data-ocid="browse.filters.property_type_select"
              className="mt-2 h-11 rounded-lg"
            >
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any property type</SelectItem>
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="browse-min-bedrooms"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Bedrooms
          </Label>
          <Select
            value={values.minBedrooms || ALL}
            onValueChange={(value) =>
              onChange({ minBedrooms: value === ALL ? "" : value })
            }
          >
            <SelectTrigger
              id="browse-min-bedrooms"
              data-ocid="browse.filters.bedrooms_select"
              className="mt-2 h-11 rounded-lg"
            >
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any bedrooms</SelectItem>
              {BEDROOM_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="browse-min-price"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Min price
          </Label>
          <Input
            id="browse-min-price"
            type="number"
            min={0}
            inputMode="numeric"
            value={values.minPrice}
            onChange={(event) => onChange({ minPrice: event.target.value })}
            placeholder="No minimum"
            data-ocid="browse.filters.min_price_input"
            className="mt-2 h-11 rounded-lg"
          />
        </div>

        <div>
          <Label
            htmlFor="browse-max-price"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Max price
          </Label>
          <Input
            id="browse-max-price"
            type="number"
            min={0}
            inputMode="numeric"
            value={values.maxPrice}
            onChange={(event) => onChange({ maxPrice: event.target.value })}
            placeholder="No maximum"
            data-ocid="browse.filters.max_price_input"
            className="mt-2 h-11 rounded-lg"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <Label
            htmlFor="browse-location"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Location
          </Label>
          <Input
            id="browse-location"
            value={values.location}
            onChange={(event) => onChange({ location: event.target.value })}
            placeholder="City or region, e.g. Galle"
            data-ocid="browse.filters.location_input"
            className="mt-2 h-11 rounded-lg"
          />
        </div>
      </div>
    </form>
  );
}
