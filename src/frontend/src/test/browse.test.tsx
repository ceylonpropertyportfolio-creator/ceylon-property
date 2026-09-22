import App from "@/App";
import {
  actorHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import { createMockBackend, makeListing } from "@/test/mock-backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

describe("public browse page", () => {
  beforeEach(() => {
    resetHarness();
  });

  it("renders listing cards with price, location, bedrooms, bathrooms and area", async () => {
    navigateTo("/listings");
    actorHarness.actor = createMockBackend({
      listings: [
        makeListing({
          id: 1n,
          title: "Beachfront villa with infinity pool",
          price: 1_300_000n,
          currency: "LKR",
          city: "Galle",
          region: "Southern Province",
          bedrooms: 4n,
          bathrooms: 3n,
          area: 2400n,
        }),
      ],
    });

    renderWithProviders(<App />);

    const card = await screen.findByTestId("listing.card.1");
    expect(card).toBeInTheDocument();
    expect(
      screen.getByText("Beachfront villa with infinity pool"),
    ).toBeInTheDocument();
    // Price, location and the three counts are all visible on the card.
    expect(screen.getByText("Rs. 1,300,000")).toBeInTheDocument();
    expect(screen.getByText("Galle - Southern Province")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2,400 sq ft")).toBeInTheDocument();
  });

  it("reflects a keyword search in the URL and filters the results", async () => {
    navigateTo("/listings");
    const backend = createMockBackend({
      listings: [
        makeListing({ id: 1n, title: "Beachfront villa with infinity pool" }),
        makeListing({ id: 2n, title: "Colombo skyline apartment" }),
      ],
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);

    // Both listings are visible before filtering.
    await screen.findByTestId("listing.card.1");
    expect(screen.getByTestId("listing.card.2")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(
      screen.getByTestId("browse.filters.search_input"),
      "Colombo",
    );
    await user.click(screen.getByTestId("browse.filters.search_button"));

    // The keyword is written into the URL so a refresh preserves it.
    await waitFor(() => {
      expect(window.location.search).toContain("q=Colombo");
    });

    // Only the matching listing remains.
    await waitFor(() => {
      expect(screen.queryByTestId("listing.card.2")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("listing.card.1")).toBeInTheDocument();
  });

  it("preserves string filters supplied in the URL on first render", async () => {
    navigateTo("/listings?type=rent&location=Galle");
    const backend = createMockBackend({
      listings: [
        makeListing({
          id: 1n,
          title: "Galle rental villa",
          listingType: "rent" as never,
          bedrooms: 4n,
          city: "Galle",
        }),
        makeListing({
          id: 2n,
          title: "Colombo sale apartment",
          listingType: "sale" as never,
          bedrooms: 2n,
          city: "Colombo",
        }),
      ],
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);

    // The backend receives the filter derived from the URL.
    await waitFor(() => {
      expect(backend.calls.searchListings.length).toBeGreaterThan(0);
    });
    const lastFilter =
      backend.calls.searchListings[backend.calls.searchListings.length - 1];
    expect(lastFilter.listingType).toBe("rent");
    expect(lastFilter.location).toBe("Galle");

    // Only the matching listing is shown.
    await waitFor(() => {
      expect(screen.queryByTestId("listing.card.2")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("listing.card.1")).toBeInTheDocument();
  });

  it("shows the empty state when no listing matches the filters", async () => {
    navigateTo("/listings?q=nothingmatches");
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
    });

    renderWithProviders(<App />);

    expect(await screen.findByTestId("browse.empty_state")).toBeInTheDocument();
  });
});
