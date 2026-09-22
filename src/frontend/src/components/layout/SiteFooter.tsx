import { CeylonLogo } from "@/components/brand/CeylonLogo";
import { Link } from "@tanstack/react-router";

const FOOTER_LINKS = [
  { to: "/listings", label: "Browse listings" },
  { to: "/plans", label: "Plans & pricing" },
  { to: "/about", label: "About us" },
  { to: "/contact", label: "Contact" },
  { to: "/post-property", label: "Post your property" },
] as const;

/** Deep-green public site footer with the brand lockup and attribution. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <CeylonLogo tone="light" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-primary-foreground/75">
            A curated portfolio of coastal villas, city residences and land
            across Sri Lanka — presented with the care of a print magazine.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/60">
            Explore
          </p>
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`site_footer.link.${link.label.toLowerCase().replace(/\s+/g, "_")}`}
              className="w-fit text-sm text-primary-foreground/85 transition-smooth hover:text-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} Ceylon Property Portfolio. All rights reserved.</p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            data-ocid="site_footer.attribution_link"
            className="transition-smooth hover:text-accent"
          >
            © {year}. Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
