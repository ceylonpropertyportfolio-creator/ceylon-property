import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

interface Area {
  city: string;
  region: string;
  blurb: string;
}

const AREAS: Area[] = [
  {
    city: "Colombo",
    region: "Western Province",
    blurb:
      "The commercial capital — sea-facing apartments, leafy Cinnamon Gardens residences and easy access to the airport expressway.",
  },
  {
    city: "Galle",
    region: "Southern Province",
    blurb:
      "A UNESCO fort town wrapped in colonial villas, boutique hotels and long stretches of southern surf.",
  },
  {
    city: "Kandy",
    region: "Central Province",
    blurb:
      "Hill-country calm around the lake — cooler air, tea estates and heritage homes minutes from the temple.",
  },
  {
    city: "Negombo",
    region: "Western Province",
    blurb:
      "A relaxed coastal town of lagoons and fishing villages, twenty minutes from Bandaranaike International.",
  },
];

/** Builds a complete browse search object for a location shortcut. */
function locationSearch(location: string) {
  return {
    q: undefined,
    type: undefined,
    property: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    beds: undefined,
    location,
    sort: undefined,
  };
}

/** Popular Sri Lankan locations, each linking into the browse page pre-filtered. */
export function AreaShowcase() {
  return (
    <section
      data-ocid="home.areas_section"
      className="bg-background py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Where we work
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Popular locations
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            From the western seaboard to the hill country, explore the island by
            the places our buyers ask for most.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {AREAS.map((area) => (
            <li key={area.city}>
              <Link
                to="/listings"
                search={locationSearch(area.city)}
                data-ocid={`home.area_card.${area.city.toLowerCase()}`}
                className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {area.city}
                    </h3>
                    <ArrowUpRight
                      className="mt-1 size-4 shrink-0 text-muted-foreground transition-smooth group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {area.region}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {area.blurb}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  View properties
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
