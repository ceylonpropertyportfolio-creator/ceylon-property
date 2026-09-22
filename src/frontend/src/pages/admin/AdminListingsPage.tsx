import { AdminListingsTable } from "@/components/admin/AdminListingsTable";
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
import { Button } from "@/components/ui/button";
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
  useAdminListings,
  useDeleteListing,
  useSetListingBlocked,
  useSetListingFeatured,
  useSetListingPublished,
} from "@/hooks/use-admin";
import { formatCount } from "@/lib/format";
import type { AdminListingSummary } from "@/types/listing";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Building2, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type StatusFilter =
  | "all"
  | "published"
  | "unpublished"
  | "featured"
  | "blocked";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "featured", label: "Featured" },
  { value: "blocked", label: "Blocked" },
];

function ListingsTableSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `row-skeleton-${i}`);
  return (
    <div
      data-ocid="admin_listings.loading_state"
      className="space-y-2 rounded-lg border border-admin-border bg-card p-4"
    >
      {ids.map((id) => (
        <div key={id} className="flex items-center gap-4">
          <Skeleton className="size-11 shrink-0 rounded-md" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Dense management surface for every listing in the portfolio. */
export function AdminListingsPage() {
  const { data, isLoading, isError, refetch } = useAdminListings();
  const setPublished = useSetListingPublished();
  const setFeatured = useSetListingFeatured();
  const setBlocked = useSetListingBlocked();
  const deleteListing = useDeleteListing();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pendingDelete, setPendingDelete] =
    useState<AdminListingSummary | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<bigint | null>(null);

  const listings = data ?? [];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter(({ listing }) => {
      if (status === "published" && !listing.published) return false;
      if (status === "unpublished" && listing.published) return false;
      if (status === "featured" && !listing.featured) return false;
      if (status === "blocked" && !listing.blocked) return false;
      if (!needle) return true;
      return (
        listing.title.toLowerCase().includes(needle) ||
        listing.city.toLowerCase().includes(needle) ||
        listing.region.toLowerCase().includes(needle) ||
        listing.country.toLowerCase().includes(needle)
      );
    });
  }, [listings, query, status]);

  const hasFilters = query.trim() !== "" || status !== "all";

  function runToggle(id: bigint, action: () => void) {
    setPendingToggleId(id);
    action();
  }

  function handleToggle(summary: AdminListingSummary) {
    runToggle(summary.listing.id, () =>
      setPublished.mutate(
        { id: summary.listing.id, published: !summary.listing.published },
        { onSettled: () => setPendingToggleId(null) },
      ),
    );
  }

  function handleToggleFeatured(summary: AdminListingSummary) {
    runToggle(summary.listing.id, () =>
      setFeatured.mutate(
        { id: summary.listing.id, featured: !summary.listing.featured },
        { onSettled: () => setPendingToggleId(null) },
      ),
    );
  }

  function handleToggleBlocked(summary: AdminListingSummary) {
    runToggle(summary.listing.id, () =>
      setBlocked.mutate(
        { id: summary.listing.id, blocked: !summary.listing.blocked },
        { onSettled: () => setPendingToggleId(null) },
      ),
    );
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteListing.mutate(pendingDelete.listing.id, {
      onSuccess: () => setPendingDelete(null),
    });
  }

  const mutationError =
    setPublished.error ??
    setFeatured.error ??
    setBlocked.error ??
    deleteListing.error;

  return (
    <div
      data-ocid="admin_listings.page"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            Listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCount(BigInt(listings.length))} total ·{" "}
            {formatCount(BigInt(filtered.length))} shown
          </p>
        </div>
        <Button asChild className="rounded-md">
          <Link
            to="/admin/listings/new"
            data-ocid="admin_listings.new_listing_button"
          >
            <Plus className="size-4" aria-hidden="true" />
            New listing
          </Link>
        </Button>
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
            placeholder="Search by title or location"
            aria-label="Search listings"
            data-ocid="admin_listings.search_input"
            className="h-9 rounded-md pl-9"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
        >
          <SelectTrigger
            aria-label="Filter by status"
            data-ocid="admin_listings.status_select"
            className="h-9 w-[11rem] rounded-md"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setStatus("all");
            }}
            data-ocid="admin_listings.clear_filters_button"
            className="rounded-md"
          >
            <X className="size-4" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
      </div>

      {mutationError ? (
        <div
          data-ocid="admin_listings.mutation_error"
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
          <ListingsTableSkeleton />
        ) : isError ? (
          <ErrorState
            data-ocid="admin_listings.error_state"
            title="Could not load listings"
            description="We could not reach the portfolio data. Please try again."
            onRetry={() => void refetch()}
          />
        ) : listings.length === 0 ? (
          <EmptyState
            data-ocid="admin_listings.empty_state"
            icon={Building2}
            title="No listings yet"
            description="Create the first property listing to start building the portfolio."
            action={
              <Button asChild className="rounded-md">
                <Link
                  to="/admin/listings/new"
                  data-ocid="admin_listings.empty_new_listing_button"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  New listing
                </Link>
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            data-ocid="admin_listings.no_results_state"
            icon={Search}
            title="No listings match your filters"
            description="Try a different search term or reset the status filter."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
                data-ocid="admin_listings.reset_filters_button"
                className="rounded-md"
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <AdminListingsTable
            listings={filtered}
            pendingId={pendingToggleId}
            onTogglePublished={handleToggle}
            onToggleFeatured={handleToggleFeatured}
            onToggleBlocked={handleToggleBlocked}
            onDelete={setPendingDelete}
          />
        )}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteListing.isPending) setPendingDelete(null);
        }}
      >
        <AlertDialogContent data-ocid="admin_listings.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this listing?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.listing.title}” and its ${formatCount(
                    pendingDelete.enquiryCount,
                  )} enquiries will be permanently removed. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteListing.isPending}
              data-ocid="admin_listings.cancel_button"
              className="rounded-md"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteListing.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
              data-ocid="admin_listings.confirm_button"
              className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteListing.isPending ? "Deleting…" : "Delete listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
