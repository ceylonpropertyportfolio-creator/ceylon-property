import { AreaShowcase } from "@/components/public/AreaShowcase";
import { BannerSlider } from "@/components/public/BannerSlider";
import { CategoryGrid } from "@/components/public/CategoryGrid";
import { FeaturedListings } from "@/components/public/FeaturedListings";
import { HeroSection } from "@/components/public/HeroSection";
import { PlansPreview } from "@/components/public/PlansPreview";
import { ValueProps } from "@/components/public/ValueProps";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";

/** The public home page: hero, banners, categories, portfolio and plans. */
export function HomePage() {
  return (
    <div data-ocid="home.page">
      <HeroSection />
      <BannerSlider />
      <CategoryGrid />
      <FeaturedListings />
      <ValueProps />
      <PlansPreview />
      <AreaShowcase />

      <section
        data-ocid="home.help_section"
        className="border-t border-border bg-background py-20 md:py-24"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 rounded-3xl border border-border bg-card px-8 py-12 shadow-subtle md:grid-cols-[1.3fr_1fr] md:items-center md:px-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Need a hand?
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Thinking of selling or letting?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Ask the property assistant a quick question, or tell us about
                your property and we will advise on pricing, presentation and
                the right moment to bring it to market.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Button
                asChild
                className="rounded-full px-7 shadow-subtle transition-smooth hover:shadow-elevated"
              >
                <Link to="/contact" data-ocid="home.help_contact_button">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Contact an advisor
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-primary/30 px-7 text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
              >
                <Link to="/post-property" data-ocid="home.help_post_button">
                  Post your property
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
