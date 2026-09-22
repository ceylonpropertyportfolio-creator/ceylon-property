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
  makeCustomer,
  makeListing,
  makePhoto,
  makePlan,
  makeSubscription,
} from "@/test/mock-backend";
import { PaymentStatus } from "@/types/listing";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { buildCoreInfrastructureMock } = await import(
    "@/test/mock-core-infrastructure"
  );
  return buildCoreInfrastructureMock();
});

/**
 * `PhotoUploader` builds an `ExternalBlob` from the picked file. The real
 * implementation talks to the object-storage gateway, which is not available in
 * jsdom, so this local stand-in records the bytes and returns a blob-shaped
 * value. The uploader's own filtering and `onUpload` wiring still run for real.
 */
vi.mock("@caffeineai/object-storage", () => ({
  ExternalBlob: {
    fromBytes: (bytes: Uint8Array, type: string, name: string) => ({
      bytes,
      type,
      name,
      withUploadProgress: () => ({ bytes, type, name }),
    }),
  },
}));

/** The Individual plan's published allowances, matching AGENTS.md. */
const INDIVIDUAL = makePlan({
  id: 1n,
  name: "Individual",
  price: 1_990n,
  listingAllowance: 3n,
  imageAllowance: 5n,
});

/** A signed-in customer account with the given subscription. */
function accountWith(subscription: ReturnType<typeof makeSubscription> | null) {
  return {
    customer: makeCustomer(),
    ...(subscription ? { subscription } : {}),
  };
}

/** Builds a `File` whose `arrayBuffer` works under jsdom. */
function imageFile(name: string): File {
  const file = new File(["fake-bytes"], name, { type: "image/png" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode("fake-bytes").buffer,
  });
  return file;
}

