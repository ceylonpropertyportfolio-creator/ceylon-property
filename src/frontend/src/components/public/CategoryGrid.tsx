import { useCategories } from "@/hooks/use-content";
import { CATEGORY_SHORTCUTS } from "@/lib/listing-options";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Building2,
  Home,
  Hotel,
  LandPlot,
  Store,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  houses: Home,
  apartments: Building2,
  land: LandPlot,
  commercial: Store,
  "rooms-annexes": Warehouse,
  "holiday-rentals": Hotel,
};

/** Builds a complete browse search object for a category shortcut. */
function categorySearch(property?: string, type?: string) {
  return {
    q: undefined,
    type,
    property,
    minPrice: undefined,
    maxPrice: undefined,
    beds: undefined,
    location: undefined,
    sort: undefined,
  };
}

/**
 * Property category shortcuts. The admin-managed category list supplies the
 * labels when it is populated; the built-in shortcut set is the fallback so the
 * band is never empty.
 */
export function CategoryGrid() {
  const { data } = useCategories();
  const managed = (data ?? []).filter((category) => category.enabled);

  const items =
    managed.length > 0
      ? managed.map((category) => ({
          key: category.id.toString(),
          slug: category.slug,
          label: category.name,
          description: category.description,
          property: undefined,
          listingType: undefined,
        }))
      : CATEGORY_SHORTCUTS.map((shortcut) => ({
          key: shortcut.slug,
          slug: shortcut.slug,
          label: shortcut.label,
          description: shortcut.description,
          property: shortcut.property,
          listingType: shortcut.listingType,
        }));

  return (
    <section
      data-ocid="home.categories_section"
      className="bg-background py-20 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Browse by category
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            What are you looking for?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Jump straight into the part of the portfolio that fits your search.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = CATEGORY_ICONS[item.slug] ?? Home;
            return (
              <li key={item.key}>
                <Link
                  to="/listings"
                  search={categorySearch(item.property, item.listingType)}
                  data-ocid={`home.category_card.${item.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg font-semibold text-foreground">
                        {item.label}
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground transition-smooth group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block text-sm leading-relaxed text-muted-foreground",
                      )}
                    >
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
