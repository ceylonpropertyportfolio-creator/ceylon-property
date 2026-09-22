import {
  EmailVerification,
  ListingType,
  MobileVerification,
  PaymentStatus,
  PropertyType,
  SubscriptionStatus,
} from "@/backend";
import {
  emailVerificationLabel,
  formatAllowance,
  formatArea,
  formatCount,
  formatDate,
  formatDateTime,
  formatLocation,
  formatMonthlyPrice,
  formatPrice,
  formatShortLocation,
  listingTypeLabel,
  mobileVerificationLabel,
  paymentStatusLabel,
  propertyTypeLabel,
  subscriptionStatusLabel,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

/**
 * Characterization of the shared display formatters. These are pure adapter
 * transformations used by the public browse/detail pages and the admin console,
 * so their output is part of the observable contract those surfaces rely on.
 * The values asserted here are the ones the existing page tests already depend
 * on (`Rs. 1,300,000`, `2,400 sq ft`, `Galle - Southern Province`).
 */
describe("listing display formatters", () => {
  it("formats a price with its currency symbol and thousands separators", () => {
    expect(formatPrice(1_300_000n, "LKR")).toBe("Rs. 1,300,000");
    expect(formatPrice(2_500_000n, "USD")).toBe("$ 2,500,000");
    expect(formatPrice(0n, "LKR")).toBe("Rs. 0");
  });

  it("falls back to the upper-cased currency code for an unknown currency", () => {
    expect(formatPrice(1_000n, "sek")).toBe("SEK 1,000");
  });

  it("formats an area in square feet", () => {
    expect(formatArea(2_400n)).toBe("2,400 sq ft");
    expect(formatArea(0n)).toBe("0 sq ft");
  });

  it("formats a count as a plain grouped number", () => {
    expect(formatCount(4n)).toBe("4");
    expect(formatCount(1_200n)).toBe("1,200");
  });

  it("joins the full and short location lines", () => {
    expect(
      formatLocation({
        city: "Galle",
        region: "Southern Province",
        country: "Sri Lanka",
      }),
    ).toBe("Galle, Southern Province, Sri Lanka");
    expect(formatShortLocation("Galle", "Southern Province")).toBe(
      "Galle - Southern Province",
    );
  });

  it("omits blank location parts instead of leaving separators", () => {
    expect(formatLocation({ city: "Galle", region: "", country: "" })).toBe(
      "Galle",
    );
    expect(formatShortLocation("Galle", "")).toBe("Galle");
  });

  it("labels every listing and property type", () => {
    expect(listingTypeLabel(ListingType.sale)).toBe("For sale");
    expect(listingTypeLabel(ListingType.rent)).toBe("For rent");
    expect(propertyTypeLabel(PropertyType.house)).toBe("House");
    expect(propertyTypeLabel(PropertyType.apartment)).toBe("Apartment");
    expect(propertyTypeLabel(PropertyType.land)).toBe("Land");
    expect(propertyTypeLabel(PropertyType.commercial)).toBe("Commercial");
  });
});

describe("timestamp formatters", () => {
  // 2026-03-12T14:05:00Z expressed in nanoseconds since the epoch.
  const TIMESTAMP = 1_773_324_300_000_000_000n;

  it("formats a nanosecond timestamp as a readable date", () => {
    expect(formatDate(TIMESTAMP)).toBe("12 Mar 2026");
  });

  it("formats a nanosecond timestamp as a date and time", () => {
    expect(formatDateTime(TIMESTAMP)).toMatch(/^12 Mar 2026, \d{2}:\d{2}$/);
  });

  it("renders an em dash for a timestamp that cannot be represented", () => {
    expect(formatDate(0n)).not.toBe("");
    expect(formatDateTime(0n)).not.toBe("");
  });
});

describe("plan and account status formatters", () => {
  it("formats a plan allowance, treating an absent value as unlimited", () => {
    expect(formatAllowance(3n)).toBe("3");
    expect(formatAllowance(undefined)).toBe("Unlimited");
  });

  it("formats a monthly price with the billing suffix", () => {
    expect(formatMonthlyPrice(1_990n)).toBe("Rs. 1,990 / month");
  });

  it("labels every payment, subscription and verification state", () => {
    expect(paymentStatusLabel(PaymentStatus.pending)).toBe("Awaiting review");
    expect(paymentStatusLabel(PaymentStatus.confirmed)).toBe("Confirmed");
    expect(paymentStatusLabel(PaymentStatus.rejected)).toBe("Rejected");
    expect(subscriptionStatusLabel(SubscriptionStatus.active)).toBe("Active");
    expect(subscriptionStatusLabel(SubscriptionStatus.expired)).toBe("Expired");
    expect(emailVerificationLabel(EmailVerification.verified)).toBe("Verified");
    expect(mobileVerificationLabel(MobileVerification.approved)).toBe(
      "Approved",
    );
    expect(mobileVerificationLabel(MobileVerification.notSubmitted)).toBe(
      "Not submitted",
    );
  });
});
