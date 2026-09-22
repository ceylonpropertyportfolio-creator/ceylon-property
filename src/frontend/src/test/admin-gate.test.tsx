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

/**
 * The admin console is gated behind administrator sign-in. Before sign-in the
 * visitor sees only the sign-in surface — the console chrome (sidebar and top
 * bar) must not render, so an unauthenticated visitor cannot see or navigate
 * the management UI.
 */
describe("admin console gate", () => {
  beforeEach(() => {
    resetHarness();
  });

  it("shows only the sign-in surface before sign-in, with no console chrome", async () => {
    navigateTo("/admin");
    identityHarness.isAuthenticated = false;
    actorHarness.actor = createMockBackend({ listings: [] });

    renderWithProviders(<App />);

    // The sign-in surface is what an unauthenticated visitor gets.
    expect(
      await screen.findByTestId("admin_gate.signin_button"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Administrator sign-in required",
      }),
    ).toBeInTheDocument();

    // The console chrome is not rendered before the gate passes.
    expect(
      screen.queryByTestId("admin_sidebar.nav.dashboard"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_sidebar.nav.listings"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_topbar.signin_button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_dashboard.page"),
    ).not.toBeInTheDocument();
  });

  it("renders the console chrome and dashboard for a signed-in administrator", async () => {
    navigateTo("/admin");
    identityHarness.isAuthenticated = true;
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      isAdmin: true,
    });

    renderWithProviders(<App />);

    // The gate passes and the console shell appears.
    expect(
      await screen.findByTestId("admin_sidebar.nav.dashboard"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_sidebar.nav.listings"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_sidebar.nav.enquiries"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_topbar.signout_button"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("admin_dashboard.page"),
    ).toBeInTheDocument();
  });

  it("denies a signed-in caller who does not hold the administrator role", async () => {
    navigateTo("/admin");
    identityHarness.isAuthenticated = true;
    actorHarness.actor = createMockBackend({ listings: [], isAdmin: false });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("admin_gate.access_denied"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_sidebar.nav.dashboard"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_dashboard.page"),
    ).not.toBeInTheDocument();
  });

  it("keeps the public site reachable at its own distinct route", async () => {
    navigateTo("/");
    identityHarness.isAuthenticated = false;
    actorHarness.actor = createMockBackend({ listings: [] });

    renderWithProviders(<App />);

    // The public header renders on the public route, not the admin chrome.
    expect(
      await screen.findByTestId("site_header.brand_link"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_sidebar.nav.dashboard"),
    ).not.toBeInTheDocument();
  });
});
