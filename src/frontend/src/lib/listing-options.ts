import { ListingType, PropertyType } from "@/backend";
import type { SelectOption } from "@/types/listing";

/** Canonical listing-type options, in display order. */
export const LISTING_TYPE_OPTIONS: SelectOption<ListingType>[] = [
  { value: ListingType.sale, label: "For sale" },
  { value: ListingType.rent, label: "For rent" },
];

/** Canonical property-type options, in display order. */
export const PROPERTY_TYPE_OPTIONS: SelectOption<PropertyType>[] = [
  { value: PropertyType.house, label: "House" },
  { value: PropertyType.apartment, label: "Apartment" },
  { value: PropertyType.condo, label: "Condo" },
  { value: PropertyType.townhouse, label: "Townhouse" },
  { value: PropertyType.land, label: "Land" },
  { value: PropertyType.commercial, label: "Commercial" },
  { value: PropertyType.other, label: "Other" },
];

/** Bedroom-count options used by the browse filter. */
export const BEDROOM_OPTIONS: SelectOption<string>[] = [
  { value: "1", label: "1+ bedroom" },
  { value: "2", label: "2+ bedrooms" },
  { value: "3", label: "3+ bedrooms" },
  { value: "4", label: "4+ bedrooms" },
  { value: "5", label: "5+ bedrooms" },
];

/** Currency options offered when creating or editing a listing. */
export const CURRENCY_OPTIONS: SelectOption<string>[] = [
  { value: "LKR", label: "LKR — Sri Lankan Rupee" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "AED", label: "AED — UAE Dirham" },
];

/** The default currency for a new listing. */
export const DEFAULT_CURRENCY = "LKR";

/** The default country for a new listing. */
export const DEFAULT_COUNTRY = "Sri Lanka";

/**
 * The property category shortcuts shown on the home page. Each maps onto the
 * browse page's `property` search param so the shortcut lands pre-filtered.
 */
export interface CategoryShortcut {
  slug: string;
  label: string;
  description: string;
  /** The `property` search param value, or `undefined` for a broad shortcut. */
  property?: PropertyType;
  /** The `type` search param value, or `undefined` for sale and rent alike. */
  listingType?: ListingType;
}

export const CATEGORY_SHORTCUTS: CategoryShortcut[] = [
  {
    slug: "houses",
    label: "Houses",
    description: "Family homes and villas across the island",
    property: PropertyType.house,
  },
  {
    slug: "apartments",
    label: "Apartments",
    description: "City living with skyline and sea views",
    property: PropertyType.apartment,
  },
  {
    slug: "land",
    label: "Land",
    description: "Plots and acreage ready to build on",
    property: PropertyType.land,
  },
  {
    slug: "commercial",
    label: "Commercial",
    description: "Offices, retail and hospitality premises",
    property: PropertyType.commercial,
  },
  {
    slug: "rooms-annexes",
    label: "Rooms & Annexes",
    description: "Compact rentals and self-contained annexes",
    property: PropertyType.other,
    listingType: ListingType.rent,
  },
  {
    slug: "holiday-rentals",
    label: "Holiday Rentals",
    description: "Short-stay homes near the coast and hills",
    listingType: ListingType.rent,
  },
];
