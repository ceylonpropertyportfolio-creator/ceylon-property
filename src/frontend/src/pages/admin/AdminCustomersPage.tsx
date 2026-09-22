import { AdminCustomersTable } from "@/components/admin/AdminCustomersTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
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
  useAdminCustomers,
  useSetCustomerBlocked,
  useSetMobileVerification,
} from "@/hooks/use-admin";
import { formatCount } from "@/lib/format";
import type { CustomerAccount } from "@/types/listing";
import { MobileVerification } from "@/types/listing";
import { AlertTriangle, Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";

type AccountFilter = "all" | "active" | "blocked" | "pending_mobile";

const FILTER_OPTIONS: { value: AccountFilter; label: string }[] = [
  { value: "all", label: "All accounts" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
  { value: "pending_mobile", label: "Mobile pending" },
];

function CustomersSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `customer-skeleton-${i}`);
  return (
    <div
      data-ocid="admin_customers.loading_state"
      className="space-y-2 rounded-lg border border-admin-border bg-card p-4"
    >
      {ids.map((id) => (
        <div key={id} className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Management surface for every registered customer and advertiser. */
export function AdminCustomersPage() {
  const { data, isLoading, isError, refetch } = useAdminCustomers();
  const setBlocked = useSetCustomerBlocked();
  const setMobile = useSetMobileVerification();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AccountFilter>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const customers = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return customers.filter(({ customer }) => {
      if (filter === "active" && customer.blocked) return false;
      if (filter === "blocked" && !customer.blocked) return false;
      if (
        filter === "pending_mobile" &&
        customer.mobileVerification !== MobileVerification.pendingReview
      ) {
        return false;
      }
      if (!needle) return true;
      return [
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
        customer.principal.toString(),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [customers, query, filter]);

  const hasFilters = query.trim() !== "" || filter !== "all";

  function handleToggleBlocked(account: CustomerAccount) {
    const id = account.customer.principal.toString();
    setPendingId(id);
    setBlocked.mutate(
      {
        customer: account.customer.principal,
        blocked: !account.customer.blocked,
      },
      { onSettled: () => setPendingId(null) },
    );
  }

  function handleSetMobile(
    account: CustomerAccount,
    state: MobileVerification,
  ) {
    const id = account.customer.principal.toString();
    setPendingId(id);
    setMobile.mutate(
      { customer: account.customer.principal, state },
      { onSettled: () => setPendingId(null) },
    );
  }

  const mutationError = setBlocked.error ?? setMobile.error;

  return (
    <div
      data-ocid="admin_customers.page"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6"
    >
      <header>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Accounts
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
          Customers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatCount(BigInt(customers.length))} registered ·{" "}
          {formatCount(BigInt(filtered.length))} shown
        </p>
      </header>

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
            placeholder="Search name, email, phone or principal"
            aria-label="Search customers"
            data-ocid="admin_customers.search_input"
            className="h-9 rounded-md pl-9"
          />
        </div>

        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as AccountFilter)}
        >
          <SelectTrigger
            aria-label="Filter accounts"
            data-ocid="admin_customers.filter_select"
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
            data-ocid="admin_customers.clear_filters_button"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {mutationError ? (
        <div
          data-ocid="admin_customers.mutation_error"
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
          <CustomersSkeleton />
        ) : isError ? (
          <ErrorState
            data-ocid="admin_customers.error_state"
            title="Could not load customers"
            description="We could not reach the customer accounts. Please try again."
            onRetry={() => void refetch()}
          />
        ) : customers.length === 0 ? (
          <EmptyState
            data-ocid="admin_customers.empty_state"
            icon={Users}
            title="No customers yet"
            description="Accounts appear here as soon as advertisers register on the public site."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            data-ocid="admin_customers.no_results_state"
            icon={Search}
            title="No customers match your filters"
            description="Try a different search term or reset the account filter."
          />
        ) : (
          <AdminCustomersTable
            customers={filtered}
            pendingId={pendingId}
            onToggleBlocked={handleToggleBlocked}
            onSetMobileVerification={handleSetMobile}
          />
        )}
      </div>
    </div>
  );
}
