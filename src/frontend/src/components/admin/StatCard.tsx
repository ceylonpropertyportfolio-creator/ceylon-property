import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** Optional accent applied to the icon well. */
  tone?: "neutral" | "success" | "warning" | "accent";
  action?: ReactNode;
  className?: string;
  "data-ocid"?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  accent: "bg-accent/20 text-accent-foreground",
};

/** A compact metric tile for the admin dashboard. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  action,
  className,
  "data-ocid": dataOcid,
}: StatCardProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-admin-border bg-card p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            TONE_CLASSES[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="tabular font-display text-3xl font-semibold leading-none text-foreground">
          {value}
        </span>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>

      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
