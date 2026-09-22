import App from "@/App";
import {
  actorHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import { createMockBackend, makeListing } from "@/test/mock-backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

describe("public listing detail page", () => {
  beforeEach(() => {
    resetHarness();
  });

  it("shows the price, location, badges and every property attribute", async () => {
    navigateTo("/listings/1");
    actorHarness.actor = createMockBackend({
      listings: [
        makeListing({
          id: 1n,
          title: "Beachfront villa with infinity pool",
          price: 1_300_000n,
          currency: "LKR",
          addressLine: "42 Lighthouse Road",
          city: "Galle",
          region: "Southern Province",
          postcode: "80000",
          country: "Sri Lanka",
          bedrooms: 4n,
          bathrooms: 3n,
          area: 2400n,
        }),
      ],
    });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("listing_detail.page"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Beachfront villa with infinity pool",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("listing_detail.price")).toHaveTextContent(
      "Rs. 1,300,000",
    );
    expect(
      screen.getByText("Galle, Southern Province, Sri Lanka"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("listing_detail.listing_type_badge"),
    ).toHaveTextContent("For sale");
    expect(
      screen.getByTestId("listing_detail.property_type_badge"),
    ).toHaveTextContent("House");

    // The attribute panel exposes all eight property details.
    const attributes = screen.getByTestId("listing_detail.attributes_panel");
    expect(attributes).toHaveTextContent("Bedrooms");
    expect(attributes).toHaveTextContent("Bathrooms");
    expect(attributes).toHaveTextContent("Floor area");
    expect(attributes).toHaveTextContent("2,400 sq ft");
    expect(attributes).toHaveTextContent("42 Lighthouse Road");
    expect(attributes).toHaveTextContent("Galle");
    expect(attributes).toHaveTextContent("Southern Province");
    expect(attributes).toHaveTextContent("80000");
    expect(attributes).toHaveTextContent("Sri Lanka");
  });

  it("renders the enquiry form for the listing", async () => {
    navigateTo("/listings/1");
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n })],
    });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("listing_detail.enquiry_panel"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.form")).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.name_input")).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.email_input")).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.phone_input")).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.message_textarea")).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.submit_button")).toBeInTheDocument();
  });

  it("shows a not-found state for a non-numeric listing id", async () => {
    navigateTo("/listings/not-a-number");
    actorHarness.actor = createMockBackend({ listings: [] });

    renderWithProviders(<App />);

    // Re-query the live document each poll and match the copy unique to the
    // invalid-id branch, so a transient node from the previous route cannot
    // satisfy the assertion.
    await waitFor(() => {
      expect(
        screen.getByTestId("listing_detail.error_state"),
      ).toHaveTextContent("Property not found");
    });
    expect(screen.getByTestId("listing_detail.back_link")).toBeInTheDocument();
  });

  it("shows a not-found state when the listing is unpublished", async () => {
    navigateTo("/listings/99");
    actorHarness.actor = createMockBackend({
      listings: [makeListing({ id: 1n })],
    });

    renderWithProviders(<App />);

    // `App` builds a single module-level router, so a render can briefly show
    // the previous test's route before the router settles on `/listings/99`.
    // Re-query the live document each poll and match the copy unique to the
    // removed/unpublished branch, so a transient node from the previous route
    // cannot satisfy the assertion.
    await waitFor(() => {
      expect(
        screen.getByTestId("listing_detail.error_state"),
      ).toHaveTextContent("This property is no longer available");
    });

    // The unpublished listing is not rendered as a normal detail page.
    expect(screen.queryByTestId("listing_detail.page")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("listing_detail.enquiry_panel"),
    ).not.toBeInTheDocument();
  });

  it("shows a retryable error state when the listing read fails", async () => {
    navigateTo("/listings/1");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n })],
    });
    backend.getListing = async () => {
      throw new Error("replica unavailable");
    };
    actorHarness.actor = backend;

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(
        screen.getByTestId("listing_detail.error_state"),
      ).toHaveTextContent("We could not load this property");
    });
    // The retryable branch offers a retry action; the not-found branch does not.
    expect(screen.getByTestId("error_state.retry_button")).toBeInTheDocument();
    expect(screen.queryByTestId("listing_detail.page")).not.toBeInTheDocument();
  });

  it("validates required fields before submitting an enquiry", async () => {
    navigateTo("/listings/1");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n })],
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("enquiry.form");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("enquiry.submit_button"));

    expect(screen.getByTestId("enquiry.name_error")).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.email_error")).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.phone_error")).toBeInTheDocument();
    expect(screen.getByTestId("enquiry.message_error")).toBeInTheDocument();
    // Nothing was sent to the backend.
    expect(backend.calls.submitEnquiry).toHaveLength(0);
  });

  it("rejects an invalid email address", async () => {
    navigateTo("/listings/1");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n })],
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("enquiry.form");

    const user = userEvent.setup();
    await user.type(screen.getByTestId("enquiry.name_input"), "Amara Perera");
    await user.type(screen.getByTestId("enquiry.email_input"), "not-an-email");
    await user.type(
      screen.getByTestId("enquiry.phone_input"),
      "+94 77 123 4567",
    );
    await user.type(
      screen.getByTestId("enquiry.message_textarea"),
      "I would like to arrange a viewing.",
    );
    await user.click(screen.getByTestId("enquiry.submit_button"));

    expect(screen.getByTestId("enquiry.email_error")).toHaveTextContent(
      "Please enter a valid email address.",
    );
    expect(backend.calls.submitEnquiry).toHaveLength(0);
  });

  it("submits a valid enquiry and shows the success confirmation", async () => {
    navigateTo("/listings/1");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("enquiry.form");

    const user = userEvent.setup();
    await user.type(screen.getByTestId("enquiry.name_input"), "Amara Perera");
    await user.type(
      screen.getByTestId("enquiry.email_input"),
      "amara@example.com",
    );
    await user.type(
      screen.getByTestId("enquiry.phone_input"),
      "+94 77 123 4567",
    );
    await user.type(
      screen.getByTestId("enquiry.message_textarea"),
      "I would like to arrange a viewing.",
    );
    await user.click(screen.getByTestId("enquiry.submit_button"));

    // The backend received the trimmed payload bound to this listing.
    await waitFor(() => {
      expect(backend.calls.submitEnquiry).toHaveLength(1);
    });
    expect(backend.calls.submitEnquiry[0]).toEqual({
      listingId: 1n,
      name: "Amara Perera",
      email: "amara@example.com",
      phone: "+94 77 123 4567",
      message: "I would like to arrange a viewing.",
    });

    // The visitor sees a clear confirmation naming the property.
    const success = await screen.findByTestId("enquiry.success_state");
    expect(success).toHaveTextContent("Enquiry sent");
    expect(success).toHaveTextContent("Beachfront villa");
    expect(
      screen.getByTestId("enquiry.send_another_button"),
    ).toBeInTheDocument();
  });

  it("surfaces a backend rejection instead of a false success", async () => {
    navigateTo("/listings/1");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n })],
    });
    // The listing is readable, but the backend refuses the enquiry.
    backend.submitEnquiry = async (input) => {
      backend.calls.submitEnquiry.push(input);
      return {
        __kind__: "err",
        err: { __kind__: "listingNotPublished", listingNotPublished: 1n },
      };
    };
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("enquiry.form");

    const user = userEvent.setup();
    await user.type(screen.getByTestId("enquiry.name_input"), "Amara Perera");
    await user.type(
      screen.getByTestId("enquiry.email_input"),
      "amara@example.com",
    );
    await user.type(
      screen.getByTestId("enquiry.phone_input"),
      "+94 77 123 4567",
    );
    await user.type(
      screen.getByTestId("enquiry.message_textarea"),
      "I would like to arrange a viewing.",
    );
    await user.click(screen.getByTestId("enquiry.submit_button"));

    expect(await screen.findByTestId("enquiry.error_state")).toHaveTextContent(
      "not currently accepting enquiries",
    );
    expect(
      screen.queryByTestId("enquiry.success_state"),
    ).not.toBeInTheDocument();
  });
});
