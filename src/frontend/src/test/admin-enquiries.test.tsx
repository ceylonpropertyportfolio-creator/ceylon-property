import App from "@/App";
import {
  actorHarness,
  identityHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import {
  createMockBackend,
  makeEnquiry,
  makeListing,
} from "@/test/mock-backend";
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
 * Baseline for the administrator enquiries inbox. The console is reached
 * through the administrator gate, so every test signs in as an administrator
 * and seeds the mock backend with the enquiries under management.
 */
describe("admin enquiries inbox", () => {
  beforeEach(() => {
    resetHarness();
    identityHarness.isAuthenticated = true;
  });

  it("lists every enquiry with its listing title and read state", async () => {
    navigateTo("/admin/enquiries");
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      enquiries: [
        makeEnquiry({ id: 1n, name: "Amara Perera", read: false }),
        makeEnquiry({ id: 2n, name: "Bob Silva", read: true }),
      ],
      isAdmin: true,
    });

    renderWithProviders(<App />);

    // The inbox list renders both enquiries.
    const list = await screen.findByTestId("enquiries.list");
    expect(within(list).getByText("Amara Perera")).toBeInTheDocument();
    expect(within(list).getByText("Bob Silva")).toBeInTheDocument();
    // The related listing title is shown on each row.
    expect(within(list).getAllByText("Beachfront villa")).toHaveLength(2);
    // The unread count reflects the single unread enquiry.
    expect(screen.getByText("1 unread")).toBeInTheDocument();
  });

  it("shows the empty inbox state when there are no enquiries", async () => {
    navigateTo("/admin/enquiries");
    actorHarness.actor = createMockBackend({
      listings: [],
      enquiries: [],
      isAdmin: true,
    });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("enquiries.empty_state"),
    ).toBeInTheDocument();
  });

  it("opens an enquiry's full detail when its row is selected", async () => {
    navigateTo("/admin/enquiries");
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      enquiries: [
        makeEnquiry({
          id: 1n,
          name: "Amara Perera",
          email: "amara@example.com",
          phone: "+94 77 123 4567",
          message: "I would like to arrange a viewing of this property.",
        }),
      ],
      isAdmin: true,
    });

    renderWithProviders(<App />);
    await screen.findByTestId("enquiries.list");

    // Before selection the detail pane shows its placeholder.
    expect(
      screen.getByTestId("enquiries.detail_placeholder"),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByTestId("enquiries.item.1"));

    // The detail pane shows the contact details and the full message.
    const detail = await screen.findByTestId("enquiries.detail_panel");
    expect(within(detail).getByText("amara@example.com")).toBeInTheDocument();
    expect(within(detail).getByText("+94 77 123 4567")).toBeInTheDocument();
    expect(within(detail).getByTestId("enquiries.message")).toHaveTextContent(
      "I would like to arrange a viewing",
    );
    expect(
      within(detail).getByTestId("enquiries.listing_link"),
    ).toHaveTextContent("Beachfront villa");
  });

  it("marks an unread enquiry as read through the backend", async () => {
    navigateTo("/admin/enquiries");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      enquiries: [makeEnquiry({ id: 1n, name: "Amara Perera", read: false })],
      isAdmin: true,
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("enquiries.list");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("enquiries.item.1"));
    await screen.findByTestId("enquiries.detail_panel");
    await user.click(screen.getByTestId("enquiries.toggle_read_button"));

    // The backend received the read flag for this enquiry.
    await waitFor(() => {
      expect(backend.calls.adminSetEnquiryRead).toContainEqual({
        id: 1n,
        read: true,
      });
    });
  });

  it("filters the inbox to unread enquiries only", async () => {
    navigateTo("/admin/enquiries");
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      enquiries: [
        makeEnquiry({ id: 1n, name: "Amara Perera", read: false }),
        makeEnquiry({ id: 2n, name: "Bob Silva", read: true }),
      ],
      isAdmin: true,
    });

    renderWithProviders(<App />);
    await screen.findByTestId("enquiries.list");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("enquiries.filter.unread"));

    // Only the unread enquiry remains in the list.
    await waitFor(() => {
      expect(screen.queryByText("Bob Silva")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Amara Perera")).toBeInTheDocument();
  });

  it("deletes an enquiry only after the confirmation dialog is accepted", async () => {
    navigateTo("/admin/enquiries");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      enquiries: [makeEnquiry({ id: 1n, name: "Amara Perera" })],
      isAdmin: true,
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("enquiries.list");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("enquiries.item.1"));
    await screen.findByTestId("enquiries.detail_panel");
    await user.click(screen.getByTestId("enquiries.delete_button"));

    // The confirmation dialog appears and nothing is deleted yet.
    const dialog = await screen.findByTestId("enquiries.delete_dialog");
    expect(dialog).toHaveTextContent("Amara Perera");
    expect(backend.calls.adminDeleteEnquiry).toHaveLength(0);

    await user.click(screen.getByTestId("enquiries.delete_confirm_button"));

    // The backend received the delete and the inbox is now empty.
    await waitFor(() => {
      expect(backend.calls.adminDeleteEnquiry).toEqual([1n]);
    });
    await waitFor(() => {
      expect(
        screen.queryByTestId("enquiries.detail_panel"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows the dashboard totals and recent activity for an administrator", async () => {
    navigateTo("/admin");
    actorHarness.actor = createMockBackend({
      listings: [
        makeListing({ id: 1n, title: "Beachfront villa", published: true }),
        makeListing({
          id: 2n,
          title: "Colombo skyline apartment",
          published: false,
        }),
      ],
      enquiries: [makeEnquiry({ id: 1n, name: "Amara Perera", read: false })],
      isAdmin: true,
    });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("admin_dashboard.page"),
    ).toBeInTheDocument();

    // The dashboard renders a skeleton while its queries load, so wait for the
    // first stat tile before asserting on the settled totals.
    expect(
      await screen.findByTestId("admin_dashboard.stat.total_listings"),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId("admin_dashboard.stat.published"),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId("admin_dashboard.stat.unpublished"),
    ).toHaveTextContent("1");

    // The recent listings and enquiries lists render their entries.
    expect(
      screen.getByTestId("admin_dashboard.listing_item.1"),
    ).toHaveTextContent("Beachfront villa");
    expect(
      screen.getByTestId("admin_dashboard.enquiry_item.1"),
    ).toHaveTextContent("Amara Perera");
  });
});
