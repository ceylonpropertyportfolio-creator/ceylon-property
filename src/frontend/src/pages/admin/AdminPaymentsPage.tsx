import { AdminPaymentsTable } from "@/components/admin/AdminPaymentsTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminPayments,
  useConfirmPayment,
  useRejectPayment,
} from "@/hooks/use-admin";
import { formatCount, formatPrice } from "@/lib/format";
import type { AdminPayment } from "@/types/listing";
import { PaymentStatus } from "@/types/listing";
import { AlertTriangle, CreditCard, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type PaymentFilter = "all" | "pending" | "confirmed" | "rejected";

const FILTER_OPTIONS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "All payments" },
  { value: "pending", label: "Awaiting review" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
];

function PaymentsSkeleton() {
  const ids = Array.from({ length: 5 }, (_, i) => `payment-skeleton-${i}`);
  return (
    <div
      data-ocid="admin_payments.loading_state"
      className="space-y-2 rounded-lg border border-admin-border bg-card p-4"
    >
      {ids.map((id) => (
        <div key={id} className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="hidden h-4 w-28 sm:block" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Payment review surface. A payment is never marked successful automatically —
 * an administrator confirms each submitted reference by hand.
 */
export function AdminPaymentsPage() {
  const { data, isLoading, isError, refetch } = useAdminPayments();
  const confirmPayment = useConfirmPayment();
  const rejectPayment = useRejectPayment();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [pendingConfirm, setPendingConfirm] = useState<AdminPayment | null>(
    null,
  );
  const [pendingReject, setPendingReject] = useState<AdminPayment | null>(null);
  const [pendingId, setPendingId] = useState<bigint | null>(null);

  const payments = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return payments.filter((item) => {
      if (filter !== "all" && item.payment.status !== filter) return false;
      if (!needle) return true;
      return [
        item.customerName,
        item.customerEmail,
        item.payment.reference,
        item.payment.planName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [payments, query, filter]);

  const pendingCount = payments.filter(
    (item) => item.payment.status === PaymentStatus.pending,
  ).length;

  const hasFilters = query.trim() !== "" || filter !== "all";

  function handleConfirm() {
    if (!pendingConfirm) return;
    const id = pendingConfirm.payment.id;
    setPendingId(id);
    confirmPayment.mutate(id, {
      onSuccess: () => setPendingConfirm(null),
      onSettled: () => setPendingId(null),
    });
  }

  function handleReject() {
    if (!pendingReject) return;
    const id = pendingReject.payment.id;
    setPendingId(id);
    rejectPayment.mutate(id, {
      onSuccess: () => setPendingReject(null),
      onSettled: () => setPendingId(null),
    });
  }

  const mutationError = confirmPayment.error ?? rejectPayment.error;

  return (
    <div
      data-ocid="admin_payments.page"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6"
    >
      <header>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Accounts
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
          Payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatCount(BigInt(payments.length))} submitted ·{" "}
          {formatCount(BigInt(pendingCount))} awaiting review
        </p>
      </header>

      <div
        data-ocid="admin_payments.review_notice"
        className="mt-4 flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground"
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Payments are confirmed manually. Check the reference against your bank
          statement before confirming — confirming activates the customer&apos;s
          subscription immediately.
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer, plan or reference"
            aria-label="Search payments"
            data-ocid="admin_payments.search_input"
            className="h-9 rounded-md pl-9"
          />
        </div>

        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as PaymentFilter)}
        >
          <SelectTrigger
            aria-label="Filter payments"
            data-ocid="admin_payments.filter_select"
            className="h-9 w-[12rem] rounded-md"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            data-ocid="admin_payments.clear_filters_button"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {mutationError ? (
        <div
          data-ocid="admin_payments.mutation_error"
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{mutationError.message}</span>
        </div>
      ) : null}

      <div className="mt-4">
        {isLoading ? (
          <PaymentsSkeleton />
        ) : isError ? (
          <ErrorState
            data-ocid="admin_payments.error_state"
            title="Could not load payments"
            description="We could not reach the payment records. Please try again."
            onRetry={() => void refetch()}
          />
        ) : payments.length === 0 ? (
          <EmptyState
            data-ocid="admin_payments.empty_state"
            icon={CreditCard}
            title="No payments submitted"
            description="Payment references submitted by customers will appear here for manual review."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            data-ocid="admin_payments.no_results_state"
            icon={Search}
            title="No payments match your filters"
            description="Try a different search term or reset the status filter."
          />
        ) : (
          <AdminPaymentsTable
            payments={filtered}
            pendingId={pendingId}
            onConfirm={setPendingConfirm}
            onReject={setPendingReject}
          />
        )}
      </div>

      <AlertDialog
        open={pendingConfirm !== null}
        onOpenChange={(open) => {
          if (!open && !confirmPayment.isPending) setPendingConfirm(null);
        }}
      >
        <AlertDialogContent data-ocid="admin_payments.confirm_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Confirm this payment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConfirm
                ? `Confirming ${formatPrice(
                    pendingConfirm.payment.amount,
                    "LKR",
                  )} from ${pendingConfirm.customerName || "this customer"} for the ${
                    pendingConfirm.payment.planName
                  } plan activates their subscription immediately. Only confirm once the reference has been verified.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={confirmPayment.isPending}
              data-ocid="admin_payments.confirm_cancel_button"
              className="rounded-md"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmPayment.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              data-ocid="admin_payments.confirm_confirm_button"
              className="rounded-md"
            >
              {confirmPayment.isPending ? "Confirming…" : "Confirm payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingReject !== null}
        onOpenChange={(open) => {
          if (!open && !rejectPayment.isPending) setPendingReject(null);
        }}
      >
        <AlertDialogContent data-ocid="admin_payments.reject_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Reject this payment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReject
                ? `The reference from ${pendingReject.customerName || "this customer"} will be marked rejected and no subscription will be activated.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={rejectPayment.isPending}
              data-ocid="admin_payments.reject_cancel_button"
              className="rounded-md"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={rejectPayment.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleReject();
              }}
              data-ocid="admin_payments.reject_confirm_button"
              className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejectPayment.isPending ? "Rejecting…" : "Reject payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
