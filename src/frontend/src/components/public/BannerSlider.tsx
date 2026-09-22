import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBanners } from "@/hooks/use-content";
import { photoUrl } from "@/lib/photo";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/** How long each banner stays on screen before advancing. */
const AUTO_ADVANCE_MS = 6000;

/**
 * Admin-controlled rotating banner slider. Auto-advances every six seconds,
 * pauses on hover and focus, and offers manual previous/next controls plus dot
 * navigation. Honours `prefers-reduced-motion` by not auto-advancing.
 */
export function BannerSlider() {
  const { data, isPending, isError, isUnavailable } = useBanners();
  const banners = data ?? [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;
  const regionRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  // Keep the active index valid when the banner list changes underneath us.
  useEffect(() => {
    if (count > 0 && index >= count) setIndex(0);
  }, [count, index]);

  if (isPending || isUnavailable || isError || count === 0) {
    return (
      <BannerFallback
        isPending={isPending}
        isUnavailable={isUnavailable}
        isError={isError}
      />
    );
  }

  const active = banners[index];
  const image = active.image ? photoUrl(active.image) : null;

  return (
    <section
      data-ocid="home.banner_section"
      aria-roledescription="carousel"
      aria-label="Featured announcements"
      className="bg-background pt-10 md:pt-14"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={regionRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elevated"
        >
          <div className="relative aspect-[16/7] w-full sm:aspect-[16/6]">
            {image ? (
              <img
                key={active.id.toString()}
                src={image}
                alt={active.title}
                className="absolute inset-0 size-full animate-fade-in object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-primary">
                <ImageOff
                  className="size-10 text-primary-foreground/60"
                  aria-hidden="true"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end gap-4 p-6 sm:p-10 md:max-w-2xl md:justify-center">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-primary-foreground/80">
                Ceylon Property Portfolio
              </p>
              <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl">
                {active.title}
              </h2>
              {active.subtitle ? (
                <p className="max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
                  {active.subtitle}
                </p>
              ) : null}
              {active.linkUrl ? (
                <div>
                  <Button
                    asChild
                    className="rounded-full bg-primary-foreground px-6 text-primary shadow-subtle transition-smooth hover:bg-primary-foreground/90"
                  >
                    <a
                      href={active.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      data-ocid="home.banner_link"
                    >
                      Learn more
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {count > 1 ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous banner"
                data-ocid="home.banner_prev_button"
                onClick={() => goTo(index - 1)}
                className="absolute left-3 top-1/2 size-10 -translate-y-1/2 rounded-full border-border/60 bg-card/85 text-foreground backdrop-blur transition-smooth hover:bg-card"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next banner"
                data-ocid="home.banner_next_button"
                onClick={() => goTo(index + 1)}
                className="absolute right-3 top-1/2 size-10 -translate-y-1/2 rounded-full border-border/60 bg-card/85 text-foreground backdrop-blur transition-smooth hover:bg-card"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </Button>

              <div
                data-ocid="home.banner_dots"
                className="absolute bottom-4 right-5 flex items-center gap-2"
              >
                {banners.map((banner, dotIndex) => (
                  <button
                    key={banner.id.toString()}
                    type="button"
                    aria-label={`Show banner ${dotIndex + 1} of ${count}`}
                    aria-current={dotIndex === index}
                    data-ocid={`home.banner_dot.${dotIndex + 1}`}
                    onClick={() => goTo(dotIndex)}
                    className={cn(
                      "size-2.5 rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      dotIndex === index
                        ? "w-6 bg-primary-foreground"
                        : "bg-primary-foreground/45 hover:bg-primary-foreground/70",
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

interface BannerFallbackProps {
  isPending: boolean;
  isUnavailable: boolean;
  isError: boolean;
}

/**
 * The slider's non-content states. A missing or unreachable banner list must
 * never leave a hole in the page, so the fallback keeps the same footprint and
 * routes visitors into the portfolio instead.
 */
function BannerFallback({
  isPending,
  isUnavailable,
  isError,
}: BannerFallbackProps) {
  if (isPending) {
    return (
      <section
        data-ocid="home.banner_loading"
        aria-busy="true"
        className="bg-background pt-10 md:pt-14"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="aspect-[16/7] w-full rounded-3xl sm:aspect-[16/6]" />
          <span className="sr-only">Loading announcements…</span>
        </div>
      </section>
    );
  }

  if (isUnavailable || isError) {
    return (
      <section className="bg-background pt-10 md:pt-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={ImageOff}
            data-ocid="home.banner_unavailable"
            title="Announcements are unavailable"
            description="We could not load the current banners. The portfolio below is still up to date."
            action={
              <Button asChild className="rounded-full">
                <Link to="/listings" search={EMPTY_BROWSE_SEARCH}>
                  Browse listings
                </Link>
              </Button>
            }
          />
        </div>
      </section>
    );
  }

  return null;
}

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
