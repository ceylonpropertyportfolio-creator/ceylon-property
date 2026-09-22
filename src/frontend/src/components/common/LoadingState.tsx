import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Number of skeleton cards to render. */
  count?: number;
  className?: string;
  "data-ocid"?: string;
}

const SKELETON_IDS = Array.from(
  { length: 6 },
  (_, i) => `listing-skeleton-${i}`,
);

/** A layout-matched skeleton grid used while listing data loads. */
export function LoadingState({
  count = 6,
  className,
  "data-ocid": dataOcid = "loading_state",
}: LoadingStateProps) {
  return (
    <div
      data-ocid={dataOcid}
      aria-busy="true"
      aria-live="polite"
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {SKELETON_IDS.slice(0, count).map((id) => (
        <div
          key={id}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-subtle"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading listings…</span>
    </div>
  );
}
