import { EnquiryDetail } from "@/components/admin/EnquiryDetail";
import {
  type EnquiryFilter,
  EnquiryList,
} from "@/components/admin/EnquiryList";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminEnquiries,
  useDeleteEnquiry,
  useSetEnquiryRead,
} from "@/hooks/use-admin";
import type { AdminEnquiry } from "@/types/listing";
import { Inbox } from "lucide-react";
import { useMemo, useState } from "react";

const SKELETON_IDS = Array.from({ length: 6 }, (_, i) => `enquiry-row-${i}`);

function InboxSkeleton() {
  return (
    <div
      data-ocid="enquiries.loading_state"
      aria-busy="true"
      aria-live="polite"
      className="space-y-3 p-4"
    >
      {SKELETON_IDS.map((id) => (
        <div
          key={id}
          className="space-y-2 rounded-md border border-admin-border p-3"
        >
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
      <span className="sr-only">Loading enquiries…</span>
    </div>
  );
}

function matchesSearch(item: AdminEnquiry, query: string): boolean {
  const haystack = [
    item.enquiry.name,
    item.enquiry.email,
    item.enquiry.phone,
    item.enquiry.message,
    item.listingTitle,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

/** Two-pane administrator inbox for every enquiry received. */
export function AdminEnquiriesPage() {
  const { data, isLoading, isError, refetch } = useAdminEnquiries();
  const setRead = useSetEnquiryRead();
  const removeEnquiry = useDeleteEnquiry();

  const [filter, setFilter] = useState<EnquiryFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<bigint | null>(null);

  const enquiries = useMemo(() => data ?? [], [data]);

  const unreadCount = useMemo(
    () => enquiries.filter((item) => !item.enquiry.read).length,
    [enquiries],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enquiries.filter((item) => {
      if (filter === "unread" && item.enquiry.read) return false;
      if (query && !matchesSearch(item, query)) return false;
      return true;
    });
  }, [enquiries, filter, search]);

  const selected =
    visible.find((item) => item.enquiry.id === selectedId) ?? null;

  const mutationError = setRead.isError
    ? setRead.error.message
    : removeEnquiry.isError
      ? removeEnquiry.error.message
      : null;

  function handleDelete(id: bigint) {
    removeEnquiry.mutate(id, {
      onSuccess: () => {
        setSelectedId((current) => (current === id ? null : current));
      },
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <div className="overflow-hidden rounded-lg border border-admin-border bg-background">
          <InboxSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <ErrorState
          title="Could not load enquiries"
          description="We could not reach the enquiries inbox. Please try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <EmptyState
          icon={Inbox}
          data-ocid="enquiries.empty_state"
          title="No enquiries yet"
          description="Enquiries submitted from the public listings will appear here, with the listing they relate to and their read state."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Enquiries
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every enquiry received from the public site, newest first.
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border border-admin-border bg-background shadow-subtle">
        <div className="grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <EnquiryList
            enquiries={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            unreadCount={unreadCount}
            className={selected ? "hidden lg:flex" : "flex"}
          />

          <div
            className={
              selected
                ? "flex min-h-[24rem] flex-col border-t border-admin-border lg:border-l lg:border-t-0"
                : "hidden min-h-[24rem] flex-col border-admin-border lg:flex lg:border-l"
            }
          >
            {selected ? (
              <EnquiryDetail
                item={selected}
                onToggleRead={(read) =>
                  setRead.mutate({ id: selected.enquiry.id, read })
                }
                onDelete={() => handleDelete(selected.enquiry.id)}
                isTogglingRead={setRead.isPending}
                isDeleting={removeEnquiry.isPending}
                mutationError={mutationError}
                onBack={() => setSelectedId(null)}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto"
              />
            ) : (
              <div
                data-ocid="enquiries.detail_placeholder"
                className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center"
              >
                <Inbox
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-foreground">
                  Select an enquiry
                </p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Choose an enquiry from the inbox to read the full message and
                  reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
