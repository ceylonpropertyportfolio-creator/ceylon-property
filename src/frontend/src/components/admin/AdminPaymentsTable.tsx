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
import {
  formatDate,
  formatDateTime,
  formatPrice,
  paymentStatusLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminPayment } from "@/types/listing";
import { PaymentStatus } from "@/types/listing";
import { Check, X } from "lucide-react";

interface AdminPaymentsTableProps {
  payments: AdminPayment[];
  /** Id of the payment whose mutation is in flight. */
  pendingId?: bigint | null;
  onConfirm: (item: AdminPayment) => void;
  onReject: (item: AdminPayment) => void;
}

const STATUS_CLASSES: Record<PaymentStatus, string> = {
  [PaymentStatus.pending]: "bg-warning/20 text-warning-foreground",
  [PaymentStatus.confirmed]: "bg-success/15 text-success",
  [PaymentStatus.rejected]: "bg-destructive/10 text-destructive",
};

/** Dense table of every submitted payment awaiting or past review. */
export function AdminPaymentsTable({
  payments,
  pendingId,
  onConfirm,
  onReject,
}: AdminPaymentsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-admin-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[13rem]">Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="hidden md:table-cell">Reference</TableHead>
            <TableHead className="hidden lg:table-cell">Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((item, index) => {
            const { payment, customerName, customerEmail } = item;
            const isPending = pendingId === payment.id;
            const isAwaitingReview = payment.status === PaymentStatus.pending;

            return (
              <TableRow
                key={payment.id.toString()}
                data-ocid={`admin_payments.row.${index + 1}`}
                className="animate-fade-in"
              >
                <TableCell>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {customerName || "Unnamed customer"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {customerEmail || "No email"}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-foreground">
                    {payment.planName}
                  </span>
                </TableCell>

                <TableCell className="tabular text-right text-sm font-medium text-foreground">
                  {formatPrice(payment.amount, "LKR")}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <span className="font-mono text-xs text-muted-foreground">
                    {payment.reference || "—"}
                  </span>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(payment.submittedAt)}
                  </span>
                  {payment.periodEnd ? (
                    <span className="block text-[0.7rem] text-muted-foreground">
                      Covers until {formatDate(payment.periodEnd)}
                    </span>
                  ) : null}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    data-ocid={`admin_payments.status.${index + 1}`}
                    className={cn(
                      "rounded-full border-transparent px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em]",
                      STATUS_CLASSES[payment.status],
                    )}
                  >
                    {paymentStatusLabel(payment.status)}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {isAwaitingReview ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => onConfirm(item)}
                          data-ocid={`admin_payments.confirm_button.${index + 1}`}
                          className="rounded-md text-xs text-success hover:bg-success/10 hover:text-success"
                        >
                          <Check className="size-4" aria-hidden="true" />
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => onReject(item)}
                          data-ocid={`admin_payments.reject_button.${index + 1}`}
                          className="rounded-md text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="size-4" aria-hidden="true" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Reviewed
                      </span>
                    )}
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
