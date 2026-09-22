import {
  EmailVerification,
  ListingType,
  MobileVerification,
  PaymentStatus,
  PropertyType,
  SubscriptionStatus,
} from "@/backend";

const CURRENCY_SYMBOLS: Record<string, string> = {
  LKR: "Rs.",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  AED: "AED",
};

const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  [ListingType.sale]: "For sale",
  [ListingType.rent]: "For rent",
};

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.house]: "House",
  [PropertyType.apartment]: "Apartment",
  [PropertyType.condo]: "Condo",
  [PropertyType.townhouse]: "Townhouse",
  [PropertyType.land]: "Land",
  [PropertyType.commercial]: "Commercial",
  [PropertyType.other]: "Other",
};

/** Human label for a listing type. */
export function listingTypeLabel(type: ListingType): string {
  return LISTING_TYPE_LABELS[type] ?? "Listing";
}

/** Human label for a property type. */
export function propertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPE_LABELS[type] ?? "Property";
}

/**
 * Formats a whole-number price with its currency symbol and thousands
 * separators, e.g. `Rs. 1,300,000`.
 */
export function formatPrice(price: bigint, currency: string): string {
  const symbol =
    CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency.toUpperCase();
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${symbol} —`;
  return `${symbol} ${amount.toLocaleString("en-US")}`;
}

/** Formats a whole-number area in square feet, e.g. `2,400 sq ft`. */
export function formatArea(area: bigint): string {
  const value = Number(area);
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString("en-US")} sq ft`;
}

/** Formats a bedroom or bathroom count as a plain number. */
export function formatCount(value: bigint): string {
  const count = Number(value);
  return Number.isFinite(count) ? count.toLocaleString("en-US") : "—";
}

/**
 * Converts a Motoko nanosecond timestamp into a JavaScript `Date`.
 * Returns `null` when the value cannot be represented.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a nanosecond timestamp as an absolute date, e.g. `12 Mar 2026`. */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Formats a nanosecond timestamp as a date and time, e.g. `12 Mar 2026, 14:05`. */
export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formats a nanosecond timestamp as a short relative time, e.g. `3 days ago`. */
export function formatRelativeTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(timestamp);
}

/** Joins the location parts of a listing into a single readable line. */
export function formatLocation(parts: {
  city: string;
  region: string;
  country: string;
}): string {
  return [parts.city, parts.region, parts.country].filter(Boolean).join(", ");
}

/** Builds the short `City - Region` label used on cards and admin rows. */
export function formatShortLocation(city: string, region: string): string {
  return [city, region].filter(Boolean).join(" - ");
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.pending]: "Awaiting review",
  [PaymentStatus.confirmed]: "Confirmed",
  [PaymentStatus.rejected]: "Rejected",
};

const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.active]: "Active",
  [SubscriptionStatus.expired]: "Expired",
};

const EMAIL_VERIFICATION_LABELS: Record<EmailVerification, string> = {
  [EmailVerification.verified]: "Verified",
  [EmailVerification.pending]: "Code sent",
  [EmailVerification.unverified]: "Not verified",
};

const MOBILE_VERIFICATION_LABELS: Record<MobileVerification, string> = {
  [MobileVerification.notSubmitted]: "Not submitted",
  [MobileVerification.pendingReview]: "Pending review",
  [MobileVerification.approved]: "Approved",
  [MobileVerification.rejected]: "Rejected",
};

/** Human label for a payment status. */
export function paymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] ?? "Payment";
}

/** Human label for a subscription status. */
export function subscriptionStatusLabel(status: SubscriptionStatus): string {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? "Subscription";
}

/** Human label for an email verification state. */
export function emailVerificationLabel(state: EmailVerification): string {
  return EMAIL_VERIFICATION_LABELS[state] ?? "Not verified";
}

/** Human label for a mobile verification state. */
export function mobileVerificationLabel(state: MobileVerification): string {
  return MOBILE_VERIFICATION_LABELS[state] ?? "Not submitted";
}

/**
 * Formats a plan allowance. `undefined` means the plan is unlimited, which is
 * rendered as an em dash rather than a number.
 */
export function formatAllowance(allowance: bigint | undefined): string {
  if (allowance === undefined) return "Unlimited";
  return formatCount(allowance);
}

/** Formats a monthly price, e.g. `Rs. 1,990 / month`. */
export function formatMonthlyPrice(price: bigint, currency = "LKR"): string {
  return `${formatPrice(price, currency)} / month`;
}
