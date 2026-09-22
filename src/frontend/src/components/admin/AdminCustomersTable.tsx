import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  emailVerificationLabel,
  formatDate,
  mobileVerificationLabel,
  subscriptionStatusLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CustomerAccount } from "@/types/listing";
import { MobileVerification } from "@/types/listing";
import {
  Ban,
  MoreHorizontal,
  ShieldCheck,
  ShieldX,
  UserCheck,
} from "lucide-react";

interface AdminCustomersTableProps {
  customers: CustomerAccount[];
  /** Principal of the customer whose mutation is in flight. */
  pendingId?: string | null;
  onToggleBlocked: (account: CustomerAccount) => void;
  onSetMobileVerification: (
    account: CustomerAccount,
    state: MobileVerification,
  ) => void;
}

/** Dense table of every registered customer and advertiser account. */
export function AdminCustomersTable({
  customers,
  pendingId,
  onToggleBlocked,
  onSetMobileVerification,
}: AdminCustomersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-admin-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[14rem]">Customer</TableHead>
            <TableHead className="hidden md:table-cell">Contact</TableHead>
            <TableHead className="hidden lg:table-cell">Plan</TableHead>
            <TableHead className="hidden sm:table-cell">Verification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((account, index) => {
            const { customer, subscription } = account;
            const principal = customer.principal.toString();
            const isPending = pendingId === principal;
            const mobilePending =
              customer.mobileVerification === MobileVerification.pendingReview;

            return (
              <TableRow
                key={principal}
                data-ocid={`admin_customers.row.${index + 1}`}
                className="animate-fade-in"
              >
                <TableCell>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {customer.name || "Unnamed customer"}
                    </span>
                    <span className="truncate font-mono text-[0.7rem] text-muted-foreground">
                      {principal.slice(0, 12)}…
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Joined {formatDate(customer.createdAt)}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs text-foreground">
                      {customer.email || "No email"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {customer.phone || "No phone"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  {subscription ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">
                        {subscription.planName}
                      </span>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {subscriptionStatusLabel(subscription.status)} · until{" "}
                        {formatDate(subscription.expiresAt)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No plan
                    </span>
                  )}
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.7rem] text-muted-foreground">
                      Email:{" "}
                      {emailVerificationLabel(customer.emailVerification)}
                    </span>
                    <span
                      className={cn(
                        "text-[0.7rem]",
                        mobilePending
                          ? "font-medium text-warning-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      Mobile:{" "}
                      {mobileVerificationLabel(customer.mobileVerification)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    data-ocid={`admin_customers.status.${index + 1}`}
                    className={cn(
                      "rounded-full border-transparent px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em]",
                      customer.blocked
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/15 text-success",
                    )}
                  >
                    {customer.blocked ? "Blocked" : "Active"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          aria-label={`Actions for ${customer.name || "customer"}`}
                          data-ocid={`admin_customers.more_button.${index + 1}`}
                          className="rounded-md"
                        >
                          <MoreHorizontal
                            className="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          Mobile verification
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onSelect={() =>
                            onSetMobileVerification(
                              account,
                              MobileVerification.approved,
                            )
                          }
                          data-ocid={`admin_customers.approve_mobile_button.${index + 1}`}
                        >
                          <ShieldCheck className="size-4" aria-hidden="true" />
                          Approve mobile number
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            onSetMobileVerification(
                              account,
                              MobileVerification.rejected,
                            )
                          }
                          data-ocid={`admin_customers.reject_mobile_button.${index + 1}`}
                        >
                          <ShieldX className="size-4" aria-hidden="true" />
                          Reject mobile number
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => onToggleBlocked(account)}
                          variant={customer.blocked ? "default" : "destructive"}
                          data-ocid={`admin_customers.block_button.${index + 1}`}
                        >
                          {customer.blocked ? (
                            <>
                              <UserCheck
                                className="size-4"
                                aria-hidden="true"
                              />
                              Unblock account
                            </>
                          ) : (
                            <>
                              <Ban className="size-4" aria-hidden="true" />
                              Block account
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
