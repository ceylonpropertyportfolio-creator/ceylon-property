import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminEnquiry } from "@/types/listing";
import { Mail, MailOpen, Search } from "lucide-react";

export type EnquiryFilter = "all" | "unread";

interface EnquiryListProps {
  enquiries: AdminEnquiry[];
  selectedId: bigint | null;
  onSelect: (id: bigint) => void;
  filter: EnquiryFilter;
  onFilterChange: (filter: EnquiryFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  unreadCount: number;
  className?: string;
}

/** A compact, scannable inbox row for a single enquiry. */
function EnquiryRow({
  item,
  index,
  selected,
  onSelect,
}: {
  item: AdminEnquiry;
  index: number;
  selected: boolean;
  onSelect: (id: bigint) => void;
}) {
  const { enquiry, listingTitle } = item;
  const unread = !enquiry.read;

  return (
    <li>
      <button
        type="button"
        data-ocid={`enquiries.item.${index + 1}`}
        aria-current={selected ? "true" : undefined}
        onClick={() => onSelect(enquiry.id)}
        className={cn(
          "group flex w-full flex-col gap-1.5 border-b border-admin-border px-4 py-3 text-left transition-colors",
          "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          selected && "bg-muted",
        )}
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              unread ? "bg-primary" : "bg-transparent",
            )}
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              unread
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground",
            )}
          >
            {enquiry.name}
          </span>
          <span className="shrink-0 text-xs tabular text-muted-foreground">
            {formatRelativeTime(enquiry.createdAt)}
          </span>
        </div>

        <span className="flex min-w-0 items-center gap-1.5 pl-4 text-xs text-muted-foreground">
          <span className="truncate">{listingTitle || "Listing removed"}</span>
        </span>

        <span className="line-clamp-2 pl-4 text-xs leading-relaxed text-muted-foreground">
          {enquiry.message}
        </span>

        <span className="flex items-center gap-2 pl-4">
          {unread ? (
            <Badge
              variant="default"
              className="rounded-sm px-1.5 py-0 text-[10px] uppercase tracking-wider"
            >
              Unread
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-sm px-1.5 py-0 text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Read
            </Badge>
          )}
        </span>
      </button>
    </li>
  );
}

/** The inbox list pane: filters, search and every enquiry row. */
export function EnquiryList({
  enquiries,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  unreadCount,
  className,
}: EnquiryListProps) {
  const filters: { value: EnquiryFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
  ];

  return (
    <div
      data-ocid="enquiries.list_panel"
      className={cn(
        "flex min-h-0 flex-col border-admin-border bg-background",
        className,
      )}
    >
      <div className="space-y-3 border-b border-admin-border p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-foreground">
            Enquiries
          </h2>
          <span className="text-xs tabular text-muted-foreground">
            {unreadCount} unread
          </span>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, email or message"
            aria-label="Search enquiries"
            data-ocid="enquiries.search_input"
            className="h-9 rounded-md pl-8"
          />
        </div>

        <fieldset className="flex items-center gap-1 rounded-md border border-admin-border p-0.5">
          <legend className="sr-only">Filter enquiries</legend>
          {filters.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                data-ocid={`enquiries.filter.${option.value}`}
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  "flex-1 rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {option.label}
                {option.value === "unread" && unreadCount > 0 ? (
                  <span className="ml-1.5 tabular">({unreadCount})</span>
                ) : null}
              </button>
            );
          })}
        </fieldset>
      </div>

      {enquiries.length === 0 ? (
        <div
          data-ocid="enquiries.list_empty_state"
          className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center"
        >
          <MailOpen
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-foreground">
            No enquiries match
          </p>
          <p className="text-xs text-muted-foreground">
            Try a different filter or clear the search.
          </p>
        </div>
      ) : (
        <ul
          data-ocid="enquiries.list"
          className="min-h-0 flex-1 divide-y divide-admin-border overflow-y-auto"
        >
          {enquiries.map((item, index) => (
            <EnquiryRow
              key={item.enquiry.id.toString()}
              item={item}
              index={index}
              selected={selectedId === item.enquiry.id}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}

      <div className="flex items-center gap-1.5 border-t border-admin-border px-4 py-2 text-xs text-muted-foreground">
        <Mail className="size-3.5" aria-hidden="true" />
        <span className="tabular">
          {enquiries.length} shown · {unreadCount} unread
        </span>
      </div>
    </div>
  );
}
