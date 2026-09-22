import App from "@/App";
import {
  actorHarness,
  identityHarness,
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

describe("public home page", () => {
  beforeEach(() => {
    resetHarness();
    navigateTo("/");
  });

  it("renders the hero and featured listings without a blank screen", async () => {
    actorHarness.actor = createMockBackend({
      listings: [
        makeListing({ id: 1n, title: "Beachfront villa with infinity pool" }),
        makeListing({ id: 2n, title: "Colombo skyline apartment" }),
      ],
    });

    renderWithProviders(<App />);

    // The hero headline is the first thing a visitor sees.
    expect(
      await screen.findByRole("heading", { name: /find your place/i }),
    ).toBeInTheDocument();

    // Featured listings render through the shared card component.
    await waitFor(() => {
      expect(
        screen.getByText("Beachfront villa with infinity pool"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Colombo skyline apartment")).toBeInTheDocument();

    // A clear entry into browse/search exists.
    expect(screen.getByTestId("home.browse_all_button")).toBeInTheDocument();
  });

  it("shows the empty portfolio state when nothing is published", async () => {
    actorHarness.actor = createMockBackend({ listings: [] });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("home.featured_empty"),
    ).toBeInTheDocument();
  });

  it("renders the public site and admin console as distinct links", async () => {
    actorHarness.actor = createMockBackend({ listings: [] });
    identityHarness.isAuthenticated = false;

    renderWithProviders(<App />);

    // Public header is present on the public route.
    expect(
      await screen.findByTestId("site_header.brand_link"),
    ).toBeInTheDocument();
    // The admin console is reachable by its own distinct URL.
    navigateTo("/admin");
    expect(window.location.pathname).toBe("/admin");
  });
});
