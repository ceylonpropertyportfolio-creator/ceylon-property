import App from "@/App";
import {
  actorHarness,
  identityHarness,
  navigateTo,
  renderWithProviders,
  resetHarness,
} from "@/test/harness";
import { createMockBackend, makeListing } from "@/test/mock-backend";
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
 * `PhotoUploader` builds an `ExternalBlob` from the picked file and attaches an
 * upload-progress callback. The real implementation talks to the object-storage
 * gateway, which is not available in jsdom, so this local stand-in records the
 * bytes and returns a blob-shaped value. The uploader's own filtering, progress
 * and `onUpload` wiring still run for real.
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

/** Fills every required property field with a valid draft. */
async function fillListingForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { title?: string } = {},
) {
  await user.type(
    screen.getByTestId("admin_listing_form.title_input"),
    overrides.title ?? "Beachfront villa with infinity pool",
  );
  await user.type(
    screen.getByTestId("admin_listing_form.description_textarea"),
    "A four-bedroom coastal villa with an infinity pool overlooking the ocean.",
  );
  await user.type(
    screen.getByTestId("admin_listing_form.price_input"),
    "1300000",
  );
  await user.type(
    screen.getByTestId("admin_listing_form.address_input"),
    "42 Lighthouse Road",
  );
  await user.type(screen.getByTestId("admin_listing_form.city_input"), "Galle");
  await user.type(
    screen.getByTestId("admin_listing_form.region_input"),
    "Southern Province",
  );
  await user.type(screen.getByTestId("admin_listing_form.area_input"), "2400");
}

describe("admin listing editor", () => {
  beforeEach(() => {
    resetHarness();
    identityHarness.isAuthenticated = true;
  });

  it("creates a listing from a valid draft and returns to the table", async () => {
    navigateTo("/admin/listings/new");
    const backend = createMockBackend({ listings: [], isAdmin: true });
    actorHarness.actor = backend;

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("admin_listing_editor.page"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("admin_listing_form")).toBeInTheDocument();

    const user = userEvent.setup();
    await fillListingForm(user);
    await user.click(screen.getByTestId("admin_listing_form.submit_button"));

    // The backend received the trimmed, typed create payload.
    await waitFor(() => {
      expect(backend.calls.adminCreateListing).toHaveLength(1);
    });
    expect(backend.calls.adminCreateListing[0]).toMatchObject({
      title: "Beachfront villa with infinity pool",
      price: 1_300_000n,
      city: "Galle",
      region: "Southern Province",
      bedrooms: 3n,
      bathrooms: 2n,
      area: 2400n,
    });

    // The editor navigates back to the listings table.
    await waitFor(() => {
      expect(window.location.pathname).toBe("/admin/listings");
    });
  });

  it("blocks an invalid draft and reports the offending fields", async () => {
    navigateTo("/admin/listings/new");
    const backend = createMockBackend({ listings: [], isAdmin: true });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await screen.findByTestId("admin_listing_form");

    const user = userEvent.setup();
    await user.click(screen.getByTestId("admin_listing_form.submit_button"));

    // Required-field errors are shown and nothing reaches the backend.
    expect(
      screen.getByTestId("admin_listing_form.title_error"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_listing_form.description_error"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_listing_form.price_error"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin_listing_form.area_error"),
    ).toBeInTheDocument();
    expect(backend.calls.adminCreateListing).toHaveLength(0);
  });

  it("prefills the form from an existing listing and saves an update", async () => {
    navigateTo("/admin/listings/1/edit");
    const backend = createMockBackend({
      listings: [
        makeListing({
          id: 1n,
          title: "Beachfront villa",
          price: 1_300_000n,
          city: "Galle",
          region: "Southern Province",
        }),
      ],
      isAdmin: true,
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);

    // The stored listing is loaded into the draft.
    await waitFor(() => {
      expect(screen.getByTestId("admin_listing_form.title_input")).toHaveValue(
        "Beachfront villa",
      );
    });
    expect(screen.getByTestId("admin_listing_form.price_input")).toHaveValue(
      "1300000",
    );
    expect(screen.getByTestId("admin_listing_form.city_input")).toHaveValue(
      "Galle",
    );

    const user = userEvent.setup();
    await user.clear(screen.getByTestId("admin_listing_form.title_input"));
    await user.type(
      screen.getByTestId("admin_listing_form.title_input"),
      "Beachfront villa, renovated",
    );
    await user.click(screen.getByTestId("admin_listing_form.submit_button"));

    // The backend received a partial update bound to this listing id.
    await waitFor(() => {
      expect(backend.calls.adminUpdateListing).toHaveLength(1);
    });
    expect(backend.calls.adminUpdateListing[0].id).toBe(1n);
    expect(backend.calls.adminUpdateListing[0].patch.title).toBe(
      "Beachfront villa, renovated",
    );
  });

  it("shows a not-found state for a non-numeric listing id", async () => {
    navigateTo("/admin/listings/not-a-number/edit");
    actorHarness.actor = createMockBackend({ listings: [], isAdmin: true });

    renderWithProviders(<App />);

    expect(
      await screen.findByTestId("admin_listing_editor.error_state"),
    ).toHaveTextContent("Listing not found");
  });

  it("attaches a picked photo to an existing listing", async () => {
    navigateTo("/admin/listings/1/edit");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      isAdmin: true,
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("admin_listing_form.title_input")).toHaveValue(
        "Beachfront villa",
      );
    });

    // The uploader starts with no photos attached.
    expect(
      screen.getByTestId("listing_photos.empty_state"),
    ).toBeInTheDocument();

    const file = new File(["fake-bytes"], "villa.png", { type: "image/png" });
    // jsdom's `File` does not always expose `arrayBuffer`; the uploader reads
    // the bytes through it, so supply the method the browser provides.
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new TextEncoder().encode("fake-bytes").buffer,
    });
    // The file input is visually hidden (`sr-only`), so drive its change event
    // directly rather than through a pointer interaction.
    fireEvent.change(screen.getByTestId("listing_photos.file_input"), {
      target: { files: [file] },
    });

    // The photo is persisted against the listing through the backend.
    await waitFor(() => {
      expect(backend.calls.adminAddListingPhotos).toHaveLength(1);
    });
    expect(backend.calls.adminAddListingPhotos[0].id).toBe(1n);
    expect(backend.calls.adminAddListingPhotos[0].photos[0].filename).toBe(
      "villa.png",
    );
  });

  it("rejects a non-image file without calling the backend", async () => {
    navigateTo("/admin/listings/1/edit");
    const backend = createMockBackend({
      listings: [makeListing({ id: 1n, title: "Beachfront villa" })],
      isAdmin: true,
    });
    actorHarness.actor = backend;

    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("admin_listing_form.title_input")).toHaveValue(
        "Beachfront villa",
      );
    });

    const file = new File(["not-an-image"], "notes.txt", {
      type: "text/plain",
    });
    fireEvent.change(screen.getByTestId("listing_photos.file_input"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByTestId("listing_photos.error_state"),
    ).toHaveTextContent("Only image files");
    expect(backend.calls.adminAddListingPhotos).toHaveLength(0);
  });
});
