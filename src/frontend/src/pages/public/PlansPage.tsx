import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PlanCard } from "@/components/customer/PlanCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAccount, useSubmitPayment } from "@/hooks/use-customer";
import { usePlans } from "@/hooks/use-plans";
import { formatMonthlyPrice } from "@/lib/format";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, CreditCard, Info, LogIn, PackageOpen } from "lucide-react";
import { useState } from "react";

const PLAN_SKELETON_IDS = Array.from(
  { length: 4 },
  (_, i) => `plan-page-skeleton-${i}`,
);

/**
 * The advertising plans page. Monthly billing only. A chosen plan is paid by
 * bank transfer and the reference is submitted here; the subscription stays
 * pending until an administrator confirms the payment.
 */
export function PlansPage() {
  const { data, isPending, isError, isUnavailable, refetch } = usePlans();
  const plans = data ?? [];
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();
  const { data: account } = useMyAccount();
  const submitPayment = useSubmitPayment();

  const [selectedPlanId, setSelectedPlanId] = useState<bigint | null>(null);
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const subscription = account?.subscription ?? null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedPlanId === null) return;
    const captured = reference.trim();
    if (!captured) return;
    setReference("");
    setSubmitted(false);
    submitPayment.mutate(
      { planId: selectedPlanId, reference: captured },
      {
        onSuccess: () => setSubmitted(true),
        onError: () =>
          setReference((current) => (current === "" ? captured : current)),
      },
    );
  }

  return (
    <div data-ocid="plans.page">
      <section className="bg-gradient-subtle py-20 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground/80">
              Advertising plans
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
              Advertise your property
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Monthly billing, no lock-in. Every plan includes a full listing
              page, photo gallery and direct enquiry line. Choose the allowance
              that matches your portfolio.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {isPending ? (
            <div
              data-ocid="plans.loading_state"
              aria-busy="true"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {PLAN_SKELETON_IDS.map((id) => (
                <div
                  key={id}
                  className="space-y-4 rounded-2xl border border-border bg-card p-7 shadow-subtle"
                >
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              ))}
              <span className="sr-only">Loading plans…</span>
            </div>
          ) : isUnavailable ? (
            <ErrorState
              data-ocid="plans.unavailable_state"
              title="Plans are temporarily unavailable"
              description="We could not reach the plans service. Please try again in a moment."
              onRetry={() => void refetch()}
            />
          ) : isError ? (
            <ErrorState
              data-ocid="plans.error_state"
              title="We could not load the plans"
              description="The plans service did not respond. Please try again in a moment."
              onRetry={() => void refetch()}
            />
          ) : plans.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              data-ocid="plans.empty_state"
              title="No plans are available yet"
              description="Our advertising plans are being finalised. Contact us and we will talk you through the options."
              action={
                <Button asChild className="rounded-full">
                  <Link to="/contact" data-ocid="plans.empty_contact_button">
                    Contact us
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id.toString()}
                  plan={plan}
                  isSelected={plan.id === selectedPlanId}
                  isCurrent={subscription?.planId === plan.id}
                  isHighlighted={index === 1}
                  onSelect={() => {
                    setSelectedPlanId(plan.id);
                    setSubmitted(false);
                  }}
                  data-ocid={`plans.plan_card.${index + 1}`}
                />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-16 md:py-20">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-subtle md:p-10">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  Confirm your plan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Monthly billing · confirmed by our team
                </p>
              </div>
            </div>

            {subscription ? (
              <div
                data-ocid="plans.subscription_summary"
                className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-5"
              >
                <BadgeCheck
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    {subscription.planName} is active
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Renews on {formatSubscriptionDate(subscription.expiresAt)}.
                    Choosing another plan below starts a new payment request.
                  </p>
                </div>
              </div>
            ) : null}

            {!isAuthenticated ? (
              <div className="mt-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Sign in with Internet Identity to choose a plan. Customer
                  accounts are separate from the administrator console.
                </p>
                <Button
                  type="button"
                  data-ocid="plans.signin_button"
                  disabled={isInitializing || isLoggingIn}
                  onClick={() => login()}
                  className="mt-5 rounded-full"
                >
                  <LogIn className="size-4" aria-hidden="true" />
                  {isLoggingIn ? "Signing in…" : "Sign in to continue"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="rounded-2xl bg-muted/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Selected plan
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-foreground">
                    {selectedPlan
                      ? `${selectedPlan.name} — ${formatMonthlyPrice(selectedPlan.price)}`
                      : "Choose a plan above"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-reference">Payment reference</Label>
                  <Input
                    id="payment-reference"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="Bank transfer reference or slip number"
                    data-ocid="plans.reference_input"
                    className="h-11 rounded-xl"
                  />
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                    <Info
                      className="mt-0.5 size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    Transfer the monthly amount to our account, then submit the
                    reference here. Your subscription activates once an
                    administrator confirms the payment.
                  </p>
                </div>

                {submitPayment.isError ? (
                  <p
                    data-ocid="plans.submit_error"
                    className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {submitPayment.error.message}
                  </p>
                ) : null}

                {submitted ? (
                  <output
                    data-ocid="plans.submit_success"
                    className="block rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground"
                  >
                    Payment reference received. An administrator will confirm it
                    shortly — you can track the status on your account page.
                  </output>
                ) : null}

                <Button
                  type="submit"
                  data-ocid="plans.submit_button"
                  disabled={
                    selectedPlanId === null ||
                    reference.trim().length === 0 ||
                    submitPayment.isPending
                  }
                  className="w-full rounded-full sm:w-auto sm:px-8"
                >
                  {submitPayment.isPending
                    ? "Submitting…"
                    : "Submit payment reference"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Formats a subscription expiry timestamp as a readable date. */
function formatSubscriptionDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
