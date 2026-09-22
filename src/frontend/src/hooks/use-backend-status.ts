import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";

/**
 * How long the app waits for the actor query to settle before declaring the
 * backend unavailable. `useActor` exposes no error field, so a permanently-null
 * actor is indistinguishable from a slow boot without a bounded grace period.
 */
export const BACKEND_GRACE_PERIOD_MS = 4000;

/**
 * The settled readiness of the backend connection.
 *
 * - `connecting` — the actor query is still fetching, or the actor is null and
 *   the grace period has not yet elapsed.
 * - `ready` — an actor exists and backend calls can be issued.
 * - `unavailable` — the actor is null and the grace period elapsed, so the
 *   connection could not be established.
 */
export type BackendStatus = "connecting" | "ready" | "unavailable";

/** The value returned by `useBackendStatus`. */
export interface BackendStatusResult<T> {
  status: BackendStatus;
  /** The live actor, or `null` while connecting or unavailable. */
  actor: T | null;
  /** True only while the actor query is fetching. */
  isFetching: boolean;
  /** True when the backend connection could not be established. */
  isUnavailable: boolean;
  /** True when an actor exists and backend calls can be issued. */
  isReady: boolean;
  /** True while the connection is still being established. */
  isConnecting: boolean;
}

/**
 * Derives a settled backend-readiness signal from `useActor`.
 *
 * `useActor` returns only `{ actor, isFetching }` — it exposes no error,
 * `isLoading` or `isPending` field, and its internal query has
 * `staleTime: Infinity` with `enabled: true`. When that query rejects (a
 * missing canister id, an actor-construction failure), `data` stays undefined
 * and `isFetching` becomes false, leaving `actor` null forever with no error
 * surface. Callers that gate on `!!actor && !isFetching` therefore stay
 * pending forever and render a permanent skeleton.
 *
 * This hook turns those observable facts into a settled status: a null actor
 * that is no longer fetching starts a bounded grace timer, after which the
 * backend is reported `unavailable`. The timer is cleared on unmount and
 * whenever the actor appears, so the hook is safe under React 19 strict-mode
 * double-invocation and SSR (no timer runs without a mounted effect).
 */
export function useBackendStatus<T>(
  createActorFn: Parameters<typeof useActor<T>>[0],
): BackendStatusResult<T> {
  const { actor, isFetching } = useActor(createActorFn);
  const [graceElapsed, setGraceElapsed] = useState(false);

  useEffect(() => {
    // An actor exists: the connection is established, no timer is needed.
    if (actor) {
      setGraceElapsed(false);
      return;
    }
    // Still fetching: the boot is in progress, so keep waiting.
    if (isFetching) {
      setGraceElapsed(false);
      return;
    }
    // Null actor and no longer fetching: start the bounded grace period.
    const timer = setTimeout(() => {
      setGraceElapsed(true);
    }, BACKEND_GRACE_PERIOD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [actor, isFetching]);

  const status: BackendStatus = actor
    ? "ready"
    : graceElapsed
      ? "unavailable"
      : "connecting";

  return {
    status,
    actor,
    isFetching,
    isUnavailable: status === "unavailable",
    isReady: status === "ready",
    isConnecting: status === "connecting",
  };
}

/** Convenience wrapper binding the app's generated `createActor`. */
export function useAppBackendStatus() {
  return useBackendStatus(createActor);
}
