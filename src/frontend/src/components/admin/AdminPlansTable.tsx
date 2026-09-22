import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAllowance, formatMonthlyPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/listing";
import { Pencil, Trash2 } from "lucide-react";

interface AdminPlansTableProps {
  plans: Plan[];
  /** Id of the plan whose mutation is in flight. */
  pendingId?: bigint | null;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

/** Dense table of every advertising plan, active or not. */
export function AdminPlansTable({
  plans,
  pendingId,
  onEdit,
  onDelete,
}: AdminPlansTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-admin-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[12rem]">Plan</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="hidden text-center sm:table-cell">
              Listings
            </TableHead>
            <TableHead className="hidden text-center sm:table-cell">
              Images
            </TableHead>
            <TableHead className="hidden lg:table-cell">Features</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan, index) => {
            const isPending = pendingId === plan.id;
            return (
              <TableRow
                key={plan.id.toString()}
                data-ocid={`admin_plans.row.${index + 1}`}
                className="animate-fade-in"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {plan.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {plan.billingPeriod || "Monthly"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="tabular text-right text-sm font-medium text-foreground">
                  {formatMonthlyPrice(plan.price)}
                </TableCell>

                <TableCell className="tabular hidden text-center text-sm text-muted-foreground sm:table-cell">
                  {formatAllowance(plan.listingAllowance)}
                </TableCell>

                <TableCell className="tabular hidden text-center text-sm text-muted-foreground sm:table-cell">
                  {formatAllowance(plan.imageAllowance)}
                </TableCell>

                <TableCell className="hidden max-w-[18rem] lg:table-cell">
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {plan.features.length > 0
                      ? plan.features.join(" · ")
                      : "No features listed"}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    data-ocid={`admin_plans.status.${index + 1}`}
                    className={cn(
                      "rounded-full border-transparent px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em]",
                      plan.active
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {plan.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => onEdit(plan)}
                      aria-label={`Edit ${plan.name}`}
                      data-ocid={`admin_plans.edit_button.${index + 1}`}
                      className="rounded-md"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => onDelete(plan)}
                      aria-label={`Delete ${plan.name}`}
                      data-ocid={`admin_plans.delete_button.${index + 1}`}
                      className="rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
