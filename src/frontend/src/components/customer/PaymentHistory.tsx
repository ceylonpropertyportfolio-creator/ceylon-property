import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPayments } from "@/hooks/use-customer";
import {
  formatDateTime,
  formatMonthlyPrice,
  paymentStatusLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { PaymentStatus } from "@/types/listing";
import { Link } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  [PaymentStatus.pending]:
    "border-warning/40 bg-warning/10 text-warning-foreground",
  [PaymentStatus.confirmed]: "border-primary/30 bg-primary/10 text-primary",
  [PaymentStatus.rejected]:
    "border-destructive/30 bg-destructive/10 text-destructive",
};

/**
 * The customer's payment history. Every entry stays "Awaiting review" until an
 * administrator confirms it — the app never marks a payment successful on its
 * own.
 */
export function PaymentHistory() {
  const paymentsQuery = useMyPayments();
  const payments = paymentsQuery.data ?? [];

  return (
    <section
      data-ocid="account.payments_section"
      className="rounded-3xl border border-border bg-card p-7 shadow-subtle md:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CreditCard className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Payment history
          </h2>
          <p className="text-sm text-muted-foreground">
            References you have submitted, and their review status.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {paymentsQuery.isLoading ? (
          <div data-ocid="account.payments_loading_state" className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : paymentsQuery.isError || paymentsQuery.isUnavailable ? (
          <ErrorState
            data-ocid="account.payments_error_state"
            title="We could not load your payments"
            description="The payments service did not respond. Please try again in a moment."
            onRetry={() => void paymentsQuery.refetch()}
          />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            data-ocid="account.payments_empty_state"
            title="No payments yet"
            description="Once you submit a payment reference for a plan it will appear here, pending our review."
            action={
              <Button asChild className="rounded-full">
                <Link to="/plans" data-ocid="account.payments_plans_button">
                  View plans
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((payment, index) => (
              <li
                key={payment.id.toString()}
                data-ocid={`account.payment_row.${index + 1}`}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {payment.planName} · {formatMonthlyPrice(payment.amount)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitted {formatDateTime(payment.submittedAt)}
                    {payment.reference ? ` · Ref ${payment.reference}` : ""}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 rounded-full",
                    PAYMENT_STATUS_STYLES[payment.status] ??
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {paymentStatusLabel(payment.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
