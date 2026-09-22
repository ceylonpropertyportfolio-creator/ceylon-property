import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Gem, MapPinned, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Principle {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PRINCIPLES: Principle[] = [
  {
    icon: Gem,
    title: "Curated, never crowded",
    description:
      "We publish a small number of properties at a time so each one is presented properly and reaches the right buyer.",
  },
  {
    icon: MapPinned,
    title: "Island-wide knowledge",
    description:
      "From the Colombo skyline to the southern coast and the hill country, we know the streets, the prices and the seasons.",
  },
  {
    icon: Users,
    title: "One advisor, start to finish",
    description:
      "The person who lists your property is the person who answers the enquiries and negotiates the deal.",
  },
  {
    icon: Compass,
    title: "Honest guidance",
    description:
      "If a price is unrealistic or a moment is wrong, we will say so — a good outcome beats a quick listing.",
  },
];

const STATS = [
  { value: "18", label: "Years on the island" },
  { value: "4", label: "Regions covered" },
  { value: "1:1", label: "Advisor per property" },
];

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

/** Static, on-brand About page describing the Ceylon Property Portfolio. */
export function AboutPage() {
  return (
    <div data-ocid="about.page">
      <section className="bg-gradient-subtle py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground/80">
              About us
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
              Property, presented like a story worth telling
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Ceylon Property Portfolio is a boutique agency for Sri Lankan
              homes and land. We began with a simple frustration: beautiful
              properties, badly presented. So we built the opposite — a
              portfolio where every listing is photographed, written and
              verified before it goes live.
            </p>
          </div>

          <dl className="mt-14 grid gap-8 border-t border-border pt-10 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-4xl font-semibold text-primary md:text-5xl">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              How we work
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Four principles that shape every listing we take on.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:gap-8">
            {PRINCIPLES.map((principle) => (
              <div
                key={principle.title}
                data-ocid={`about.principle.${principle.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "_")
                  .replace(/^_|_$/g, "")}`}
                className="rounded-2xl border border-border bg-card p-7 shadow-subtle transition-smooth hover:shadow-elevated"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <principle.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-20 md:py-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Come and see the collection
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Browse the current portfolio, or speak with an advisor about what
              you are looking for.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button asChild className="rounded-full px-7 shadow-subtle">
              <Link
                to="/listings"
                search={EMPTY_BROWSE_SEARCH}
                data-ocid="about.browse_button"
              >
                Browse listings
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-primary/30 px-7 text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
            >
              <Link to="/plans" data-ocid="about.plans_button">
                See our plans
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
