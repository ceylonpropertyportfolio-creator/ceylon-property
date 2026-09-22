import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { formatCount, formatPrice, formatShortLocation } from "@/lib/format";
import { photoUrl } from "@/lib/photo";
import { cn } from "@/lib/utils";
import type { AdminListingSummary } from "@/types/listing";
import { Link } from "@tanstack/react-router";
import {
  Ban,
  Eye,
  EyeOff,
  ImageOff,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

interface AdminListingsTableProps {
  listings: AdminListingSummary[];
  /** Id of the listing whose status toggle is in flight. */
  pendingId?: bigint | null;
  onTogglePublished: (listing: AdminListingSummary) => void;
  onToggleFeatured: (listing: AdminListingSummary) => void;
  onToggleBlocked: (listing: AdminListingSummary) => void;
  onDelete: (listing: AdminListingSummary) => void;
}

/** Dense management table of every listing in the portfolio. */
export function AdminListingsTable({
  listings,
  pendingId,
  onTogglePublished,
  onToggleFeatured,
  onToggleBlocked,
  onDelete,
}: AdminListingsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-admin-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40%] min-w-[16rem]">Listing</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="hidden text-center sm:table-cell">
              Enquiries
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((summary, index) => {
            const { listing, enquiryCount } = summary;
            const thumbnail = listing.photos[0]
              ? photoUrl(listing.photos[0])
              : null;
            const isPending = pendingId === listing.id;

            return (
              <TableRow
                key={listing.id.toString()}
                data-ocid={`admin_listings.row.${index + 1}`}
                className="animate-fade-in"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-admin-border bg-muted">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageOff
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {listing.title}
                        </span>
                        {listing.featured ? (
                          <Star
                            className="size-3.5 shrink-0 fill-accent text-accent"
                            aria-label="Featured"
                          />
                        ) : null}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {formatShortLocation(listing.city, listing.region) ||
                          "Location not set"}
                      </span>
                    </span>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {listing.listingType === "sale" ? "For sale" : "For rent"}
                  </span>
                </TableCell>

                <TableCell className="tabular text-right text-sm font-medium text-foreground">
                  {formatPrice(listing.price, listing.currency)}
                </TableCell>

                <TableCell className="tabular hidden text-center text-sm text-muted-foreground sm:table-cell">
                  {formatCount(enquiryCount)}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      data-ocid={`admin_listings.status.${index + 1}`}
                      className={cn(
                        "rounded-full border-transparent px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em]",
                        listing.published
                          ? "bg-success/15 text-success"
                          : "bg-warning/20 text-warning-foreground",
                      )}
                    >
                      {listing.published ? "Published" : "Unpublished"}
                    </Badge>
                    {listing.blocked ? (
                      <Badge
                        variant="outline"
                        data-ocid={`admin_listings.blocked_badge.${index + 1}`}
                        className="rounded-full border-transparent bg-destructive/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-destructive"
                      >
                        Blocked
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => onTogglePublished(summary)}
                      data-ocid={`admin_listings.toggle.${index + 1}`}
                      className="rounded-md text-xs"
                    >
                      {listing.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="rounded-md"
                    >
                      <Link
                        to="/admin/listings/$listingId/edit"
                        params={{ listingId: listing.id.toString() }}
                        aria-label={`Edit ${listing.title}`}
                        data-ocid={`admin_listings.edit_button.${index + 1}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          aria-label={`More actions for ${listing.title}`}
                          data-ocid={`admin_listings.more_button.${index + 1}`}
                          className="rounded-md"
                        >
                          <MoreHorizontal
                            className="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onSelect={() => onToggleFeatured(summary)}
                          data-ocid={`admin_listings.feature_button.${index + 1}`}
                        >
                          <Star className="size-4" aria-hidden="true" />
                          {listing.featured ? "Unfeature" : "Feature"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onToggleBlocked(summary)}
                          data-ocid={`admin_listings.block_button.${index + 1}`}
                        >
                          {listing.blocked ? (
                            <>
                              <Eye className="size-4" aria-hidden="true" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Ban className="size-4" aria-hidden="true" />
                              Block
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => onTogglePublished(summary)}
                          data-ocid={`admin_listings.menu_publish_button.${index + 1}`}
                        >
                          {listing.published ? (
                            <>
                              <EyeOff className="size-4" aria-hidden="true" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="size-4" aria-hidden="true" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => onDelete(summary)}
                          data-ocid={`admin_listings.delete_button.${index + 1}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete
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
