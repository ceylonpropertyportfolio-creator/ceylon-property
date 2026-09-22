import { createActor } from "@/backend";
import type { Plan, PlanId } from "@/backend";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { useQuery } from "@tanstack/react-query";

/** Query key root for every plan read. */
export const planKeys = {
  all: ["plans"] as const,
  list: () => [...planKeys.all, "list"] as const,
  detail: (id: PlanId) => [...planKeys.all, "detail", id.toString()] as const,
};

/** Every active plan, ordered by `sortOrder`. */
export function usePlans() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Plan[]>({
    queryKey: planKeys.list(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPlans();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** A single plan, or `null` when it does not exist. */
export function usePlan(id: PlanId | null) {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Plan | null>({
    queryKey: planKeys.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPlan(id);
    },
    enabled: isReady && id !== null,
  });
  return { ...query, isUnavailable };
}
