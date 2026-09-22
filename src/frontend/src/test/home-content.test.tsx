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
  makeListing,
  makePlan,
} from "@/test/mock-backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

/**
 * The public home page's admin-managed content: the rotating banner slider,
 * the category shortcuts, the plan summary and the help assistant. These are
 * the surfaces a visitor sees before signing in, so they must render from the
 * backend content reads and degrade gracefully when a read is empty.
 */
describe("public home content", () => {
  beforeEach(() => {
    resetHarness();
    navigateTo("/");
  });

  it("renders the banner slider, categories, plans and help entry", async () => {
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      banners: [
        makeBanner({ id: 1n, title: "Monsoon sale on coastal villas" }),
        makeBanner({ id: 2n, title: "New Colombo apartments" }),
      ],
      categories: [
        makeCategory({ id: 1n, name: "Houses", slug: "houses" }),
        makeCategory({ id: 2n, name: "Apartments", slug: "apartments" }),
      ],
      plans: [
        makePlan({ id: 1n, name: "Individual", price: 1_990n }),
        makePlan({ id: 2n, name: "Agent", price: 3_990n }),
      ],
      chatbotEntries: [makeChatbotEntry()],
    });

    renderWithProviders(<App />);

    // The rotating banner slider shows the first banner and its controls.
    expect(
      await screen.findByTestId("home.banner_section"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Monsoon sale on coastal villas" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home.banner_next_button")).toBeInTheDocument();

    // The category band renders the admin-managed categories.
    expect(screen.getByTestId("home.categories_section")).toBeInTheDocument();
    expect(screen.getByTestId("home.category_card.houses")).toBeInTheDocument();
    expect(
      screen.getByTestId("home.category_card.apartments"),
    ).toBeInTheDocument();

    // The plan summary renders each plan with its monthly price.
    expect(screen.getByTestId("home.plans_section")).toBeInTheDocument();
    expect(screen.getByTestId("home.plan_card.1")).toHaveTextContent(
      "Individual",
    );
    expect(screen.getByTestId("home.plan_card.1")).toHaveTextContent(
      "Rs. 1,990 / month",
    );

    // The help assistant is reachable from the home page.
    expect(screen.getByTestId("help_chatbot.open_button")).toBeInTheDocument();
  });

  it("advances the banner slider with the next control", async () => {
    actorHarness.actor = createMockBackend({
      banners: [
        makeBanner({ id: 1n, title: "First announcement" }),
        makeBanner({ id: 2n, title: "Second announcement" }),
      ],
    });

    renderWithProviders(<App />);
    await screen.findByTestId("home.banner_section");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("home.banner_next_button"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Second announcement" }),
      ).toBeInTheDocument();
    });
  });

  it("answers a question about plans and a question about posting", async () => {
    actorHarness.actor = createMockBackend({
      chatbotEntries: [
        makeChatbotEntry({
          id: 1n,
          question: "What do the plans cost?",
          answer: "Plans start at Rs. 1,990 per month for the Individual plan.",
          keywords: ["plans", "cost", "price"],
        }),
        makeChatbotEntry({
          id: 2n,
          question: "How do I list my property?",
          answer:
            "Choose a plan, then submit your property from the post page.",
          keywords: ["list", "property", "post"],
        }),
      ],
    });

    renderWithProviders(<App />);

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("help_chatbot.open_button"));
    expect(await screen.findByTestId("help_chatbot.panel")).toBeInTheDocument();

    // A question about plans is answered from the matching entry.
    await user.type(
      screen.getByTestId("help_chatbot.input"),
      "What do the plans cost?",
    );
    await user.click(screen.getByTestId("help_chatbot.send_button"));

    expect(
      await screen.findByText(
        "Plans start at Rs. 1,990 per month for the Individual plan.",
      ),
    ).toBeInTheDocument();

    // A question about posting a property is answered from its own entry.
    await user.type(
      screen.getByTestId("help_chatbot.input"),
      "How do I list my property?",
    );
    await user.click(screen.getByTestId("help_chatbot.send_button"));

    expect(
      await screen.findByText(
        "Choose a plan, then submit your property from the post page.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the home page usable when banners and categories are empty", async () => {
    actorHarness.actor = createMockBackend({
      listings: [],
      banners: [],
      categories: [],
      plans: [],
      chatbotEntries: [],
    });

    renderWithProviders(<App />);

    // The hero and help entry still render; the empty content bands do not
    // leave a hole in the page.
    expect(
      await screen.findByRole("heading", { name: /find your place/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("home.featured_empty"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("home.plans_unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("help_chatbot.open_button")).toBeInTheDocument();
  });

  it("falls back to the built-in category shortcuts when none are managed", async () => {
    actorHarness.actor = createMockBackend({ categories: [] });

    renderWithProviders(<App />);

    // The built-in shortcut set keeps the category band populated.
    expect(
      await screen.findByTestId("home.categories_section"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home.category_card.houses")).toBeInTheDocument();
  });

  it("shows the banner fallback when the banner read is empty", async () => {
    actorHarness.actor = createMockBackend({ banners: [] });

    renderWithProviders(<App />);

    // No banner content means no slider, but the page still renders.
    await waitFor(() => {
      expect(
        screen.queryByTestId("home.banner_section"),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: /find your place/i }),
    ).toBeInTheDocument();
  });
});
