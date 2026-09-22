import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogIn, ShieldCheck, UserRound } from "lucide-react";

interface CustomerAuthPanelProps {
  /** Headline shown above the sign-in action. */
  title?: string;
  /** Supporting copy explaining why sign-in is required. */
  description?: string;
  /** data-ocid applied to the panel root. */
  "data-ocid"?: string;
}

/**
 * The customer sign-in gate. Customer authentication uses Internet Identity
 * and is deliberately separate from the administrator console, which keeps its
 * own sign-in and layout.
 */
export function CustomerAuthPanel({
  title = "Sign in to your account",
  description = "Manage your listings, subscription and payment history. Customer accounts are separate from the administrator console.",
  "data-ocid": dataOcid = "customer_auth.panel",
}: CustomerAuthPanelProps) {
  const { isInitializing, isLoggingIn, login } = useInternetIdentity();

  return (
    <div
      data-ocid={dataOcid}
      className="rounded-3xl border border-border bg-card p-8 text-center shadow-subtle md:p-12"
    >
      <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UserRound className="size-6" aria-hidden="true" />
      </span>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Button
        type="button"
        data-ocid={`${dataOcid}.signin_button`}
        disabled={isInitializing || isLoggingIn}
        onClick={() => login()}
        className="mt-6 rounded-full px-7"
      >
        <LogIn className="size-4" aria-hidden="true" />
        {isLoggingIn ? "Signing in…" : "Sign in"}
      </Button>
      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Secured by Internet Identity
      </p>
    </div>
  );
}
