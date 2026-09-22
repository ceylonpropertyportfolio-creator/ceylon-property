import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ListingStatusBadge } from "@/components/listing/ListingStatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCustomers,
  useAdminEnquiries,
  useAdminListings,
  useAdminPayments,
} from "@/hooks/use-admin";
import {
  formatCount,
  formatPrice,
  formatRelativeTime,
  formatShortLocation,
} from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  EyeOff,
  Inbox,
  Mail,
  Plus,
  Star,
  Users,
} from "lucide-react";

const RECENT_LIMIT = 5;

function DashboardSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `stat-skeleton-${i}`);
  return (
    <div data-ocid="admin_dashboard.loading_state" className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ids.map((id) => (
          <div
            key={id}
            className="space-y-3 rounded-lg border border-admin-border bg-card p-4"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

/** At-a-glance overview of the portfolio, accounts and revenue. */
export function AdminDashboardPage() {
  const listingsQuery = useAdminListings();
  const enquiriesQuery = useAdminEnquiries();
  const customersQuery = useAdminCustomers();
  const paymentsQuery = useAdminPayments();

  const listings = listingsQuery.data ?? [];
  const enquiries = enquiriesQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  const publishedCount = listings.filter((s) => s.listing.published).length;
  const unpublishedCount = listings.length - publishedCount;
  const featuredCount = listings.filter((s) => s.listing.featured).length;
  const unreadCount = enquiries.filter((e) => !e.enquiry.read).length;

  const activeSubscriptions = customers.filter(
    (account) => account.subscription?.status === "active",
  ).length;
  const pendingPayments = payments.filter(
    (item) => item.payment.status === "pending",
  ).length;

  const recentListings = listings.slice(0, RECENT_LIMIT);
  const recentEnquiries = enquiries.slice(0, RECENT_LIMIT);

  const isLoading =
    listingsQuery.isLoading ||
    enquiriesQuery.isLoading ||
    customersQuery.isLoading ||
    paymentsQuery.isLoading;
  const isError =
    listingsQuery.isError ||
    enquiriesQuery.isError ||
    customersQuery.isError ||
    paymentsQuery.isError;

  return (
    <div
      data-ocid="admin_dashboard.page"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Portfolio health, accounts and the latest activity across the
            registry.
          </p>
        </div>
        <Button asChild className="rounded-md">
          <Link
            to="/admin/listings/new"
            data-ocid="admin_dashboard.new_listing_button"
          >
            <Plus className="size-4" aria-hidden="true" />
            New listing
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <ErrorState
            data-ocid="admin_dashboard.error_state"
            title="Could not load the dashboard"
            description="We could not reach the registry data. Please try again."
            onRetry={() => {
              void listingsQuery.refetch();
              void enquiriesQuery.refetch();
              void customersQuery.refetch();
              void paymentsQuery.refetch();
            }}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section
            aria-label="Registry totals"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            <StatCard
              data-ocid="admin_dashboard.stat.total_listings"
              label="Total listings"
              value={formatCount(BigInt(listings.length))}
              hint={`${formatCount(BigInt(featuredCount))} featured`}
              icon={Building2}
              tone="neutral"
            />
            <StatCard
              data-ocid="admin_dashboard.stat.published"
              label="Published"
              value={formatCount(BigInt(publishedCount))}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              data-ocid="admin_dashboard.stat.unpublished"
              label="Unpublished"
              value={formatCount(BigInt(unpublishedCount))}
              icon={EyeOff}
              tone="warning"
            />
            <StatCard
              data-ocid="admin_dashboard.stat.customers"
              label="Customers"
              value={formatCount(BigInt(customers.length))}
              hint={`${formatCount(BigInt(activeSubscriptions))} active plans`}
              icon={Users}
              tone="neutral"
            />
            <StatCard
              data-ocid="admin_dashboard.stat.payments"
              label="Payments"
              value={formatCount(BigInt(payments.length))}
              hint={
                pendingPayments > 0
                  ? `${pendingPayments} awaiting review`
                  : undefined
              }
              icon={CreditCard}
              tone={pendingPayments > 0 ? "warning" : "neutral"}
              action={
                pendingPayments > 0 ? (
                  <Link
                    to="/admin/payments"
                    data-ocid="admin_dashboard.review_payments_link"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-smooth hover:underline"
                  >
                    Review payments
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                ) : undefined
              }
            />
            <StatCard
              data-ocid="admin_dashboard.stat.enquiries"
              label="Total enquiries"
              value={formatCount(BigInt(enquiries.length))}
              hint={unreadCount > 0 ? `${unreadCount} unread` : undefined}
              icon={Inbox}
              tone="accent"
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-5">
            <section
              aria-labelledby="recent-listings-heading"
              className="lg:col-span-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="recent-listings-heading"
                  className="font-display text-lg font-semibold text-foreground"
                >
                  Recent listings
                </h2>
                <Link
                  to="/admin/listings"
                  data-ocid="admin_dashboard.listings_link"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-smooth hover:underline"
                >
                  Manage listings
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-admin-border bg-card">
                {recentListings.length === 0 ? (
                  <EmptyState
                    data-ocid="admin_dashboard.listings_empty_state"
                    icon={Building2}
                    title="No listings yet"
                    description="Create the first property listing to start building the portfolio."
                    className="rounded-none border-0 bg-transparent py-12"
                    action={
                      <Button asChild className="rounded-md">
                        <Link
                          to="/admin/listings/new"
                          data-ocid="admin_dashboard.empty_new_listing_button"
                        >
                          <Plus className="size-4" aria-hidden="true" />
                          New listing
                        </Link>
                      </Button>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-admin-border">
                    {recentListings.map((summary, index) => (
                      <li
                        key={summary.listing.id.toString()}
                        data-ocid={`admin_dashboard.listing_item.${index + 1}`}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-foreground">
                              {summary.listing.title}
                            </span>
                            {summary.listing.featured ? (
                              <Star
                                className="size-3.5 shrink-0 fill-accent text-accent"
                                aria-label="Featured"
                              />
                            ) : null}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {formatShortLocation(
                              summary.listing.city,
                              summary.listing.region,
                            ) || "Location not set"}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="tabular hidden text-sm font-medium text-foreground sm:inline">
                            {formatPrice(
                              summary.listing.price,
                              summary.listing.currency,
                            )}
                          </span>
                          <ListingStatusBadge
                            published={summary.listing.published}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section
              aria-labelledby="recent-enquiries-heading"
              className="lg:col-span-2"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="recent-enquiries-heading"
                  className="font-display text-lg font-semibold text-foreground"
                >
                  Recent enquiries
                </h2>
                <Link
                  to="/admin/enquiries"
                  data-ocid="admin_dashboard.enquiries_link"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-smooth hover:underline"
                >
                  View all
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-admin-border bg-card">
                {recentEnquiries.length === 0 ? (
                  <EmptyState
                    data-ocid="admin_dashboard.enquiries_empty_state"
                    icon={Mail}
                    title="No enquiries yet"
                    description="Messages sent from the public site will appear here."
                    className="rounded-none border-0 bg-transparent py-12"
                  />
                ) : (
                  <ul className="divide-y divide-admin-border">
                    {recentEnquiries.map((item, index) => (
                      <li
                        key={item.enquiry.id.toString()}
                        data-ocid={`admin_dashboard.enquiry_item.${index + 1}`}
                        className="flex flex-col gap-1 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium text-foreground">
                            {item.enquiry.name}
                          </span>
                          {item.enquiry.read ? null : (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-primary">
                              Unread
                            </span>
                          )}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.listingTitle}
                        </span>
                        <span className="text-[0.7rem] text-muted-foreground">
                          {formatRelativeTime(item.enquiry.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
