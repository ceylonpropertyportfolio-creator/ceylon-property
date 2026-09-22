import { Button } from "@/components/ui/button";
import { formatAllowance, formatMonthlyPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/listing";
import { Check, Sparkles } from "lucide-react";

interface PlanCardProps {
  plan: Plan;
  /** True when this plan is the currently selected one. */
  isSelected: boolean;
  /** True when this plan is the customer's active subscription. */
  isCurrent: boolean;
  /** Marks the plan as the recommended tier. */
  isHighlighted?: boolean;
  /** Called when the customer chooses this plan. */
  onSelect: () => void;
  /** data-ocid applied to the card root. */
  "data-ocid"?: string;
}

/**
 * One advertising plan tier: name, monthly price, allowances, features and the
 * choose action. Light brown is reserved for the price signal.
 */
export function PlanCard({
  plan,
  isSelected,
  isCurrent,
  isHighlighted = false,
  onSelect,
  "data-ocid": dataOcid,
}: PlanCardProps) {
  return (
    <li
      data-ocid={dataOcid}
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card p-7 shadow-subtle transition-smooth",
        isSelected
          ? "border-primary ring-2 ring-primary/25"
          : "border-border hover:shadow-elevated",
      )}
    >
      <div className="flex min-h-6 items-center gap-2">
        {isHighlighted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3" aria-hidden="true" />
            Most popular
          </span>
        ) : null}
        {isCurrent ? (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            Your plan
          </span>
        ) : null}
      </div>

      <h2 className="mt-3 font-display text-xl font-semibold text-foreground">
        {plan.name}
      </h2>
      <p className="mt-3 font-display text-3xl font-semibold text-accent-foreground">
        {formatMonthlyPrice(plan.price)}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {plan.billingPeriod}
      </p>

      <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Listings</dt>
          <dd className="font-medium text-foreground">
            {formatAllowance(plan.listingAllowance)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Photos each</dt>
          <dd className="font-medium text-foreground">
            {formatAllowance(plan.imageAllowance)}
          </dd>
        </div>
      </dl>

      {plan.features.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {plan.features.map((feature) => (
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

      <Button
        type="button"
        variant={isSelected ? "default" : "outline"}
        onClick={onSelect}
        className="mt-7 w-full rounded-full"
      >
        {isSelected ? "Selected" : `Choose ${plan.name}`}
      </Button>
    </li>
  );
}
