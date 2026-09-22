import { AdminPlansTable } from "@/components/admin/AdminPlansTable";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminPlans,
  useCreatePlan,
  useDeletePlan,
  useUpdatePlan,
} from "@/hooks/use-admin";
import { formatCount } from "@/lib/format";
import type { Plan, PlanInput } from "@/types/listing";
import { AlertTriangle, Loader2, Package, Plus, Save } from "lucide-react";
import { type FormEvent, useState } from "react";

/** The editable shape of a plan, with numeric fields as strings. */
interface PlanFormValues {
  name: string;
  price: string;
  billingPeriod: string;
  listingAllowance: string;
  imageAllowance: string;
  features: string;
  sortOrder: string;
  active: boolean;
}

const EMPTY_PLAN_FORM: PlanFormValues = {
  name: "",
  price: "",
  billingPeriod: "Monthly",
  listingAllowance: "",
  imageAllowance: "",
  features: "",
  sortOrder: "0",
  active: true,
};

function planToFormValues(plan: Plan): PlanFormValues {
  return {
    name: plan.name,
    price: plan.price.toString(),
    billingPeriod: plan.billingPeriod,
    listingAllowance: plan.listingAllowance?.toString() ?? "",
    imageAllowance: plan.imageAllowance?.toString() ?? "",
    features: plan.features.join("\n"),
    sortOrder: plan.sortOrder.toString(),
    active: plan.active,
  };
}

/** Parses an optional whole-number allowance; blank means unlimited. */
function parseAllowance(value: string): bigint | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return BigInt(Math.floor(parsed));
}

function toPlanInput(values: PlanFormValues): PlanInput {
  return {
    name: values.name.trim(),
    price: BigInt(values.price || "0"),
    billingPeriod: values.billingPeriod.trim() || "Monthly",
    listingAllowance: parseAllowance(values.listingAllowance),
    imageAllowance: parseAllowance(values.imageAllowance),
    features: values.features
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    sortOrder: BigInt(values.sortOrder || "0"),
    active: values.active,
  };
}

