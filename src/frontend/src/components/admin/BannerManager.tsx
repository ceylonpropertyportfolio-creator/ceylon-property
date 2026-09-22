import { EmptyState } from "@/components/common/EmptyState";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isImageFilename, photoUrl } from "@/lib/photo";
import { cn } from "@/lib/utils";
import type { Banner, BannerInput, Photo } from "@/types/listing";
import { ExternalBlob } from "@caffeineai/object-storage";
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

/** The homepage supports at most this many banners. */
export const BANNER_LIMIT = 10;

interface BannerFormValues {
  title: string;
  subtitle: string;
  linkUrl: string;
  sortOrder: string;
  enabled: boolean;
}

const EMPTY_BANNER_FORM: BannerFormValues = {
  title: "",
  subtitle: "",
  linkUrl: "",
  sortOrder: "0",
  enabled: true,
};

function bannerToFormValues(banner: Banner): BannerFormValues {
  return {
    title: banner.title,
    subtitle: banner.subtitle,
    linkUrl: banner.linkUrl,
    sortOrder: banner.sortOrder.toString(),
    enabled: banner.enabled,
  };
}

interface BannerManagerProps {
  banners: Banner[];
  /** Id of the banner whose mutation is in flight. */
  pendingId?: bigint | null;
  onCreate: (input: BannerInput) => Promise<void>;
  onUpdate: (id: bigint, input: BannerInput) => Promise<void>;
  onSetEnabled: (id: bigint, enabled: boolean) => void;
  onReorder: (id: bigint, sortOrder: bigint) => void;
  onDelete: (id: bigint) => void;
  /** True while a create or update mutation is in flight. */
  isSaving: boolean;
}

