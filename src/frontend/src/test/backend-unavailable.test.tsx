import App from "@/App";
import {
  actorHarness,
  identityHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

/**
 * Baseline for the public site when the backend connection cannot be
 * established: `useActor` yields no actor, so every listing query stays
 * disabled.
 *
 * The behavior that is intentionally changing is what the *data region* shows
 * in that situation (currently a permanent loading skeleton, becoming a clear
 * unavailable/error state). These tests deliberately do NOT assert the loading
 * skeleton or any error copy. They protect the adjacent, unchanged behavior:
 * the public shell and page structure still render, the visitor is never
 * blocked by a blank screen, and the admin gate still refuses to show console
 * navigation.
 */
describe("public site with no backend connection", () => {
  beforeEach(() => {
    resetHarness();
    // No actor: the backend connection could not be established.
    actorHarness.actor = null;
    actorHarness.isFetching = false;
  });

  it("still renders the home page shell and hero without an actor", async () => {
    navigateTo("/");

    renderWithProviders(<App />);

    // The public shell and hero render regardless of backend availability.
    expect(
      await screen.findByTestId("site_header.brand_link"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /find your place/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home.page")).toBeInTheDocument();
    // The route into browse is still offered.
    expect(screen.getByTestId("home.browse_all_button")).toBeInTheDocument();
  });

  it("still renders the browse page shell and filters without an actor", async () => {
    navigateTo("/listings");

    renderWithProviders(<App />);

    expect(await screen.findByTestId("browse.page")).toBeInTheDocument();
    // The filter controls remain usable even though no data can load.
    expect(
      screen.getByTestId("browse.filters.search_input"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("browse.filters.search_button"),
    ).toBeInTheDocument();
    // The public shell is present, not a blank screen.
    expect(screen.getByTestId("site_header.brand_link")).toBeInTheDocument();
  });

  it("still renders the listing detail shell for a valid id without an actor", async () => {
    navigateTo("/listings/1");

    renderWithProviders(<App />);

    // The detail route resolves and renders its page container; the data
    // region's own state is intentionally not asserted here.
    expect(
      await screen.findByTestId("site_header.brand_link"),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/listings/1");
  });

  it("still shows the admin sign-in gate and no console navigation without an actor", async () => {
    navigateTo("/admin");
    identityHarness.isAuthenticated = false;

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("admin_gate.signin_button"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Administrator sign-in required",
      }),
    ).toBeInTheDocument();
    // Console chrome never renders before the gate passes.
    expect(
      screen.queryByTestId("admin_sidebar.nav.dashboard"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_sidebar.nav.listings"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_dashboard.page"),
    ).not.toBeInTheDocument();
  });
});
