import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";

const CONTACT_DETAILS = [
  {
    icon: MapPin,
    label: "Office",
    value: "42 Lighthouse Street, Galle Fort, Sri Lanka",
  },
  {
    icon: Phone,
    label: "Telephone",
    value: "+94 91 224 8800",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@ceylonproperty.lk",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Monday to Saturday, 9:00 – 18:00 (GMT+5:30)",
  },
];

const ENQUIRY_TYPES = [
  "Buying a property",
  "Selling or letting my property",
  "Requesting a valuation",
  "Something else",
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

/** Static, on-brand Contact page with office details and enquiry routes. */
export function ContactPage() {
  return (
    <div data-ocid="contact.page">
      <section className="bg-gradient-subtle py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground/80">
              Contact
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
              Let's talk property
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Whether you are buying, selling or simply curious about the
              market, an advisor will get back to you within one working day.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Reach us directly
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Prefer to speak with someone? Our Galle Fort office is open six
              days a week, and the phone line is answered by a real advisor.
            </p>

            <dl className="mt-10 space-y-6">
              {CONTACT_DETAILS.map((detail) => (
                <div
                  key={detail.label}
                  data-ocid={`contact.detail.${detail.label.toLowerCase()}`}
                  className="flex items-start gap-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <detail.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 text-base text-foreground">
                      {detail.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-subtle md:p-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              What can we help with?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pick the enquiry that fits best and we will route it to the right
              advisor.
            </p>

            <ul className="mt-8 space-y-3">
              {ENQUIRY_TYPES.map((type) => (
                <li
                  key={type}
                  data-ocid={`contact.enquiry_type.${type
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "_")
                    .replace(/^_|_$/g, "")}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-5 py-4 text-sm font-medium text-foreground"
                >
                  {type}
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl bg-muted/60 p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Looking at a specific property? Open its listing page and use
                the enquiry form there — your message is attached to that
                property automatically.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full px-6 shadow-subtle transition-smooth hover:shadow-elevated"
                >
                  <Link
                    to="/listings"
                    search={EMPTY_BROWSE_SEARCH}
                    data-ocid="contact.browse_button"
                  >
                    Browse listings
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-primary/30 px-6 text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
                >
                  <Link to="/plans" data-ocid="contact.plans_button">
                    Advertising plans
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
