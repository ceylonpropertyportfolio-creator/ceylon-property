import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ListingStatusBadgeProps {
  published: boolean;
  className?: string;
  "data-ocid"?: string;
}

/** Pill badge showing whether a listing is published or unpublished. */
export function ListingStatusBadge({
  published,
  className,
  "data-ocid": dataOcid,
}: ListingStatusBadgeProps) {
  return (
    <Badge
      data-ocid={dataOcid}
      variant="outline"
      className={cn(
        "rounded-full border-transparent px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em]",
        published
          ? "bg-success/15 text-success"
          : "bg-warning/20 text-warning-foreground",
        className,
      )}
    >
      {published ? "Published" : "Unpublished"}
    </Badge>
  );
}
