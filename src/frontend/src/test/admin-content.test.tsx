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
  makeBanner,
  makeCategory,
  makeChatbotEntry,
  makeCustomer,
  makePayment,
  makePlan,
  makeSubscription,
} from "@/test/mock-backend";
import { PaymentStatus } from "@/types/listing";
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
 * The administrator console surfaces added alongside the customer advertising
 * flow: manual payment review, plan and pricing management, and the site
 * content managers (banners, categories, help content). Every test signs in as
 * an administrator and seeds the mock backend with the records under
 * management.
 */
describe("admin content and payment management", () => {
  beforeEach(() => {
    resetHarness();
    identityHarness.isAuthenticated = true;
  });

  it("lists submitted payments and confirms one manually", async () => {
    navigateTo("/admin/payments");
    const backend = createMockBackend({
      isAdmin: true,
      plans: [makePlan({ id: 1n, name: "Individual", price: 1_990n })],
      payments: [
        makePayment({
          id: 1n,
          status: PaymentStatus.pending,
          reference: "BANK-REF-001",
          planName: "Individual",
        }),
      ],
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);

    // The review notice states the manual-confirmation rule.
    expect(
      await screen.findByTestId("admin_payments.review_notice"),
    ).toHaveTextContent("Payments are confirmed manually");

    const row = await screen.findByTestId("admin_payments.row.1");
    expect(within(row).getByText("BANK-REF-001")).toBeInTheDocument();
    expect(
      within(row).getByTestId("admin_payments.status.1"),
    ).toHaveTextContent("Awaiting review");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("admin_payments.confirm_button.1"));

    // Confirmation is an explicit, confirmed action, not automatic.
    await screen.findByTestId("admin_payments.confirm_dialog");
    await user.click(
      screen.getByTestId("admin_payments.confirm_confirm_button"),
    );

    await waitFor(() => {
      expect(backend.calls.adminConfirmPayment).toEqual([1n]);
    });
    expect(backend.payments[0].status).toBe(PaymentStatus.confirmed);
  });

  it("lists plans with their prices and allowances", async () => {
    navigateTo("/admin/plans");
    actorHarness.actor = createMockBackend({
      isAdmin: true,
      plans: [
        makePlan({
          id: 1n,
          name: "Individual",
          price: 1_990n,
          listingAllowance: 3n,
          imageAllowance: 5n,
        }),
        makePlan({
          id: 2n,
          name: "Professional",
          price: 9_990n,
          listingAllowance: undefined,
          imageAllowance: undefined,
        }),
      ],
    });

    renderWithProviders(<App />);

    const firstRow = await screen.findByTestId("admin_plans.row.1");
    expect(within(firstRow).getByText("Individual")).toBeInTheDocument();
    expect(within(firstRow).getByText("Rs. 1,990 / month")).toBeInTheDocument();
    expect(
      within(firstRow).getByTestId("admin_plans.status.1"),
    ).toHaveTextContent("Active");

    // The unlimited plan renders its allowances as unlimited.
    const secondRow = screen.getByTestId("admin_plans.row.2");
    expect(within(secondRow).getByText("Professional")).toBeInTheDocument();
    expect(within(secondRow).getAllByText("Unlimited").length).toBeGreaterThan(
      0,
    );
  });

  it("lists the managed banners, categories and help entries", async () => {
    navigateTo("/admin/banners");
    actorHarness.actor = createMockBackend({
      isAdmin: true,
      banners: [
        makeBanner({ id: 1n, title: "Monsoon sale on coastal villas" }),
        makeBanner({ id: 2n, title: "New Colombo apartments" }),
      ],
    });

    const { unmount } = renderWithProviders(<App />);
    expect(await screen.findByTestId("banners.item.1")).toHaveTextContent(
      "Monsoon sale on coastal villas",
    );
    expect(screen.getByTestId("banners.item.2")).toHaveTextContent(
      "New Colombo apartments",
    );
    unmount();

    navigateTo("/admin/categories");
    actorHarness.actor = createMockBackend({
      isAdmin: true,
      categories: [makeCategory({ id: 1n, name: "Houses", slug: "houses" })],
    });
    const categories = renderWithProviders(<App />);
    expect(await screen.findByTestId("categories.item.1")).toHaveTextContent(
      "Houses",
    );
    categories.unmount();

    navigateTo("/admin/chatbot");
    actorHarness.actor = createMockBackend({
      isAdmin: true,
      chatbotEntries: [
        makeChatbotEntry({
          id: 1n,
          question: "What do the plans cost?",
          answer: "Plans start at Rs. 1,990 per month.",
        }),
      ],
    });
    renderWithProviders(<App />);
    expect(await screen.findByTestId("chatbot.item.1")).toHaveTextContent(
      "What do the plans cost?",
    );
  });

  it("lists registered customers with their plan and status", async () => {
    navigateTo("/admin/customers");
    actorHarness.actor = createMockBackend({
      isAdmin: true,
      account: {
        customer: makeCustomer({ name: "Amara Perera" }),
        subscription: makeSubscription({ planName: "Individual" }),
      },
    });

    renderWithProviders(<App />);

    const row = await screen.findByTestId("admin_customers.row.1");
    expect(within(row).getByText("Amara Perera")).toBeInTheDocument();
    expect(within(row).getByText("Individual")).toBeInTheDocument();
  });

  it("shows the dashboard totals for listings, customers and payments", async () => {
    navigateTo("/admin");
    actorHarness.actor = createMockBackend({
      isAdmin: true,
      listings: [],
      account: {
        customer: makeCustomer(),
        subscription: makeSubscription(),
      },
      payments: [makePayment({ id: 1n, status: PaymentStatus.pending })],
    });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("admin_dashboard.stat.total_listings"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_dashboard.stat.customers"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_dashboard.stat.payments"),
    ).toHaveTextContent("1");
  });

  it("keeps the admin gate closed to a non-administrator", async () => {
    navigateTo("/admin/payments");
    actorHarness.actor = createMockBackend({ isAdmin: false });

    renderWithProviders(<App />);

    // The console never renders its payment surface for a non-admin caller.
    await waitFor(() => {
      expect(
        screen.queryByTestId("admin_payments.page"),
      ).not.toBeInTheDocument();
    });
  });
});
