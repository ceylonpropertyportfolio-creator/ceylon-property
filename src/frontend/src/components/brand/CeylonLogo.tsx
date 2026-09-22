import { cn } from "@/lib/utils";

interface CeylonLogoProps {
  /** `light` renders for dark surfaces (footer), `dark` for light surfaces. */
  tone?: "dark" | "light";
  className?: string;
  /** Hides the wordmark and renders the monogram only. */
  compact?: boolean;
}

/**
 * The Ceylon Property Portfolio lockup: a green monogram tile with a stylised
 * roofline, paired with the stacked wordmark. Used in the public header and
 * footer so the brand reads identically in both places.
 */
export function CeylonLogo({
  tone = "dark",
  className,
  compact = false,
}: CeylonLogoProps) {
  const isLight = tone === "light";

  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl shadow-subtle",
          isLight ? "bg-primary-foreground/15" : "bg-primary",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          role="img"
          aria-label="Ceylon Property Portfolio"
          className={cn(
            "size-5",
            isLight ? "text-primary-foreground" : "text-primary-foreground",
          )}
        >
          <title>Ceylon Property Portfolio</title>
          <path
            d="M3.5 11.2 12 4.2l8.5 7"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10.6V19h12v-8.4"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.2 19v-4.4h3.6V19"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {compact ? null : (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.05rem] font-semibold tracking-tight",
              isLight ? "text-primary-foreground" : "text-foreground",
            )}
          >
            Ceylon Property
          </span>
          <span
            className={cn(
              "mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.24em]",
              isLight ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            Portfolio
          </span>
        </span>
      )}
    </span>
  );
}
