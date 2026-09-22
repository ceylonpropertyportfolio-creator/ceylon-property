import { ErrorState } from "@/components/common/ErrorState";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAdmin } from "@/hooks/use-admin";
import { useAppBackendStatus } from "@/hooks/use-backend-status";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Outlet } from "@tanstack/react-router";
import { LogIn, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";

function AdminTopBar() {
  const {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    login,
    clear,
  } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : null;

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-admin-border bg-admin-surface px-4 sm:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
        <span className="font-medium text-foreground">
          Administrator console
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && shortPrincipal ? (
          <span
            data-ocid="admin_topbar.identity"
            className="hidden rounded-md border border-admin-border bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground sm:inline-block"
          >
            {shortPrincipal}
          </span>
        ) : null}
        <Button
          type="button"
          variant={isAuthenticated ? "outline" : "default"}
          size="sm"
          data-ocid={
            isAuthenticated
              ? "admin_topbar.signout_button"
              : "admin_topbar.signin_button"
          }
          disabled={isInitializing || isLoggingIn}
          onClick={() => {
            if (isAuthenticated) {
              clear();
            } else {
              login();
            }
          }}
          className="rounded-md"
        >
          {isAuthenticated ? (
            <>
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </>
          ) : (
            <>
              <LogIn className="size-4" aria-hidden="true" />
              {isInitializing
                ? "Loading…"
                : isLoggingIn
                  ? "Signing in…"
                  : "Sign in"}
            </>
          )}
        </Button>
      </div>
    </header>
  );
}

function AdminGate() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();
  const { isConnecting } = useAppBackendStatus();
  const {
    data: isAdmin,
    isLoading,
    isError,
    isUnavailable,
    refetch,
  } = useIsAdmin();

  if (isInitializing) {
    return (
      <div
        data-ocid="admin_gate.loading_state"
        className="mx-auto w-full max-w-md space-y-4 p-8"
      >
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-surface px-6 py-20">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Administrator sign-in required
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The console manages listings and enquiries. Sign in with Internet
            Identity to continue.
          </p>
          <Button
            type="button"
            data-ocid="admin_gate.signin_button"
            disabled={isLoggingIn}
            onClick={() => login()}
            className="mt-6 rounded-md"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {isLoggingIn ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </div>
    );
  }

  // The backend connection is still being established. The role query is
  // disabled while connecting, so `isLoading` is false and `isAdmin` is
  // undefined — without this branch the gate would fall through to the
  // access-denied state and falsely reject a legitimate administrator.
  if (isConnecting) {
    return (
      <div
        data-ocid="admin_gate.connecting_state"
        className="mx-auto w-full max-w-md space-y-4 p-8"
      >
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-ocid="admin_gate.role_loading_state"
        className="mx-auto w-full max-w-md space-y-4 p-8"
      >
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (isUnavailable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-surface px-6 py-20">
        <div className="mx-auto w-full max-w-lg">
          <ErrorState
            data-ocid="admin_gate.unavailable_state"
            title="The console is temporarily unavailable"
            description="We could not reach the backend service, so your administrator access could not be verified. Please try again in a moment."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-lg p-8">
        <ErrorState
          title="Could not verify your access"
          description="We could not confirm your administrator role. Please retry."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  // Only a settled, explicitly-false role result is a denial. An undefined
  // result (query not yet settled) must never be presented as "Access denied".
  if (isAdmin === false) {
    return (
      <div
        data-ocid="admin_gate.access_denied"
        className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-20 text-center"
      >
        <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Access denied
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This account does not hold the administrator role. Ask an existing
          administrator to grant access.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-admin-surface text-admin-surface-foreground md:flex-row">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Dense neutral shell for the administrator console, rendered post-gate. */
export function AdminLayout() {
  return <AdminGate />;
}
