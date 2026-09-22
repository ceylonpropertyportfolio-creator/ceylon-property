import App from "@/App";
import {
  actorHarness,
  identityHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import { createMockBackend, makeListing } from "@/test/mock-backend";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

/**
 * Baseline for the admin listings management surface. The console is reached
 * through the administrator gate, so every test signs in as an administrator
 * and seeds the mock backend with the listings under management.
 */
describe("admin listings management", () => {
  beforeEach(() => {
    resetHarness();
    identityHarness.isAuthenticated = true;
  });

  it("lists every listing with its price, enquiry count and status", async () => {
    navigateTo("/admin/listings");
    actorHarness.actor = createMockBackend({
      listings: [
        makeListing({
          id: 1n,
          title: "Beachfront villa",
          price: 1_300_000n,
          currency: "LKR",
          city: "Galle",
          region: "Southern Province",
          published: true,
        }),
        makeListing({
          id: 2n,
          title: "Colombo skyline apartment",
          price: 2_500_000n,
          currency: "LKR",
          city: "Colombo",
          region: "Western Province",
          published: false,
        }),
      ],
      isAdmin: true,
    });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("admin_listings.page"),
    ).toBeInTheDocument();

    // Both rows render with their title and formatted price. The page container
    // renders while the query is still loading, so wait for the first row.
    const firstRow = await screen.findByTestId("admin_listings.row.1");
    expect(within(firstRow).getByText("Beachfront villa")).toBeInTheDocument();
    expect(within(firstRow).getByText("Rs. 1,300,000")).toBeInTheDocument();
    expect(
      within(firstRow).getByTestId("admin_listings.status.1"),
    ).toHaveTextContent("Published");

    const secondRow = screen.getByTestId("admin_listings.row.2");
    expect(
      within(secondRow).getByText("Colombo skyline apartment"),
    ).toBeInTheDocument();
    expect(
      within(secondRow).getByTestId("admin_listings.status.2"),
    ).toHaveTextContent("Unpublished");

    // The publish action reflects the current state of each row.
    expect(
      within(firstRow).getByTestId("admin_listings.toggle.1"),
    ).toHaveTextContent("Unpublish");
    expect(
      within(secondRow).getByTestId("admin_listings.toggle.2"),
    ).toHaveTextContent("Publish");
  });

  it("shows the empty portfolio state when there are no listings", async () => {
    navigateTo("/admin/listings");
    actorHarness.actor = createMockBackend({ listings: [], isAdmin: true });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("admin_listings.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_listings.empty_new_listing_button"),
    ).toBeInTheDocument();
  });

  it("filters the table by a title or location search", async () => {
    navigateTo("/admin/listings");
    actorHarness.actor = createMockBackend({
      listings: [
        makeListing({ id: 1n, title: "Beachfront villa", city: "Galle" }),
        makeListing({
          id: 2n,
          title: "Colombo skyline apartment",
          city: "Colombo",
        }),
      ],
      isAdmin: true,
    });

    renderWithProviders(<App />);
    await screen.findByTestId("admin_listings.row.1");

    const user = userEvent.setup();
    await user.type(
      screen.getByTestId("admin_listings.search_input"),
      "Colombo",
    );

    // Only the matching row remains; the other is filtered out.
    await waitFor(() => {
      expect(
        screen.queryByTestId("admin_listings.row.2"),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("admin_listings.row.1")).toBeInTheDocument();
  });

  it("shows a no-results state when the search matches nothing", async () => {
    navigateTo("/admin/listings");
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      isAdmin: true,
    });

    renderWithProviders(<App />);
    await screen.findByTestId("admin_listings.row.1");

    const user = userEvent.setup();
    await user.type(
      screen.getByTestId("admin_listings.search_input"),
      "nothingmatches",
    );

    expect(
      await screen.findByTestId("admin_listings.no_results_state"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin_listings.row.1"),
    ).not.toBeInTheDocument();
  });

  it("publishes an unpublished listing through the backend", async () => {
    navigateTo("/admin/listings");
    const backend = createMockBackend({
      listings: [
        makeListing({ id: 1n, title: "Beachfront villa", published: false }),
      ],
      isAdmin: true,
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("admin_listings.row.1");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("admin_listings.toggle.1"));

    // The backend received the publish request for this listing.
    await waitFor(() => {
      expect(backend.calls.adminSetListingPublished).toContainEqual({
        id: 1n,
        published: true,
      });
    });

    // The row reflects the new published state.
    await waitFor(() => {
      expect(screen.getByTestId("admin_listings.status.1")).toHaveTextContent(
        "Published",
      );
    });
  });

  it("deletes a listing only after the confirmation dialog is accepted", async () => {
    navigateTo("/admin/listings");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      isAdmin: true,
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("admin_listings.row.1");

    const user = userEvent.setup();
    // The delete action lives in the row's overflow menu.
    await user.click(screen.getByTestId("admin_listings.more_button.1"));
    await user.click(
      await screen.findByTestId("admin_listings.delete_button.1"),
    );

    // The confirmation dialog names the listing and does not delete yet.
    const dialog = await screen.findByTestId("admin_listings.delete_dialog");
    expect(dialog).toHaveTextContent("Beachfront villa");
    expect(backend.calls.adminDeleteListing).toHaveLength(0);

    await user.click(screen.getByTestId("admin_listings.confirm_button"));

    // The backend received the delete and the row is gone.
    await waitFor(() => {
      expect(backend.calls.adminDeleteListing).toEqual([1n]);
    });
    await waitFor(() => {
      expect(
        screen.queryByTestId("admin_listings.row.1"),
      ).not.toBeInTheDocument();
    });
  });

  it("cancels a delete without touching the backend", async () => {
    navigateTo("/admin/listings");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      isAdmin: true,
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("admin_listings.row.1");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("admin_listings.more_button.1"));
    await user.click(
      await screen.findByTestId("admin_listings.delete_button.1"),
    );
    await screen.findByTestId("admin_listings.delete_dialog");
    await user.click(screen.getByTestId("admin_listings.cancel_button"));

    // The listing survives and no delete was issued.
    await waitFor(() => {
      expect(
        screen.queryByTestId("admin_listings.delete_dialog"),
      ).not.toBeInTheDocument();
    });
    expect(backend.calls.adminDeleteListing).toHaveLength(0);
    expect(screen.getByTestId("admin_listings.row.1")).toBeInTheDocument();
  });
});
