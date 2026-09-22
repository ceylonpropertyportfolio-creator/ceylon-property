import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { AccountPlanPanel } from "@/components/customer/AccountPlanPanel";
import { CustomerAuthPanel } from "@/components/customer/CustomerAuthPanel";
import { MyListingsPanel } from "@/components/customer/MyListingsPanel";
import { PaymentHistory } from "@/components/customer/PaymentHistory";
import { ProfileForm } from "@/components/customer/ProfileForm";
import { VerificationPanel } from "@/components/customer/VerificationPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAccount } from "@/hooks/use-customer";
import { formatDate } from "@/lib/format";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { Plus, UserRound } from "lucide-react";

/**
 * The signed-in customer's account page: active plan, verification, profile,
 * their own listings and payment history. Customer accounts are entirely
 * separate from the administrator console.
 */
export function AccountPage() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const accountQuery = useMyAccount();

  const account = accountQuery.data ?? null;
  const customer = account?.customer ?? null;
  const subscription = account?.subscription ?? null;

  if (isInitializing) {
    return (
      <div
        data-ocid="account.loading_state"
        className="mx-auto w-full max-w-5xl space-y-4 px-4 py-16 sm:px-6 lg:px-8"
      >
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <CustomerAuthPanel data-ocid="account.auth_panel" />
      </div>
    );
  }

  if (accountQuery.isLoading) {
    return (
      <div
        data-ocid="account.account_loading_state"
        className="mx-auto w-full max-w-5xl space-y-4 px-4 py-16 sm:px-6 lg:px-8"
      >
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  if (accountQuery.isError || accountQuery.isUnavailable) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState
          data-ocid="account.error_state"
          title="We could not load your account"
          description="The account service did not respond. Please try again in a moment."
          onRetry={() => void accountQuery.refetch()}
        />
      </div>
    );
  }

  if (!account || !customer) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={UserRound}
          data-ocid="account.not_registered_state"
          title="You have not created an advertiser account yet"
          description="Register a short profile to choose a plan and post your first property."
          action={
            <Button asChild className="rounded-full">
              <Link to="/post-property" data-ocid="account.register_button">
                Post your property
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div data-ocid="account.page" className="bg-background">
      <section className="bg-gradient-subtle py-14 md:py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground/80">
              My account
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {customer.name || "Advertiser"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Member since {formatDate(customer.createdAt)}
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full px-6">
            <Link to="/post-property" data-ocid="account.post_property_button">
              <Plus className="size-4" aria-hidden="true" />
              Post a property
            </Link>
          </Button>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <AccountPlanPanel subscription={subscription} />
        <VerificationPanel customer={customer} />
        <ProfileForm customer={customer} />
        <MyListingsPanel />
        <PaymentHistory />
      </div>
    </div>
  );
}
