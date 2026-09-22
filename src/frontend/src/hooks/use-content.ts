import { createActor } from "@/backend";
import type { Banner, Category, ChatbotEntry } from "@/backend";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { useQuery } from "@tanstack/react-query";

/** Query key root for every public content read. */
export const contentKeys = {
  all: ["content"] as const,
  banners: () => [...contentKeys.all, "banners"] as const,
  categories: () => [...contentKeys.all, "categories"] as const,
  chatbot: () => [...contentKeys.all, "chatbot"] as const,
};

/** The enabled homepage banners, ordered by `sortOrder`. */
export function useBanners() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Banner[]>({
    queryKey: contentKeys.banners(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBanners();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** The enabled advertising categories, ordered by `sortOrder`. */
export function useCategories() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<Category[]>({
    queryKey: contentKeys.categories(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}

/** The enabled help chatbot entries, ordered by `sortOrder`. */
export function useChatbotEntries() {
  const { actor, isReady, isUnavailable } = useBackendStatus(createActor);
  const query = useQuery<ChatbotEntry[]>({
    queryKey: contentKeys.chatbot(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChatbotEntries();
    },
    enabled: isReady,
  });
  return { ...query, isUnavailable };
}
