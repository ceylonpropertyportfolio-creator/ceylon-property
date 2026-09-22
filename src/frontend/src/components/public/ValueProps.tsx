import { BadgeCheck, Camera, Handshake, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: Camera,
    title: "Magazine-grade presentation",
    description:
      "Every property is photographed and written up like a feature spread, so your home looks its absolute best from the first impression.",
  },
  {
    icon: BadgeCheck,
    title: "Verified details only",
    description:
      "Prices, floor areas and room counts are confirmed before a listing goes live. What a buyer reads is what they will find on the visit.",
  },
  {
    icon: Handshake,
    title: "Direct, personal enquiries",
    description:
      "Enquiries land against the exact listing and reach a named advisor — no call centres, no lost messages, no chasing.",
  },
  {
    icon: ShieldCheck,
    title: "Discreet by default",
    description:
      "You decide what is published and when. Draft listings stay private until you are ready to open them to the market.",
  },
];

/** The "why list with us" band — four reasons set on the deep emerald surface. */
export function ValueProps() {
  return (
    <section
      data-ocid="home.value_props_section"
      className="bg-primary py-20 text-primary-foreground md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Why Ceylon Property
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            A portfolio, not a classifieds board
          </h2>
          <p className="mt-4 text-base leading-relaxed text-primary-foreground/75">
            We keep the collection deliberately small so each property gets the
            attention — and the audience — it deserves.
          </p>
        </div>

        <dl className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop) => (
            <div
              key={prop.title}
              data-ocid={`home.value_prop.${prop.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "")}`}
              className="border-t border-primary-foreground/20 pt-6"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-foreground/10 text-accent">
                <prop.icon className="size-5" aria-hidden="true" />
              </span>
              <dt className="mt-5 font-display text-lg font-semibold leading-snug">
                {prop.title}
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
                {prop.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
