import App from "@/App";
import { BACKEND_GRACE_PERIOD_MS } from "@/hooks/use-backend-status";
import {
  actorHarness,
  identityHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

/**
 * The backend-readiness fix: `useActor` exposes no error surface, so a null
 * actor that is no longer fetching used to leave every data region on a
 * permanent loading skeleton. `useBackendStatus` now starts a bounded grace
 * timer and settles on `unavailable`, and each page renders a clear message.
 *
 * These tests drive the grace timer with fake timers so the settled state is
 * reached deterministically. They assert the *settled* state — the unavailable
 * message and the absence of the loading skeleton — which is the behavior the
 * fix adds, and the static page content that must survive it.
 */
describe("public site settles when the backend is unavailable", () => {
  beforeEach(() => {
    resetHarness();
    // No actor and not fetching: the connection could not be established.
    actorHarness.actor = null;
    actorHarness.isFetching = false;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Renders the app and lets the router resolve its initial route. The router's
   * async match resolution needs microtasks and zero-delay timers, which fake
   * timers otherwise freeze; advancing by 0 does not reach the grace period.
   */
  async function renderApp() {
    renderWithProviders(<App />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
  }

  /** Advances past the grace period and flushes the resulting state update. */
  async function settleGracePeriod() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(BACKEND_GRACE_PERIOD_MS);
    });
  }

  it("shows the home page's static sections and a settled unavailable portfolio", async () => {
    navigateTo("/");

    await renderApp();

    // The static sections render regardless of backend availability.
    expect(screen.getByTestId("home.page")).toBeInTheDocument();
    expect(screen.getByTestId("home.hero_section")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /find your place/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home.value_props_section")).toBeInTheDocument();
    expect(screen.getByTestId("home.areas_section")).toBeInTheDocument();
    expect(screen.getByTestId("home.help_section")).toBeInTheDocument();
    expect(screen.getByTestId("home.help_contact_button")).toBeInTheDocument();

    // Before the grace period elapses the data region is still connecting.
    expect(screen.getByTestId("home.featured_loading")).toBeInTheDocument();

    await settleGracePeriod();

    // The data region settles on a clear unavailable message, not a skeleton.
    expect(screen.getByTestId("home.featured_unavailable")).toBeInTheDocument();
    expect(
      screen.queryByTestId("home.featured_loading"),
    ).not.toBeInTheDocument();
    // The static sections are still there after the data region settles.
    expect(screen.getByTestId("home.hero_section")).toBeInTheDocument();
    expect(screen.getByTestId("home.value_props_section")).toBeInTheDocument();
    expect(screen.getByTestId("home.areas_section")).toBeInTheDocument();
    expect(screen.getByTestId("home.help_section")).toBeInTheDocument();
  });

  it("shows the browse page's unavailable message instead of a permanent skeleton", async () => {
    navigateTo("/listings");

    await renderApp();

    expect(screen.getByTestId("browse.page")).toBeInTheDocument();
    expect(screen.getByTestId("browse.loading_state")).toBeInTheDocument();

    await settleGracePeriod();

    expect(screen.getByTestId("browse.unavailable_state")).toBeInTheDocument();
    expect(
      screen.queryByTestId("browse.loading_state"),
    ).not.toBeInTheDocument();
    // The filter controls remain usable and the shell is intact.
    expect(
      screen.getByTestId("browse.filters.search_input"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("site_header.brand_link")).toBeInTheDocument();
  });

  it("shows the listing detail page's unavailable message instead of a permanent skeleton", async () => {
    navigateTo("/listings/1");

    await renderApp();

    expect(
      screen.getByTestId("listing_detail.loading_state"),
    ).toBeInTheDocument();

    await settleGracePeriod();

    expect(
      screen.getByTestId("listing_detail.unavailable_state"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("listing_detail.loading_state"),
    ).not.toBeInTheDocument();
    // The visitor is offered a route back to the portfolio.
    expect(screen.getByTestId("listing_detail.back_link")).toBeInTheDocument();
  });
});

describe("admin console settles when the backend is unavailable", () => {
  beforeEach(() => {
    resetHarness();
    actorHarness.actor = null;
    actorHarness.isFetching = false;
    identityHarness.isAuthenticated = true;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function renderApp() {
    renderWithProviders(<App />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
  }

  async function settleGracePeriod() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(BACKEND_GRACE_PERIOD_MS);
    });
  }

  it("never shows 'Access denied' while connecting, then shows a clear unavailable message", async () => {
    navigateTo("/admin");

    await renderApp();

    // During the connecting window the gate must not falsely reject the
    // administrator: the role query is disabled, so `isAdmin` is undefined.
    expect(
      screen.getByTestId("admin_gate.connecting_state"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_gate.access_denied"),
    ).not.toBeInTheDocument();
    // Console chrome never renders before the gate passes.
    expect(
      screen.queryByTestId("admin_sidebar.nav.dashboard"),
    ).not.toBeInTheDocument();

    await settleGracePeriod();

    // The gate settles on a clear unavailable message, not an endless skeleton
    // and not a false access denial.
    expect(
      screen.getByTestId("admin_gate.unavailable_state"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_gate.access_denied"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_gate.connecting_state"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_sidebar.nav.dashboard"),
    ).not.toBeInTheDocument();
  });
});