describe("customer advertising flow", () => {
  beforeEach(() => {
    resetHarness();
  });

  it("sends a signed-out visitor from post-property to the customer sign-in", async () => {
    navigateTo("/post-property");
    actorHarness.actor = createMockBackend({ plans: [INDIVIDUAL] });
    identityHarness.isAuthenticated = false;

    renderWithProviders(<App />);

    // The customer sign-in gate is shown, not the listing form.
    expect(
      await screen.findByTestId("post_property.auth_panel"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("post_property.auth_panel.signin_button"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("customer_listing_form"),
    ).not.toBeInTheDocument();
  });

  it("directs a signed-in customer with no plan to the plans page", async () => {
    navigateTo("/post-property");
    actorHarness.actor = createMockBackend({
      plans: [INDIVIDUAL],
      account: accountWith(null),
    });
    identityHarness.isAuthenticated = true;

    renderWithProviders(<App />);

    // Without an active subscription the form is replaced by the plan prompt.
    expect(
      await screen.findByTestId("post_property.plans_button"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("customer_listing_form"),
    ).not.toBeInTheDocument();
  });

  it("shows the active plan with activate and upgrade actions on the account page", async () => {
    navigateTo("/account");
    actorHarness.actor = createMockBackend({
      plans: [INDIVIDUAL],
      account: accountWith(
        makeSubscription({ planId: 1n, planName: "Individual" }),
      ),
    });
    identityHarness.isAuthenticated = true;

    renderWithProviders(<App />);

    // The plan panel names the plan and exposes both actions.
    expect(await screen.findByTestId("account.plan_panel")).toBeInTheDocument();
    expect(screen.getByTestId("account.plan_panel")).toHaveTextContent(
      "Individual",
    );
    expect(
      screen.getByTestId("account.activate_plan_button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("account.upgrade_plan_button"),
    ).toBeInTheDocument();
  });

  it("blocks a fourth listing on the Individual plan and names the limit", async () => {
    navigateTo("/post-property");
    const backend = createMockBackend({
      plans: [INDIVIDUAL],
      account: accountWith(
        makeSubscription({ planId: 1n, planName: "Individual" }),
      ),
      // The Individual plan allows three listings; three already exist.
      listings: [
        makeListing({ id: 1n, title: "First property" }),
        makeListing({ id: 2n, title: "Second property" }),
        makeListing({ id: 3n, title: "Third property" }),
      ],
    });
    actorHarness.actor = backend;
    identityHarness.isAuthenticated = true;

    renderWithProviders(<App />);

    const user = userEvent.setup();
    await screen.findByTestId("customer_listing_form");

    await user.type(
      screen.getByTestId("customer_listing_form.title_input"),
      "Fourth property",
    );
    await user.type(
      screen.getByTestId("customer_listing_form.description_textarea"),
      "A fourth coastal property that exceeds the Individual plan allowance.",
    );
    await user.type(
      screen.getByTestId("customer_listing_form.price_input"),
      "1300000",
    );
    await user.type(
      screen.getByTestId("customer_listing_form.address_input"),
      "42 Lighthouse Road",
    );
    await user.type(
      screen.getByTestId("customer_listing_form.city_input"),
      "Galle",
    );
    await user.type(
      screen.getByTestId("customer_listing_form.region_input"),
      "Southern Province",
    );
    await user.type(
      screen.getByTestId("customer_listing_form.area_input"),
      "2400",
    );
    await user.click(screen.getByTestId("customer_listing_form.submit_button"));

    // The backend rejected the create and the UI names the plan limit.
    await waitFor(() => {
      expect(backend.calls.createMyListing).toHaveLength(1);
    });
    expect(
      await screen.findByTestId("customer_listing_form.error_state"),
    ).toHaveTextContent("Your plan allows up to 3 active listings");
  });

  it("blocks a sixth photo on the Individual plan and names the limit", async () => {
    navigateTo("/account");
    const backend = createMockBackend({
      plans: [INDIVIDUAL],
      account: accountWith(
        makeSubscription({ planId: 1n, planName: "Individual" }),
      ),
      // The Individual plan allows five photos; this listing already has five.
      listings: [
        makeListing({
          id: 1n,
          title: "Beachfront villa",
          photos: [
            makePhoto({ filename: "1.png" }),
            makePhoto({ filename: "2.png" }),
            makePhoto({ filename: "3.png" }),
            makePhoto({ filename: "4.png" }),
            makePhoto({ filename: "5.png" }),
          ],
        }),
      ],
    });
    actorHarness.actor = backend;
    identityHarness.isAuthenticated = true;

    renderWithProviders(<App />);

    const user = userEvent.setup();
    await screen.findByTestId("account.listing_row.1");
    await user.click(screen.getByTestId("account.listing_edit_button.1"));

    // The edit form exposes the uploader with the five existing photos.
    await screen.findByTestId("customer_listing_form");
    expect(screen.getByTestId("listing_photos.item.5")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("listing_photos.file_input"), {
      target: { files: [imageFile("sixth.png")] },
    });

    // The backend rejected the upload because it exceeds the plan allowance.
    await waitFor(() => {
      expect(backend.calls.addMyListingPhotos).toHaveLength(1);
    });
    // The uploader surfaces the failure; the listing keeps its five photos.
    expect(
      await screen.findByTestId("listing_photos.error_state"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("listing_photos.item.6"),
    ).not.toBeInTheDocument();
  });

  it("keeps a submitted payment pending until an administrator confirms it", async () => {
    navigateTo("/plans");
    const backend = createMockBackend({
      plans: [INDIVIDUAL],
      account: accountWith(null),
    });
    actorHarness.actor = backend;
    identityHarness.isAuthenticated = true;

    renderWithProviders(<App />);

    const user = userEvent.setup();
    await screen.findByTestId("plans.plan_card.1");
    await user.click(
      screen.getByRole("button", { name: /choose individual/i }),
    );

    await user.type(
      screen.getByTestId("plans.reference_input"),
      "BANK-REF-001",
    );
    await user.click(screen.getByTestId("plans.submit_button"));

    // The reference reaches the backend and the UI says it awaits confirmation.
    await waitFor(() => {
      expect(backend.calls.submitPayment).toHaveLength(1);
    });
    expect(backend.calls.submitPayment[0]).toMatchObject({
      planId: 1n,
      reference: "BANK-REF-001",
    });
    expect(await screen.findByTestId("plans.submit_success")).toHaveTextContent(
      "An administrator will confirm it shortly",
    );

    // The payment is recorded as pending, never auto-confirmed.
    expect(backend.payments).toHaveLength(1);
    expect(backend.payments[0].status).toBe(PaymentStatus.pending);
  });
});
