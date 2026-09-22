# Project Guidance

## User Preferences

- Palette: green #2E7D32 primary, rich beige #E8DDCC surfaces, light brown #B08968 accents, white #FFFFFF cards, dark #1F1F1F text
- Larger, cleaner typography scale across headings, body copy, cards and forms
- Public navigation is HOME | BROWSE | ABOUT | CONTACT | PLANS with a prominent POST YOUR PROPERTY button
- Admin console keeps a visually distinct identity and its own sign-in at /admin
- Payments are confirmed manually by an admin; never auto-mark a payment successful
- Mobile verification is recorded for admin review; no SMS provider is configured

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Tailwind color tokens defined as CSS variables in index.css must also be mapped in theme.extend.colors with the oklch(var(--x) / <alpha-value>) form; opacity modifiers like bg-success/15 silently emit no CSS without <alpha-value>.
- Under Enhanced Migration, main.mo stable fields are declared with types only (no initializers); the initial value comes from the migration chain, and the migration module must export `public func migration(old : OldActor) : NewActor`.
- AccessControl.isAdmin traps for anonymous/unregistered callers, so admin guards must read accessControlState.userRoles directly and treat null/anonymous as non-admin.
- Backend Photo.blob is typed Uint8Array in backend.d.ts but is an ExternalBlob at runtime; photoUrl() casts and calls getDirectURL(), and fileToPhoto() wraps ExternalBlob.fromBytes() back into the Photo shape.
- The /listings route declares validateSearch returning an all-optional BrowseSearch interface; TanStack Router makes every key returned by validateSearch required in Link/navigate search objects unless the return type's keys are optional.
- pnpm check runs biome check src; typecheck and check must both pass independently since vite build can succeed with unrelated type errors.
- Biome's useSemanticElements rejects role="status", role="dialog" and role="group" on a div — use <output>, the shadcn AlertDialog primitive, and a <fieldset> with an sr-only <legend> instead.
- React Query hashes query keys with JSON.stringify, which throws on raw BigInt; serialize bigint-bearing filter objects to decimal strings for the key while passing the real typed object to the query function.
- TanStack Router's default search parser JSON-parses numeric-looking params, so validateSearch must accept string | number and coerce with String() to keep numeric filters alive across refresh.
- Admin console chrome (sidebar/top bar) must render inside the post-gate branch of the layout so unauthenticated visitors never see console navigation.
- useActor from @caffeineai/core-infrastructure exposes only { actor, isFetching }; a rejected actor query leaves actor null with isFetching false forever, so a bounded grace timer on (actor null && !isFetching) is the only way to derive an 'unavailable' status.
- A disabled React Query reports isLoading false (isPending && isFetching), so a gate ordered isLoading -> isUnavailable -> !data shows its 'no data' branch during the connecting window unless an explicit connecting branch precedes it.
- Gate an access-denied branch on isAdmin === false (not !isAdmin) so an undefined, not-yet-settled role result is never rendered as a denial.
- src/frontend/env.json and dist/env.json contain literal 'undefined' strings by design; Caffeine injects real canister IDs and URLs at deploy time. Never edit them to fix a runtime issue.
- The app's mocked frontend suite replaces useActor with a synchronous mock, so it cannot reproduce real actor-boot failures; only a real browser against a real canister exercises loadConfig/env.json.
- Local preflight verified the public home, browse, listing detail and admin gate all settle correctly with no permanent skeleton; the enquiry submit control is blocked by the browser's external-communication policy, which is a tooling boundary, not an app defect.
- Ceylon Property: customer auth (Internet Identity) is separate from admin auth; admin guards must read accessControlState.userRoles because AccessControl.isAdmin traps for anonymous callers.
- Ceylon Property: payments are manual — customer submits a reference, admin confirms; never auto-mark a payment successful.
- Ceylon Property: mobile verification is recorded for admin review only; no SMS provider is configured.
- Ceylon Property: plan limits are Individual 3/5, Agent 15/15, Business 50/35, Professional unlimited/unlimited (listings/images).
- Ceylon Property: backend.d.ts renumbers Result_N aliases (Result=Customer, Result_2=Payment, Result_3=Enquiry, Result_5=ListingError, Result_10=EnquiryAdminError).
- Ceylon Property: React Query JSON.stringify throws on BigInt — serialize bigint values to decimal strings before caching.
- Ceylon Property: Tailwind color tokens need the oklch(var(--x)/<alpha-value>) form to support opacity modifiers.
- Ceylon Property: src/frontend/src/test/** is tester-owned; production workers must not edit test files.
- Ceylon Property: the autonomous tester's browser tool blocks in-app payment-submit controls as financial actions, so manual-payment activation cannot be exercised in local preflight.
