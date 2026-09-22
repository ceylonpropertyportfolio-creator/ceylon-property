import { CategoryManager } from "@/components/admin/CategoryManager";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-admin";
import { AlertTriangle } from "lucide-react";

function CategoriesSkeleton() {
  const ids = Array.from({ length: 4 }, (_, i) => `category-skeleton-${i}`);
  return (
    <div data-ocid="categories.loading_state" className="space-y-3">
      {ids.map((id) => (
        <div
          key={id}
          className="flex items-center gap-4 rounded-lg border border-admin-border bg-card p-4"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Manages the advertising categories that organise the public site. */
export function AdminCategoriesPage() {
  const { data, isLoading, isError, refetch } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = data ?? [];
  const isSaving = createCategory.isPending || updateCategory.isPending;
  const pendingId = deleteCategory.isPending
    ? (deleteCategory.variables ?? null)
    : null;

  return (
    <div
      data-ocid="admin_categories.page"
      className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6"
    >
      <header>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Portfolio
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
          Advertising categories
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The categories buyers and renters browse by on the public site.
        </p>
      </header>

      {deleteCategory.error ? (
        <div
          data-ocid="admin_categories.mutation_error"
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{deleteCategory.error.message}</span>
        </div>
      ) : null}

      <div className="mt-5">
        {isLoading ? (
          <CategoriesSkeleton />
        ) : isError ? (
          <ErrorState
            data-ocid="admin_categories.error_state"
            title="Could not load categories"
            description="We could not reach the category list. Please try again."
            onRetry={() => void refetch()}
          />
        ) : (
          <CategoryManager
            categories={categories}
            pendingId={pendingId}
            isSaving={isSaving}
            onCreate={async (input) => {
              await createCategory.mutateAsync(input);
            }}
            onUpdate={async (id, input) => {
              await updateCategory.mutateAsync({ id, input });
            }}
            onSetEnabled={(id, enabled) =>
              updateCategory.mutate({
                id,
                input: {
                  ...toInput(categories, id),
                  enabled,
                },
              })
            }
            onDelete={(id) => deleteCategory.mutate(id)}
          />
        )}
      </div>
    </div>
  );
}

/** Rebuilds a category's input payload so a single field can be toggled. */
function toInput(
  categories: {
    id: bigint;
    name: string;
    slug: string;
    description: string;
    sortOrder: bigint;
    enabled: boolean;
  }[],
  id: bigint,
) {
  const category = categories.find((item) => item.id === id);
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    sortOrder: category?.sortOrder ?? 0n,
    enabled: category?.enabled ?? true,
  };
}
