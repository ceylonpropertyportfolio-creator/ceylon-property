import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components mark interactive surfaces with `data-ocid`; treat that
// as the test-id attribute so `getByTestId("home.page")` works throughout.
configure({ testIdAttribute: "data-ocid" });

// jsdom does not implement `ResizeObserver`, which Radix UI primitives (the
// shadcn Select, Checkbox and dropdown menus) instantiate on mount. Without a
// stand-in those components throw during render and the router shows its
// error fallback. A no-op observer is enough: the tests assert on rendered
// output, not on measured sizes.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

// jsdom does not implement `window.matchMedia`, which the banner slider calls
// to honour `prefers-reduced-motion`. Without a stand-in the slider throws
// during render. The stub reports "no match" so the slider keeps its normal
// auto-advance behaviour, and the listener methods are no-ops because the
// tests drive the slider through its controls rather than media changes.
// Assign unconditionally: jsdom exposes the `matchMedia` property but not a
// callable implementation in this environment, so an `in` guard would skip it.
window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {
    return false;
  },
})) as unknown as typeof window.matchMedia;

afterEach(() => {
  cleanup();
});
