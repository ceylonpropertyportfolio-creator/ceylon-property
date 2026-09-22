import { BannerManager } from "@/components/admin/BannerManager";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminBanners,
  useCreateBanner,
  useDeleteBanner,
  useReorderBanner,
  useSetBannerEnabled,
  useUpdateBanner,
} from "@/hooks/use-admin";
import { AlertTriangle } from "lucide-react";

function BannersSkeleton() {
  const ids = Array.from({ length: 3 }, (_, i) => `banner-skeleton-${i}`);
  return (
    <div data-ocid="banners.loading_state" className="space-y-3">
      {ids.map((id) => (
        <div
          key={id}
          className="flex items-center gap-4 rounded-lg border border-admin-border bg-card p-4"
        >
          <Skeleton className="h-20 w-32 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Manages the homepage banner slider, capped at ten banners. */
export function AdminBannersPage() {
  const { data, isLoading, isError, refetch } = useAdminBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const setEnabled = useSetBannerEnabled();
  const reorderBanner = useReorderBanner();
  const deleteBanner = useDeleteBanner();

  const banners = data ?? [];
  const isSaving = createBanner.isPending || updateBanner.isPending;
  const pendingId = setEnabled.isPending
    ? (setEnabled.variables?.id ?? null)
    : reorderBanner.isPending
      ? (reorderBanner.variables?.id ?? null)
      : deleteBanner.isPending
        ? (deleteBanner.variables ?? null)
        : null;

  const mutationError =
    setEnabled.error ?? reorderBanner.error ?? deleteBanner.error;

  return (
    <div
      data-ocid="admin_banners.page"
      className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6"
    >
      <header>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Site content
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
          Homepage banners
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Feature promotions and seasonal highlights in the homepage slider.
        </p>
      </header>

      {mutationError ? (
        <div
          data-ocid="admin_banners.mutation_error"
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{mutationError.message}</span>
        </div>
      ) : null}

      <div className="mt-5">
        {isLoading ? (
          <BannersSkeleton />
        ) : isError ? (
          <ErrorState
            data-ocid="admin_banners.error_state"
            title="Could not load banners"
            description="We could not reach the homepage content. Please try again."
            onRetry={() => void refetch()}
          />
        ) : (
          <BannerManager
            banners={banners}
            pendingId={pendingId}
            isSaving={isSaving}
            onCreate={async (input) => {
              await createBanner.mutateAsync(input);
            }}
            onUpdate={async (id, input) => {
              await updateBanner.mutateAsync({ id, input });
            }}
            onSetEnabled={(id, enabled) => setEnabled.mutate({ id, enabled })}
            onReorder={(id, sortOrder) =>
              reorderBanner.mutate({ id, sortOrder })
            }
            onDelete={(id) => deleteBanner.mutate(id)}
          />
        )}
      </div>
    </div>
  );
}
