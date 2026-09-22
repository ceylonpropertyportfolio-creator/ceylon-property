import type { MockBackend } from "@/test/mock-backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";

/**
 * The mocked `useActor` return value. `useActor` is mocked per-test file with
 * `vi.mock("@caffeineai/core-infrastructure", ...)`; this module only holds the
 * shared mutable state the mock reads from.
 */
export interface ActorHarness {
  actor: MockBackend | null;
  isFetching: boolean;
}

export const actorHarness: ActorHarness = {
  actor: null,
  isFetching: false,
};

/** The mocked Internet Identity state, mutated per test. */
export interface IdentityHarness {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

export const identityHarness: IdentityHarness = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  login: vi.fn(),
  clear: vi.fn(),
};

/** Resets both harnesses to their unauthenticated, actor-less defaults. */
export function resetHarness() {
  actorHarness.actor = null;
  actorHarness.isFetching = false;
  identityHarness.isAuthenticated = false;
  identityHarness.isInitializing = false;
  identityHarness.isLoggingIn = false;
  identityHarness.login = vi.fn();
  identityHarness.clear = vi.fn();
}

/** Creates a fresh QueryClient with retries disabled for deterministic tests. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Renders a tree inside the app's providers. The router reads
 * `window.location`, so callers set the URL with `navigateTo` first.
 */
export function renderWithProviders(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
): RenderResult & { queryClient: QueryClient } {
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
  return { ...result, queryClient };
}

/**
 * Points the jsdom history at a path before rendering the router.
 *
 * `App` builds a single module-level router, so a router mounted by an earlier
 * test keeps its previous location. `pushState` alone does not notify it;
 * dispatching `popstate` makes the router's history listener pick up the new
 * URL so each test starts from the path it asked for.
 */
export function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