/** Manages the homepage banner slider: create, edit, reorder, enable, delete. */
export function BannerManager({
  banners,
  pendingId,
  onCreate,
  onUpdate,
  onSetEnabled,
  onReorder,
  onDelete,
  isSaving,
}: BannerManagerProps) {
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [values, setValues] = useState<BannerFormValues>(EMPTY_BANNER_FORM);
  const [image, setImage] = useState<Photo | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDialogOpen = isCreating || editing !== null;
  const atLimit = banners.length >= BANNER_LIMIT;

  function openCreate() {
    setValues({ ...EMPTY_BANNER_FORM, sortOrder: String(banners.length) });
    setImage(undefined);
    setFormError(null);
    setEditing(null);
    setIsCreating(true);
  }

  function openEdit(banner: Banner) {
    setValues(bannerToFormValues(banner));
    setImage(banner.image);
    setFormError(null);
    setIsCreating(false);
    setEditing(banner);
  }

  function closeDialog() {
    if (isSaving) return;
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  }

  function set<K extends keyof BannerFormValues>(
    key: K,
    value: BannerFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleImageFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (!isImageFilename(file.name)) {
      setFormError("Choose an image file for the banner.");
      return;
    }
    setFormError(null);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes, file.type, file.name);
    setImage({ blob: blob as unknown as Uint8Array, filename: file.name });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!values.title.trim()) {
      setFormError("Give the banner a title.");
      return;
    }
    const input: BannerInput = {
      title: values.title.trim(),
      subtitle: values.subtitle.trim(),
      linkUrl: values.linkUrl.trim(),
      sortOrder: BigInt(values.sortOrder || "0"),
      enabled: values.enabled,
      image,
    };
    try {
      if (editing) {
        await onUpdate(editing.id, input);
      } else {
        await onCreate(input);
      }
      closeDialog();
    } catch {
      setFormError("We could not save this banner. Please try again.");
    }
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {banners.length} of {BANNER_LIMIT} banners used
        </p>
        <Button
          type="button"
          onClick={openCreate}
          disabled={atLimit}
          data-ocid="banners.new_banner_button"
          className="rounded-md"
        >
          <Plus className="size-4" aria-hidden="true" />
          New banner
        </Button>
      </div>

      {atLimit ? (
        <p
          data-ocid="banners.limit_notice"
          className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2.5 text-xs text-warning-foreground"
        >
          The homepage supports up to {BANNER_LIMIT} banners. Delete one to add
          another.
        </p>
      ) : null}

      {banners.length === 0 ? (
        <EmptyState
          data-ocid="banners.empty_state"
          icon={ImageIcon}
          title="No banners yet"
          description="Add a banner to feature promotions and seasonal highlights on the homepage slider."
          action={
            <Button
              type="button"
              onClick={openCreate}
              data-ocid="banners.empty_new_banner_button"
              className="rounded-md"
            >
              <Plus className="size-4" aria-hidden="true" />
              New banner
            </Button>
          }
        />
      ) : (
        <ul data-ocid="banners.list" className="space-y-3">
          {banners.map((banner, index) => {
            const url = banner.image ? photoUrl(banner.image) : null;
            const isPending = pendingId === banner.id;
            return (
              <li
                key={banner.id.toString()}
                data-ocid={`banners.item.${index + 1}`}
                className={cn(
                  "flex flex-col gap-4 rounded-lg border border-admin-border bg-card p-4 sm:flex-row sm:items-center",
                  !banner.enabled && "opacity-70",
                )}
              >
                <span className="flex h-20 w-full shrink-0 items-center justify-center overflow-hidden rounded-md border border-admin-border bg-muted sm:w-32">
                  {url ? (
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {banner.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[0.6rem] text-muted-foreground">
                      #{banner.sortOrder.toString()}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {banner.subtitle || "No subtitle"}
                  </p>
                  {banner.linkUrl ? (
                    <p className="truncate text-[0.7rem] text-muted-foreground">
                      Links to {banner.linkUrl}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.enabled}
                      disabled={isPending}
                      onCheckedChange={(checked) =>
                        onSetEnabled(banner.id, checked)
                      }
                      aria-label={`${banner.enabled ? "Disable" : "Enable"} ${banner.title}`}
                      data-ocid={`banners.enabled_switch.${index + 1}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {banner.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={
                      isPending || index === 0 || banner.sortOrder <= 0n
                    }
                    onClick={() => onReorder(banner.id, banner.sortOrder - 1n)}
                    aria-label={`Move ${banner.title} up`}
                    data-ocid={`banners.move_up_button.${index + 1}`}
                    className="rounded-md"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending || index === banners.length - 1}
                    onClick={() => onReorder(banner.id, banner.sortOrder + 1n)}
                    aria-label={`Move ${banner.title} down`}
                    data-ocid={`banners.move_down_button.${index + 1}`}
                    className="rounded-md"
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => openEdit(banner)}
                    aria-label={`Edit ${banner.title}`}
                    data-ocid={`banners.edit_button.${index + 1}`}
                    className="rounded-md"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => setPendingDelete(banner)}
                    aria-label={`Delete ${banner.title}`}
                    data-ocid={`banners.delete_button.${index + 1}`}
                    className="rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent
          data-ocid="banners.form_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit banner" : "New banner"}
            </DialogTitle>
            <DialogDescription>
              Banners appear in the homepage slider in display order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="banner-title" className="text-xs font-medium">
                Title
              </Label>
              <Input
                id="banner-title"
                data-ocid="banners.title_input"
                value={values.title}
                placeholder="Monsoon sale on coastal villas"
                onChange={(event) => set("title", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="banner-subtitle" className="text-xs font-medium">
                Subtitle
              </Label>
              <Textarea
                id="banner-subtitle"
                data-ocid="banners.subtitle_textarea"
                rows={2}
                value={values.subtitle}
                placeholder="Handpicked homes along the southern coast"
                onChange={(event) => set("subtitle", event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="banner-link" className="text-xs font-medium">
                  Link URL
                </Label>
                <Input
                  id="banner-link"
                  data-ocid="banners.link_input"
                  value={values.linkUrl}
                  placeholder="/listings?type=rent"
                  onChange={(event) => set("linkUrl", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="banner-sort" className="text-xs font-medium">
                  Display order
                </Label>
                <Input
                  id="banner-sort"
                  data-ocid="banners.sort_input"
                  inputMode="numeric"
                  value={values.sortOrder}
                  onChange={(event) =>
                    set("sortOrder", event.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Banner image</Label>
              <div className="flex items-center gap-3">
                <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-admin-border bg-muted">
                  {image && photoUrl(image) ? (
                    <img
                      src={photoUrl(image) ?? ""}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  className="sr-only"
                  data-ocid="banners.image_input"
                  onChange={(event) => {
                    void handleImageFile(event.target.files);
                    event.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="banners.upload_button"
                  className="rounded-md"
                >
                  <ImagePlus className="size-4" aria-hidden="true" />
                  {image ? "Replace image" : "Choose image"}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-admin-border bg-muted/30 px-3 py-2.5">
              <Checkbox
                id="banner-enabled"
                checked={values.enabled}
                onCheckedChange={(checked) => set("enabled", checked === true)}
                data-ocid="banners.enabled_checkbox"
              />
              <div>
                <Label htmlFor="banner-enabled" className="text-sm font-medium">
                  Enabled
                </Label>
                <p className="text-xs text-muted-foreground">
                  Disabled banners stay saved but are hidden from the homepage.
                </p>
              </div>
            </div>

            {formError ? (
              <p
                data-ocid="banners.form_error"
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isSaving}
                data-ocid="banners.cancel_button"
                className="rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                data-ocid="banners.submit_button"
                className="rounded-md"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                {isSaving
                  ? "Saving…"
                  : editing
                    ? "Save banner"
                    : "Create banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent data-ocid="banners.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this banner?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.title}” will be removed from the homepage slider. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="banners.delete_cancel_button"
              className="rounded-md"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
              data-ocid="banners.delete_confirm_button"
              className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
