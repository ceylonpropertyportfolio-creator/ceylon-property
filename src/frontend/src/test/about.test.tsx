import App from "@/App";
import {
  actorHarness,
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
 * The About page is static marketing content. It must render its sections and
 * offer working routes into browse and contact regardless of backend state.
 */
describe("public about page", () => {
  beforeEach(() => {
    resetHarness();
    navigateTo("/about");
    actorHarness.actor = createMockBackend({ listings: [] });
  });

  it("renders the about sections and every principle", async () => {
    renderWithProviders(<App />);

    expect(await screen.findByTestId("about.page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /property, presented like a story worth telling/i,
      }),
    ).toBeInTheDocument();

    // Every principle card renders with its heading.
    for (const title of [
      "Curated, never crowded",
      "Island-wide knowledge",
      "One advisor, start to finish",
      "Honest guidance",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("offers working routes into browse and plans", async () => {
    renderWithProviders(<App />);

    const browseButton = await screen.findByTestId("about.browse_button");
    expect(browseButton).toHaveAttribute("href", "/listings");
    expect(screen.getByTestId("about.plans_button")).toHaveAttribute(
      "href",
      "/plans",
    );
  });
});