function PlansSkeleton() {
  const ids = Array.from({ length: 4 }, (_, i) => `plan-skeleton-${i}`);
  return (
    <div
      data-ocid="admin_plans.loading_state"
      className="space-y-2 rounded-lg border border-admin-border bg-card p-4"
    >
      {ids.map((id) => (
        <div key={id} className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Management surface for advertising plans and their allowances. */
export function AdminPlansPage() {
  const { data, isLoading, isError, refetch } = useAdminPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [editing, setEditing] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [values, setValues] = useState<PlanFormValues>(EMPTY_PLAN_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Plan | null>(null);

  const plans = data ?? [];
  const isDialogOpen = isCreating || editing !== null;
  const isSaving = createPlan.isPending || updatePlan.isPending;

  function openCreate() {
    setValues(EMPTY_PLAN_FORM);
    setFormError(null);
    setEditing(null);
    setIsCreating(true);
  }

  function openEdit(plan: Plan) {
    setValues(planToFormValues(plan));
    setFormError(null);
    setIsCreating(false);
    setEditing(plan);
  }

  function closeDialog() {
    if (isSaving) return;
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  }

  function set<K extends keyof PlanFormValues>(
    key: K,
    value: PlanFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!values.name.trim()) {
      setFormError("Give the plan a name.");
      return;
    }
    if (!values.price.trim() || Number(values.price) <= 0) {
      setFormError("Enter a monthly price greater than zero.");
      return;
    }
    const input = toPlanInput(values);
    if (editing) {
      updatePlan.mutate(
        { id: editing.id, input },
        {
          onSuccess: () => closeDialog(),
          onError: () => setFormError("We could not save this plan."),
        },
      );
      return;
    }
    createPlan.mutate(input, {
      onSuccess: () => closeDialog(),
      onError: () => setFormError("We could not create this plan."),
    });
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deletePlan.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  }

  return (
    <div
      data-ocid="admin_plans.page"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Accounts
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            Plans &amp; pricing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCount(BigInt(plans.length))} plans · monthly billing only
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          data-ocid="admin_plans.new_plan_button"
          className="rounded-md"
        >
          <Plus className="size-4" aria-hidden="true" />
          New plan
        </Button>
      </header>

      {deletePlan.error ? (
        <div
          data-ocid="admin_plans.mutation_error"
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{deletePlan.error.message}</span>
        </div>
      ) : null}

      <div className="mt-4">
        {isLoading ? (
          <PlansSkeleton />
        ) : isError ? (
          <ErrorState
            data-ocid="admin_plans.error_state"
            title="Could not load plans"
            description="We could not reach the plan catalogue. Please try again."
            onRetry={() => void refetch()}
          />
        ) : plans.length === 0 ? (
          <EmptyState
            data-ocid="admin_plans.empty_state"
            icon={Package}
            title="No plans yet"
            description="Create the first advertising plan so customers can subscribe and publish listings."
            action={
              <Button
                type="button"
                onClick={openCreate}
                data-ocid="admin_plans.empty_new_plan_button"
                className="rounded-md"
              >
                <Plus className="size-4" aria-hidden="true" />
                New plan
              </Button>
            }
          />
        ) : (
          <AdminPlansTable
            plans={plans}
            pendingId={deletePlan.isPending ? pendingDelete?.id : null}
            onEdit={openEdit}
            onDelete={setPendingDelete}
          />
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent
          data-ocid="admin_plans.form_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit plan" : "New plan"}
            </DialogTitle>
            <DialogDescription>
              Monthly billing only. Leave an allowance blank for unlimited.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="plan-name" className="text-xs font-medium">
                Plan name
              </Label>
              <Input
                id="plan-name"
                data-ocid="admin_plans.name_input"
                value={values.name}
                placeholder="Agent"
                onChange={(event) => set("name", event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="plan-price" className="text-xs font-medium">
                  Monthly price (Rs.)
                </Label>
                <Input
                  id="plan-price"
                  data-ocid="admin_plans.price_input"
                  inputMode="numeric"
                  value={values.price}
                  placeholder="3990"
                  onChange={(event) =>
                    set("price", event.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-sort" className="text-xs font-medium">
                  Display order
                </Label>
                <Input
                  id="plan-sort"
                  data-ocid="admin_plans.sort_input"
                  inputMode="numeric"
                  value={values.sortOrder}
                  onChange={(event) =>
                    set("sortOrder", event.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="plan-listing-allowance"
                  className="text-xs font-medium"
                >
                  Listing allowance
                </Label>
                <Input
                  id="plan-listing-allowance"
                  data-ocid="admin_plans.listing_allowance_input"
                  inputMode="numeric"
                  value={values.listingAllowance}
                  placeholder="Unlimited"
                  onChange={(event) =>
                    set(
                      "listingAllowance",
                      event.target.value.replace(/[^\d]/g, ""),
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="plan-image-allowance"
                  className="text-xs font-medium"
                >
                  Image allowance
                </Label>
                <Input
                  id="plan-image-allowance"
                  data-ocid="admin_plans.image_allowance_input"
                  inputMode="numeric"
                  value={values.imageAllowance}
                  placeholder="Unlimited"
                  onChange={(event) =>
                    set(
                      "imageAllowance",
                      event.target.value.replace(/[^\d]/g, ""),
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan-features" className="text-xs font-medium">
                Features (one per line)
              </Label>
              <Textarea
                id="plan-features"
                data-ocid="admin_plans.features_textarea"
                rows={4}
                value={values.features}
                placeholder={
                  "15 property listings\n15 photos per listing\nPriority support"
                }
                onChange={(event) => set("features", event.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 rounded-md border border-admin-border bg-muted/30 px-3 py-2.5">
              <Checkbox
                id="plan-active"
                checked={values.active}
                onCheckedChange={(checked) => set("active", checked === true)}
                data-ocid="admin_plans.active_checkbox"
              />
              <div>
                <Label htmlFor="plan-active" className="text-sm font-medium">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactive plans are hidden from the public pricing page.
                </p>
              </div>
            </div>

            {formError ? (
              <p
                data-ocid="admin_plans.form_error"
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
                data-ocid="admin_plans.cancel_button"
                className="rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                data-ocid="admin_plans.submit_button"
                className="rounded-md"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                {isSaving ? "Saving…" : editing ? "Save plan" : "Create plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletePlan.isPending) setPendingDelete(null);
        }}
      >
        <AlertDialogContent data-ocid="admin_plans.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this plan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.name}” will be removed from the pricing page. Existing subscriptions keep their terms until they expire.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletePlan.isPending}
              data-ocid="admin_plans.delete_cancel_button"
              className="rounded-md"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePlan.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
              data-ocid="admin_plans.delete_confirm_button"
              className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlan.isPending ? "Deleting…" : "Delete plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
