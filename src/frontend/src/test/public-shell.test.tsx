import App from "@/App";
import {
  actorHarness,
  identityHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import { createMockBackend } from "@/test/mock-backend";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

/**
 * Characterization of the public shell that must keep working while the header
 * navigation is intentionally rebuilt. The exact nav label set is changing, so
 * these tests assert the *routes* the shell exposes and the customer controls,
 * not the current labels: every protected public page stays reachable from the
 * header and footer, and the customer sign-in control is offered to a visitor
 * who is not signed in.
 */
describe("public site shell", () => {
  beforeEach(() => {
    resetHarness();
    navigateTo("/");
    actorHarness.actor = createMockBackend({ listings: [] });
  });

  it("exposes working header links to every protected public route", async () => {
    renderWithProviders(<App />);

    // The brand lockup always routes home.
    expect(await screen.findByTestId("site_header.brand_link")).toHaveAttribute(
      "href",
      "/",
    );

    // Browse, about, contact and plans are all reachable from the header.
    const headerRoutes = [
      "site_header.nav.browse",
      "site_header.nav.about",
      "site_header.nav.contact",
      "site_header.nav.plans",
    ];
    for (const testId of headerRoutes) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
    expect(screen.getByTestId("site_header.nav.browse")).toHaveAttribute(
      "href",
      "/listings",
    );
    expect(screen.getByTestId("site_header.nav.about")).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByTestId("site_header.nav.contact")).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByTestId("site_header.nav.plans")).toHaveAttribute(
      "href",
      "/plans",
    );

    // The prominent post-property call to action is present.
    expect(
      screen.getByTestId("site_header.post_property_button"),
    ).toHaveAttribute("href", "/post-property");
  });

  it("offers the customer sign-in control to a signed-out visitor", async () => {
    identityHarness.isAuthenticated = false;

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("site_header.login_button"),
    ).toBeInTheDocument();
    // A signed-out visitor is not offered the account or logout controls.
    expect(
      screen.queryByTestId("site_header.account_link"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("site_header.logout_button"),
    ).not.toBeInTheDocument();
  });

  it("exposes working footer links to the protected public routes", async () => {
    renderWithProviders(<App />);

    await screen.findByTestId("site_header.brand_link");

    expect(
      screen.getByTestId("site_footer.link.browse_listings"),
    ).toHaveAttribute("href", "/listings");
    expect(screen.getByTestId("site_footer.link.about_us")).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByTestId("site_footer.link.contact")).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(
      screen.getByTestId("site_footer.link.post_your_property"),
    ).toHaveAttribute("href", "/post-property");
  });
});
