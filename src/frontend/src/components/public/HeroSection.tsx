import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { useState } from "react";

const HERO_IMAGE = "/assets/generated/hero-coastal-villa.dim_1600x1100.jpg";

const QUICK_LOCATIONS = ["Colombo", "Galle", "Kandy", "Negombo"] as const;

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

/**
 * Editorial hero: Fraunces display headline, a keyword search entry that
 * navigates into the browse page, and a full-bleed coastal villa photograph.
 */
export function HeroSection() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = keyword.trim();
    void navigate({
      to: "/listings",
      search: { ...locationSearch(""), q: trimmed || undefined },
    });
  }

  return (
    <section
      data-ocid="home.hero_section"
      className="relative overflow-hidden bg-gradient-subtle"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground/80">
              Sri Lanka · Curated Property
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground md:text-7xl">
              Find your place
              <br />
              in the sun
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              A hand-picked portfolio of coastal villas, city residences and
              land across the island — presented with the care of a print
              magazine and the clarity of a modern listing.
            </p>

            <form
              onSubmit={handleSubmit}
              data-ocid="home.hero_search_form"
              className="mt-9 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <label htmlFor="hero-keyword" className="sr-only">
                  Search listings by keyword or location
                </label>
                <Input
                  id="hero-keyword"
                  name="keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search by city, region or property name"
                  data-ocid="home.hero_search_input"
                  className="h-12 rounded-full border-border bg-card pl-11 pr-4 text-base shadow-subtle"
                />
              </div>
              <Button
                type="submit"
                data-ocid="home.hero_search_button"
                className="h-12 shrink-0 rounded-full px-7 text-base shadow-subtle transition-smooth hover:shadow-elevated"
              >
                Search
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Popular
              </span>
              {QUICK_LOCATIONS.map((city) => (
                <Link
                  key={city}
                  to="/listings"
                  search={locationSearch(city)}
                  data-ocid={`home.hero_quick_location.${city.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-subtle transition-smooth hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {city}
                </Link>
              ))}
            </div>
          </div>

          <div className="animate-fade-in-up [animation-delay:120ms]">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-float">
              <img
                src={HERO_IMAGE}
                alt="A luxury coastal villa with an infinity pool overlooking the Indian Ocean in Sri Lanka"
                width={1600}
                height={1100}
                className="aspect-[4/3] w-full object-cover object-[35%_center]"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/90 px-5 py-4 backdrop-blur">
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Featured region
                  </p>
                  <p className="truncate font-display text-lg font-semibold text-foreground">
                    Southern Province
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="shrink-0 rounded-full border-primary/30 bg-card text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
                >
                  <Link
                    to="/listings"
                    search={locationSearch("Galle")}
                    data-ocid="home.hero_region_link"
                  >
                    Explore
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
