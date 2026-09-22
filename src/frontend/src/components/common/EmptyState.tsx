import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  "data-ocid"?: string;
}

/** A helpful empty state with an icon, headline, supporting copy and action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  "data-ocid": dataOcid = "empty_state",
}: EmptyStateProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="font-display text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
