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
import { cn } from "@/lib/utils";
import type { Category, CategoryInput } from "@/types/listing";
import { FolderTree, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  enabled: boolean;
}

const EMPTY_CATEGORY_FORM: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
  enabled: true,
};

/** Derives a URL-safe slug from a category name. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryToFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder.toString(),
    enabled: category.enabled,
  };
}

interface CategoryManagerProps {
  categories: Category[];
  /** Id of the category whose mutation is in flight. */
  pendingId?: bigint | null;
  onCreate: (input: CategoryInput) => Promise<void>;
  onUpdate: (id: bigint, input: CategoryInput) => Promise<void>;
  onSetEnabled: (id: bigint, enabled: boolean) => void;
  onDelete: (id: bigint) => void;
  /** True while a create or update mutation is in flight. */
  isSaving: boolean;
}

/** Manages the advertising categories shown across the public site. */
export function CategoryManager({
  categories,
  pendingId,
  onCreate,
  onUpdate,
  onSetEnabled,
  onDelete,
  isSaving,
}: CategoryManagerProps) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [values, setValues] = useState<CategoryFormValues>(EMPTY_CATEGORY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const isDialogOpen = isCreating || editing !== null;

  function openCreate() {
    setValues({ ...EMPTY_CATEGORY_FORM, sortOrder: String(categories.length) });
    setFormError(null);
    setEditing(null);
    setIsCreating(true);
  }

  function openEdit(category: Category) {
    setValues(categoryToFormValues(category));
    setFormError(null);
    setIsCreating(false);
    setEditing(category);
  }

  function closeDialog() {
    if (isSaving) return;
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  }

  function set<K extends keyof CategoryFormValues>(
    key: K,
    value: CategoryFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!values.name.trim()) {
      setFormError("Give the category a name.");
      return;
    }
    const input: CategoryInput = {
      name: values.name.trim(),
      slug: values.slug.trim() || slugify(values.name),
      description: values.description.trim(),
      sortOrder: BigInt(values.sortOrder || "0"),
      enabled: values.enabled,
    };
    try {
      if (editing) {
        await onUpdate(editing.id, input);
      } else {
        await onCreate(input);
      }
      closeDialog();
    } catch {
      setFormError("We could not save this category. Please try again.");
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
          {categories.length} categories
        </p>
        <Button
          type="button"
          onClick={openCreate}
          data-ocid="categories.new_category_button"
          className="rounded-md"
        >
          <Plus className="size-4" aria-hidden="true" />
          New category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          data-ocid="categories.empty_state"
          icon={FolderTree}
          title="No categories yet"
          description="Create the advertising categories that organise listings across the public site."
          action={
            <Button
              type="button"
              onClick={openCreate}
              data-ocid="categories.empty_new_category_button"
              className="rounded-md"
            >
              <Plus className="size-4" aria-hidden="true" />
              New category
            </Button>
          }
        />
      ) : (
        <ul data-ocid="categories.list" className="space-y-3">
          {categories.map((category, index) => {
            const isPending = pendingId === category.id;
            return (
              <li
                key={category.id.toString()}
                data-ocid={`categories.item.${index + 1}`}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border border-admin-border bg-card p-4 sm:flex-row sm:items-center",
                  !category.enabled && "opacity-70",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[0.6rem] text-muted-foreground">
                      /{category.slug}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[0.6rem] text-muted-foreground">
                      #{category.sortOrder.toString()}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {category.description || "No description"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.enabled}
                      disabled={isPending}
                      onCheckedChange={(checked) =>
                        onSetEnabled(category.id, checked)
                      }
                      aria-label={`${category.enabled ? "Disable" : "Enable"} ${category.name}`}
                      data-ocid={`categories.enabled_switch.${index + 1}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {category.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => openEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    data-ocid={`categories.edit_button.${index + 1}`}
                    className="rounded-md"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => setPendingDelete(category)}
                    aria-label={`Delete ${category.name}`}
                    data-ocid={`categories.delete_button.${index + 1}`}
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
          data-ocid="categories.form_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription>
              Categories organise listings on the browse page and homepage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-name" className="text-xs font-medium">
                Name
              </Label>
              <Input
                id="category-name"
                data-ocid="categories.name_input"
                value={values.name}
                placeholder="Holiday Rentals"
                onChange={(event) => {
                  const name = event.target.value;
                  setValues((current) => ({
                    ...current,
                    name,
                    slug: editing ? current.slug : slugify(name),
                  }));
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category-slug" className="text-xs font-medium">
                  Slug
                </Label>
                <Input
                  id="category-slug"
                  data-ocid="categories.slug_input"
                  value={values.slug}
                  placeholder="holiday-rentals"
                  onChange={(event) => set("slug", slugify(event.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category-sort" className="text-xs font-medium">
                  Display order
                </Label>
                <Input
                  id="category-sort"
                  data-ocid="categories.sort_input"
                  inputMode="numeric"
                  value={values.sortOrder}
                  onChange={(event) =>
                    set("sortOrder", event.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="category-description"
                className="text-xs font-medium"
              >
                Description
              </Label>
              <Textarea
                id="category-description"
                data-ocid="categories.description_textarea"
                rows={3}
                value={values.description}
                placeholder="Short-stay homes near the coast and hills"
                onChange={(event) => set("description", event.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 rounded-md border border-admin-border bg-muted/30 px-3 py-2.5">
              <Checkbox
                id="category-enabled"
                checked={values.enabled}
                onCheckedChange={(checked) => set("enabled", checked === true)}
                data-ocid="categories.enabled_checkbox"
              />
              <div>
                <Label
                  htmlFor="category-enabled"
                  className="text-sm font-medium"
                >
                  Enabled
                </Label>
                <p className="text-xs text-muted-foreground">
                  Disabled categories are hidden from the public site.
                </p>
              </div>
            </div>

            {formError ? (
              <p
                data-ocid="categories.form_error"
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
                data-ocid="categories.cancel_button"
                className="rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                data-ocid="categories.submit_button"
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
                    ? "Save category"
                    : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent data-ocid="categories.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this category?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.name}” will be removed from the public site. Listings already assigned to it keep their property type.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="categories.delete_cancel_button"
              className="rounded-md"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
              data-ocid="categories.delete_confirm_button"
              className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
