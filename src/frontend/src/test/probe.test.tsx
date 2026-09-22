import App from "@/App";
import {
  actorHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import { createMockBackend, makeListing } from "@/test/mock-backend";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

/**
 * A visitor can share or refresh a browse URL and every filter is re-applied on
 * first render.
 *
 * Numeric filters (`beds`, `minPrice`, `maxPrice`) are covered here: TanStack
 * Router's default search parser JSON-parses numeric-looking params, so
 * `?minPrice=1000000` arrives at `validateSearch` as a number. The route
 * coerces both string and number shapes back to strings, so those params
 * survive a fresh load and reach the backend filter.
 */
describe("browse URL filter round-trip", () => {
  beforeEach(() => {
    resetHarness();
  });

  it("re-applies keyword, type and location filters from the URL", async () => {
    navigateTo("/listings?q=villa&type=rent&location=Galle");
    const backend = createMockBackend({
      listings: [
        makeListing({
          id: 1n,
          title: "Galle rental villa",
          listingType: "rent" as never,
          city: "Galle",
        }),
        makeListing({
          id: 2n,
          title: "Colombo sale apartment",
          listingType: "sale" as never,
          city: "Colombo",
        }),
      ],
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(backend.calls.searchListings.length).toBeGreaterThan(0);
    });
    const lastFilter =
      backend.calls.searchListings[backend.calls.searchListings.length - 1];
    expect(lastFilter.keyword).toBe("villa");
    expect(lastFilter.listingType).toBe("rent");
    expect(lastFilter.location).toBe("Galle");

    // Only the matching listing is shown.
    await waitFor(() => {
      expect(screen.queryByTestId("listing.card.2")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("listing.card.1")).toBeInTheDocument();
  });

  it("re-applies numeric price and bedroom filters from the URL", async () => {
    navigateTo("/listings?minPrice=1000000&maxPrice=2000000&beds=3");
    const backend = createMockBackend({
      listings: [
        makeListing({
          id: 1n,
          title: "Mid-range villa",
          price: 1_500_000n,
          bedrooms: 4n,
        }),
        makeListing({
          id: 2n,
          title: "Budget cottage",
          price: 500_000n,
          bedrooms: 2n,
        }),
        makeListing({
          id: 3n,
          title: "Premium estate",
          price: 5_000_000n,
          bedrooms: 6n,
        }),
      ],
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);

    // The numeric params survive the router's JSON parsing and reach the
    // backend as bigint filter bounds.
    await waitFor(() => {
      expect(backend.calls.searchListings.length).toBeGreaterThan(0);
    });
    const lastFilter =
      backend.calls.searchListings[backend.calls.searchListings.length - 1];
    expect(lastFilter.minPrice).toBe(1_000_000n);
    expect(lastFilter.maxPrice).toBe(2_000_000n);
    expect(lastFilter.minBedrooms).toBe(3n);

    // Only the listing inside the price range with enough bedrooms remains.
    await waitFor(() => {
      expect(screen.queryByTestId("listing.card.2")).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId("listing.card.3")).not.toBeInTheDocument();
    expect(screen.getByTestId("listing.card.1")).toBeInTheDocument();
  });
});
