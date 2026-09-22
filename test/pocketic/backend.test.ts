import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * The backend behavior lane. Installs the app's own compiled canister into the
 * platform's PocketIC replica and calls its real public API, so a canister whose
 * methods are unimplemented stubs cannot pass the gate.
 *
 * The runner declines cleanly (`no_backend_wasm`) when the backend artifact is
 * absent, so this file is only reached once a real wasm exists.
 *
 * The canister's authorization mixin starts with no administrator. A caller
 * becomes the first administrator by invoking `_initialize_access_control`,
 * which registers that caller and grants the `admin` role. Every admin method
 * then requires a registered, non-anonymous caller holding that role.
 */

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

/** The administrator identity the lane bootstraps and drives admin calls with. */
const admin = createIdentity("lane-admin");

/** A complete listing input with every property field populated. */
function listingInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "Beachfront villa with infinity pool",
    description:
      "A four-bedroom coastal villa with an infinity pool overlooking the Indian Ocean.",
    listingType: { sale: null },
    propertyType: { house: null },
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
    photos: [],
    ...overrides,
  } as Parameters<_SERVICE["adminCreateListing"]>[0];
}

/**
 * A complete `ListingFilter`. Every key is required by the Candid record; an
 * absent filter is `[]`, not a missing key.
 */
function emptyFilter(): Parameters<_SERVICE["searchListings"]>[0] {
  return {
    propertyType: [],
    minBedrooms: [],
    maxPrice: [],
    listingType: [],
    keyword: [],
    minPrice: [],
    location: [],
  };
}

/**
 * A complete `ListingUpdate`. Every key is required by the Candid record; a
 * field left unchanged is `[]`.
 */
function listingUpdate(
  overrides: Partial<Parameters<_SERVICE["adminUpdateListing"]>[1]> = {},
): Parameters<_SERVICE["adminUpdateListing"]>[1] {
  return {
    region: [],
    title: [],
    postcode: [],
    country: [],
    propertyType: [],
    bedrooms: [],
    area: [],
    city: [],
    description: [],
    listingType: [],
    currency: [],
    addressLine: [],
    bathrooms: [],
    price: [],
    photos: [],
    ...overrides,
  };
}

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));

  // Bootstrap the first administrator: `_initialize_access_control` registers
  // the calling principal and grants it the `admin` role. Without this the
  // canister has no administrator and every admin method rejects.
  actor.setIdentity(admin);
  await actor._initialize_access_control();
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state public reads instead of trapping", async () => {
  await expect(actor.listPublishedListings()).resolves.toEqual([]);
  await expect(actor.searchListings(emptyFilter())).resolves.toEqual([]);
  await expect(actor.getListing(1n)).resolves.toEqual([]);
});

it("round-trips a listing through create, publish and public read", async () => {
  const created = await actor.adminCreateListing(listingInput());
  expect(created).toHaveProperty("ok");
  const listing = (created as { ok: { id: bigint; published: boolean } }).ok;
  expect(listing.published).toBe(false);

  // An unpublished listing must not appear on the public site.
  await expect(actor.listPublishedListings()).resolves.toEqual([]);
  await expect(actor.getListing(listing.id)).resolves.toEqual([]);

  const published = await actor.adminSetListingPublished(listing.id, true);
  expect(published).toHaveProperty("ok");

  const publicListings = await actor.listPublishedListings();
  expect(publicListings).toHaveLength(1);
  expect(publicListings[0]).toMatchObject({
    id: listing.id,
    title: "Beachfront villa with infinity pool",
    published: true,
  });

  const detail = await actor.getListing(listing.id);
  expect(detail).toHaveLength(1);
});

it("stores an enquiry against a published listing and surfaces it to admins", async () => {
  const created = await actor.adminCreateListing(
    listingInput({ title: "Enquiry target villa" }),
  );
  const listing = (created as { ok: { id: bigint } }).ok;
  await actor.adminSetListingPublished(listing.id, true);

  const submitted = await actor.submitEnquiry({
    listingId: listing.id,
    name: "Amara Perera",
    email: "amara@example.com",
    phone: "+94 77 123 4567",
    message: "I would like to arrange a viewing.",
  });
  expect(submitted).toHaveProperty("ok");

  const inbox = await actor.adminListEnquiries();
  expect(inbox).toHaveLength(1);
  expect(inbox[0].enquiry).toMatchObject({
    name: "Amara Perera",
    email: "amara@example.com",
    read: false,
  });
  expect(inbox[0].listingTitle).toBe("Enquiry target villa");
});

it("rejects an enquiry against an unpublished listing", async () => {
  const created = await actor.adminCreateListing(
    listingInput({ title: "Unpublished villa" }),
  );
  const listing = (created as { ok: { id: bigint } }).ok;

  const submitted = await actor.submitEnquiry({
    listingId: listing.id,
    name: "Bob",
    email: "bob@example.com",
    phone: "+94 77 000 0000",
    message: "Is this available?",
  });
  expect(submitted).toHaveProperty("err");
});

it("rejects every admin method for a non-administrator caller", async () => {
  // A freshly created actor calls as the anonymous principal until an identity
  // is set, which is never an administrator.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);

  await expect(guest.adminListListings()).resolves.toEqual([]);
  await expect(guest.adminGetListing(1n)).resolves.toEqual([]);
  await expect(guest.adminListEnquiries()).resolves.toEqual([]);

  const create = await guest.adminCreateListing(listingInput());
  expect(create).toEqual({ err: { notAuthorized: null } });

  const update = await guest.adminUpdateListing(
    1n,
    listingUpdate({ title: ["Hijacked"] }),
  );
  expect(update).toEqual({ err: { notAuthorized: null } });

  const publish = await guest.adminSetListingPublished(1n, true);
  expect(publish).toEqual({ err: { notAuthorized: null } });

  const remove = await guest.adminDeleteListing(1n);
  expect(remove).toEqual({ err: { notAuthorized: null } });

  const addPhotos = await guest.adminAddListingPhotos(1n, []);
  expect(addPhotos).toEqual({ err: { notAuthorized: null } });

  const removePhoto = await guest.adminRemoveListingPhoto(1n, 0n);
  expect(removePhoto).toEqual({ err: { notAuthorized: null } });

  const setRead = await guest.adminSetEnquiryRead(1n, true);
  expect(setRead).toEqual({ err: { notAuthorized: null } });

  const deleteEnquiry = await guest.adminDeleteEnquiry(1n);
  expect(deleteEnquiry).toEqual({ err: { notAuthorized: null } });
});

it("keeps a registered non-admin caller out of management actions", async () => {
  // A registered caller without the admin role is still not an administrator.
  // Only an existing admin may assign roles, so the lane's admin grants the
  // member the plain `user` role.
  const member = createIdentity("lane-member");
  const memberActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  memberActor.setIdentity(member);
  await memberActor._initialize_access_control();
  await actor.assignCallerUserRole(member.getPrincipal(), { user: null });

  await expect(memberActor.isCallerAdmin()).resolves.toBe(false);
  await expect(memberActor.adminListListings()).resolves.toEqual([]);

  const create = await memberActor.adminCreateListing(listingInput());
  expect(create).toEqual({ err: { notAuthorized: null } });
});
