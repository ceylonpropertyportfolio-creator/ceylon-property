import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { vi } from "vitest";

/**
 * Builds the `@caffeineai/core-infrastructure` module mock from the shared
 * harness state.
 *
 * Test files wire it up with an inline async factory so the harness module is
 * imported *inside* the factory — `vi.mock` is hoisted above the test file's
 * imports, so a top-level import referenced by the factory would be read before
 * it is initialized:
 *
 * ```ts
 * vi.mock("@caffeineai/core-infrastructure", async () => {
 *   const { buildCoreInfrastructureMock } = await import(
 *     "@/test/mock-core-infrastructure"
 *   );
 *   return buildCoreInfrastructureMock();
 * });
 * ```
 */
export async function buildCoreInfrastructureMock() {
  const { actorHarness, identityHarness } = await import("@/test/harness");
  return {
    useActor: () => ({
      actor: actorHarness.actor,
      isFetching: actorHarness.isFetching,
    }),
    useInternetIdentity: (): InternetIdentityContext => ({
      identity: undefined,
      login: identityHarness.login,
      clear: identityHarness.clear,
      loginStatus: identityHarness.isInitializing
        ? "initializing"
        : identityHarness.isLoggingIn
          ? "logging-in"
          : identityHarness.isAuthenticated
            ? "success"
            : "idle",
      isInitializing: identityHarness.isInitializing,
      isLoginIdle:
        !identityHarness.isInitializing && !identityHarness.isLoggingIn,
      isLoggingIn: identityHarness.isLoggingIn,
      isLoginSuccess: identityHarness.isAuthenticated,
      isLoginError: false,
      isAuthenticated: identityHarness.isAuthenticated,
    }),
    InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
      children,
    createActorWithConfig: vi.fn(),
    loadConfig: vi.fn(),
    loadMockBackendFromModules: vi.fn(),
  };
}
