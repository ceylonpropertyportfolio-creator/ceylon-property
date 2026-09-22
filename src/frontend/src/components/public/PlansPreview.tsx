import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/hooks/use-plans";
import { formatAllowance, formatMonthlyPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

/** The empty browse search state, matching the `/listings` route contract. */
const EMPTY_BROWSE_SEARCH = {
  q: undefined,
  type: undefined,
  property: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  beds: undefined,
  location: undefined,
  sort: undefined,
};

/**
 * Home-page summary of the advertising plans. Prices and allowances come from
 * the backend plan list so the summary can never drift from the Plans page.
 */
export function PlansPreview() {
  const { data, isPending, isError, isUnavailable } = usePlans();
  const plans = data ?? [];

  return (
    <section
      data-ocid="home.plans_section"
      className="border-y border-border bg-muted/40 py-20 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Advertising plans
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              List your property, monthly
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Simple monthly billing with no lock-in. Choose the allowance that
              matches your portfolio and upgrade whenever you need to.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="shrink-0 rounded-full border-primary/30 text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
          >
            <Link to="/plans" data-ocid="home.plans_all_button">
              Compare all plans
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-12">
          {isPending ? (
            <div
              data-ocid="home.plans_loading"
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
                </div>
              ))}
              <span className="sr-only">Loading plans…</span>
            </div>
          ) : isUnavailable || isError || plans.length === 0 ? (
            <div
              data-ocid="home.plans_unavailable"
              className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center"
            >
              <p className="font-display text-lg font-semibold text-foreground">
                Plan details are temporarily unavailable
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                We could not load the current pricing. Open the Plans page to
                try again, or contact us and we will talk you through the
                options.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link to="/plans" data-ocid="home.plans_retry_button">
                  View plans
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan, index) => (
                <li
                  key={plan.id.toString()}
                  data-ocid={`home.plan_card.${index + 1}`}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border bg-card p-7 shadow-subtle transition-smooth hover:shadow-elevated",
                    index === 1 ? "border-primary/40" : "border-border",
                  )}
                >
                  {index === 1 ? (
                    <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-primary">
                      Most popular
                    </span>
                  ) : null}
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-3 font-display text-2xl font-semibold text-primary">
                    {formatMonthlyPrice(plan.price)}
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
                      {plan.features.slice(0, 3).map((feature) => (
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
                    asChild
                    variant={index === 1 ? "default" : "outline"}
                    className="mt-7 w-full rounded-full"
                  >
                    <Link
                      to="/plans"
                      data-ocid={`home.plan_choose_button.${index + 1}`}
                    >
                      Choose {plan.name}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Ready to advertise?{" "}
          <Link
            to="/post-property"
            data-ocid="home.plans_post_property_link"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Post your property
          </Link>{" "}
          or{" "}
          <Link
            to="/listings"
            search={EMPTY_BROWSE_SEARCH}
            data-ocid="home.plans_browse_link"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            browse the portfolio
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

const PLAN_SKELETON_IDS = Array.from(
  { length: 4 },
  (_, i) => `plan-skeleton-${i}`,
);
