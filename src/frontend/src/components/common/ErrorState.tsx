import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  "data-ocid"?: string;
}

/** A recoverable error state with a retry action. */
export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this content. Please try again.",
  onRetry,
  className,
  "data-ocid": dataOcid = "error_state",
}: ErrorStateProps) {
  return (
    <div
      data-ocid={dataOcid}
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="font-display text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          data-ocid="error_state.retry_button"
          className="mt-6 rounded-full"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
