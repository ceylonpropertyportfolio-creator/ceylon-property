import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { AdminEnquiry } from "@/types/listing";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Mail,
  MailOpen,
  Phone,
  Reply,
  Trash2,
} from "lucide-react";

interface EnquiryDetailProps {
  item: AdminEnquiry;
  onToggleRead: (read: boolean) => void;
  onDelete: () => void;
  isTogglingRead: boolean;
  isDeleting: boolean;
  mutationError: string | null;
  onBack?: () => void;
  className?: string;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

/** The detail pane for a single enquiry, with read, reply and delete actions. */
export function EnquiryDetail({
  item,
  onToggleRead,
  onDelete,
  isTogglingRead,
  isDeleting,
  mutationError,
  onBack,
  className,
}: EnquiryDetailProps) {
  const { enquiry, listingTitle } = item;
  const unread = !enquiry.read;
  const mailtoHref = `mailto:${enquiry.email}?subject=${encodeURIComponent(
    `Re: your enquiry about ${listingTitle || "our listing"}`,
  )}`;

  return (
    <div data-ocid="enquiries.detail_panel" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-admin-border p-4 sm:p-6">
        <div className="min-w-0">
          {onBack ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              data-ocid="enquiries.back_button"
              className="-ml-2 mb-2 rounded-md lg:hidden"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to inbox
            </Button>
          ) : null}
          <div className="flex items-center gap-2">
            <h2 className="truncate font-display text-xl font-semibold text-foreground">
              {enquiry.name}
            </h2>
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
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Received {formatDateTime(enquiry.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isTogglingRead}
            onClick={() => onToggleRead(unread)}
            data-ocid="enquiries.toggle_read_button"
            className="rounded-md"
          >
            {unread ? (
              <>
                <MailOpen className="size-4" aria-hidden="true" />
                {isTogglingRead ? "Marking…" : "Mark as read"}
              </>
            ) : (
              <>
                <Mail className="size-4" aria-hidden="true" />
                {isTogglingRead ? "Marking…" : "Mark as unread"}
              </>
            )}
          </Button>

          <Button asChild variant="outline" size="sm" className="rounded-md">
            <a href={mailtoHref} data-ocid="enquiries.reply_button">
              <Reply className="size-4" aria-hidden="true" />
              Reply by email
            </a>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                data-ocid="enquiries.delete_button"
                className="rounded-md text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="enquiries.delete_dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
                <AlertDialogDescription>
                  The enquiry from {enquiry.name} will be permanently removed.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  data-ocid="enquiries.delete_cancel_button"
                  className="rounded-md"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="enquiries.delete_confirm_button"
                  onClick={onDelete}
                  className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete enquiry
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {mutationError ? (
        <div
          data-ocid="enquiries.mutation_error_state"
          role="alert"
          className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive sm:px-6"
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          <span>{mutationError}</span>
        </div>
      ) : null}

      <div className="space-y-6 p-4 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <a
              href={`mailto:${enquiry.email}`}
              data-ocid="enquiries.email_link"
              className="inline-flex items-center gap-1.5 break-all text-primary underline-offset-4 hover:underline"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              {enquiry.email}
            </a>
          </Field>
          <Field label="Phone">
            {enquiry.phone ? (
              <a
                href={`tel:${enquiry.phone}`}
                data-ocid="enquiries.phone_link"
                className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
              >
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                {enquiry.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">Not provided</span>
            )}
          </Field>
          <Field label="Related listing">
            <Link
              to="/admin/listings/$listingId/edit"
              params={{ listingId: enquiry.listingId.toString() }}
              data-ocid="enquiries.listing_link"
              className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
              {listingTitle || "Listing removed"}
            </Link>
          </Field>
          <Field label="Received">
            <span className="tabular">{formatDateTime(enquiry.createdAt)}</span>
          </Field>
        </dl>

        <div className="space-y-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Message
          </h3>
          <div
            data-ocid="enquiries.message"
            className="whitespace-pre-wrap break-words rounded-md border border-admin-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground"
          >
            {enquiry.message}
          </div>
        </div>
      </div>
    </div>
  );
}
