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
 * The Contact page lists the enquiry types as plain, non-interactive rows. They
 * are informational list items, not self-referential links, so a visitor is not
 * sent back to the same page by clicking one.
 */
describe("public contact page", () => {
  beforeEach(() => {
    resetHarness();
    navigateTo("/contact");
    actorHarness.actor = createMockBackend({ listings: [] });
  });

  it("renders the enquiry types as non-interactive list items", async () => {
    renderWithProviders(<App />);

    expect(await screen.findByTestId("contact.page")).toBeInTheDocument();

    const buyingRow = screen.getByTestId(
      "contact.enquiry_type.buying_a_property",
    );
    expect(buyingRow).toBeInTheDocument();
    expect(buyingRow).toHaveTextContent("Buying a property");

    // The row is a list item, not a link or button.
    expect(buyingRow.tagName).toBe("LI");
    expect(buyingRow.querySelector("a")).toBeNull();
    expect(buyingRow.querySelector("button")).toBeNull();

    // Every enquiry type is present as a list item.
    for (const testId of [
      "contact.enquiry_type.buying_a_property",
      "contact.enquiry_type.selling_or_letting_my_property",
      "contact.enquiry_type.requesting_a_valuation",
      "contact.enquiry_type.something_else",
    ]) {
      expect(screen.getByTestId(testId).tagName).toBe("LI");
    }
  });

  it("still offers a working entry into browse from the contact page", async () => {
    renderWithProviders(<App />);

    const browseButton = await screen.findByTestId("contact.browse_button");
    expect(browseButton).toBeInTheDocument();
    expect(browseButton).toHaveAttribute("href", "/listings");
  });
});
