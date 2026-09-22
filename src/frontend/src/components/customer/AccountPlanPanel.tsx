import { ActivatePlanDialog } from "@/components/customer/ActivatePlanDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyAccount, useMyListings } from "@/hooks/use-customer";
import { usePlans } from "@/hooks/use-plans";
import {
  formatAllowance,
  formatDate,
  formatMonthlyPrice,
  subscriptionStatusLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan, Subscription } from "@/types/listing";
import { SubscriptionStatus } from "@/types/listing";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ImageIcon,
  Layers,
  PackageOpen,
} from "lucide-react";
import { useState } from "react";

interface AccountPlanPanelProps {
  /** The customer's current subscription, or `null` when none exists. */
  subscription: Subscription | null;
}

/**
 * The active plan panel: plan identity, billing, status, dates, allowances and
 * features, plus the ACTIVATE PLAN and UPGRADE PLAN actions. Activation submits
 * a payment reference that an administrator confirms manually — the plan is
 * never marked paid automatically.
 */
export function AccountPlanPanel({ subscription }: AccountPlanPanelProps) {
  const { data: plans } = usePlans();
  const { data: account } = useMyAccount();
  const { data: listings } = useMyListings();
  const [isActivateOpen, setIsActivateOpen] = useState(false);

  const planList = plans ?? [];
  const currentPlan =
    planList.find((plan) => plan.id === subscription?.planId) ?? null;
  const isActive = subscription?.status === SubscriptionStatus.active;
  const listingCount = (listings ?? []).length;

  return (
    <section
      data-ocid="account.plan_panel"
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-subtle"
    >
      <div className="flex flex-col gap-4 border-b border-border bg-secondary/40 p-7 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BadgeCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Active plan
            </h2>
            <p className="text-sm text-muted-foreground">
              Monthly billing · confirmed by our team
            </p>
          </div>
        </div>
        {subscription ? (
          <Badge
            variant="outline"
            className={cn(
              "w-fit shrink-0 rounded-full px-3 py-1",
              isActive
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {subscriptionStatusLabel(subscription.status)}
          </Badge>
        ) : null}
      </div>

      {subscription ? (
        <div className="p-7 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Plan
              </p>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
                {subscription.planName}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatMonthlyPrice(subscription.price)} ·{" "}
                {subscription.billingPeriod}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                data-ocid="account.activate_plan_button"
                onClick={() => setIsActivateOpen(true)}
                className="rounded-full px-6"
              >
                {isActive ? "Renew plan" : "Activate plan"}
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/plans" data-ocid="account.upgrade_plan_button">
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                  Upgrade plan
                </Link>
              </Button>
            </div>
          </div>

          <dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <PlanFact
              icon={CalendarClock}
              label="Started"
              value={formatDate(subscription.startedAt)}
            />
            <PlanFact
              icon={CalendarClock}
              label={isActive ? "Renews" : "Expired"}
              value={formatDate(subscription.expiresAt)}
            />
            <PlanFact
              icon={Layers}
              label="Listing allowance"
              value={formatAllowance(currentPlan?.listingAllowance)}
              detail={
                currentPlan?.listingAllowance !== undefined
                  ? `${listingCount} in use`
                  : undefined
              }
            />
            <PlanFact
              icon={ImageIcon}
              label="Images per listing"
              value={formatAllowance(currentPlan?.imageAllowance)}
            />
          </dl>

          {currentPlan && currentPlan.features.length > 0 ? (
            <ul className="mt-8 grid gap-2 border-t border-border pt-6 sm:grid-cols-2">
              {currentPlan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {!isActive ? (
            <p
              data-ocid="account.plan_expired_notice"
              className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm leading-relaxed text-destructive"
            >
              Your plan has expired, so new advertisements are blocked until you
              activate a plan. Renew above or choose a different plan.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageOpen className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                No active plan
              </p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Choose a monthly plan to start advertising. Submit your payment
                reference and our team will confirm it.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 rounded-full px-6">
            <Link to="/plans" data-ocid="account.choose_plan_button">
              Choose a plan
            </Link>
          </Button>
        </div>
      )}

      <ActivatePlanDialog
        open={isActivateOpen}
        onOpenChange={setIsActivateOpen}
        plans={planList}
        defaultPlanId={subscription?.planId ?? null}
        customerName={account?.customer.name ?? ""}
      />
    </section>
  );
}

interface PlanFactProps {
  icon: typeof CalendarClock;
  label: string;
  value: string;
  detail?: string;
}

function PlanFact({ icon: Icon, label, value, detail }: PlanFactProps) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-2 font-display text-lg font-semibold text-foreground">
        {value}
      </dd>
      {detail ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

/** Re-exported for callers that need the plan shape alongside the panel. */
export type { Plan };
