import { ChatbotManager } from "@/components/admin/ChatbotManager";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminChatbotEntries,
  useCreateChatbotEntry,
  useDeleteChatbotEntry,
  useUpdateChatbotEntry,
} from "@/hooks/use-admin";
import { AlertTriangle } from "lucide-react";

function ChatbotSkeleton() {
  const ids = Array.from({ length: 4 }, (_, i) => `chatbot-skeleton-${i}`);
  return (
    <div data-ocid="chatbot.loading_state" className="space-y-3">
      {ids.map((id) => (
        <div
          key={id}
          className="space-y-2 rounded-lg border border-admin-border bg-card p-4"
        >
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** Manages the help chatbot's question-and-answer content. */
export function AdminChatbotPage() {
  const { data, isLoading, isError, refetch } = useAdminChatbotEntries();
  const createEntry = useCreateChatbotEntry();
  const updateEntry = useUpdateChatbotEntry();
  const deleteEntry = useDeleteChatbotEntry();

  const entries = data ?? [];
  const isSaving = createEntry.isPending || updateEntry.isPending;
  const pendingId = deleteEntry.isPending
    ? (deleteEntry.variables ?? null)
    : null;

  return (
    <div
      data-ocid="admin_chatbot.page"
      className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6"
    >
      <header>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Site content
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
          Help content
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The questions and answers the public help assistant draws on.
        </p>
      </header>

      {deleteEntry.error ? (
        <div
          data-ocid="admin_chatbot.mutation_error"
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{deleteEntry.error.message}</span>
        </div>
      ) : null}

      <div className="mt-5">
        {isLoading ? (
          <ChatbotSkeleton />
        ) : isError ? (
          <ErrorState
            data-ocid="admin_chatbot.error_state"
            title="Could not load help content"
            description="We could not reach the help content. Please try again."
            onRetry={() => void refetch()}
          />
        ) : (
          <ChatbotManager
            entries={entries}
            pendingId={pendingId}
            isSaving={isSaving}
            onCreate={async (input) => {
              await createEntry.mutateAsync(input);
            }}
            onUpdate={async (id, input) => {
              await updateEntry.mutateAsync({ id, input });
            }}
            onSetEnabled={(id, enabled) => {
              const entry = entries.find((item) => item.id === id);
              if (!entry) return;
              updateEntry.mutate({
                id,
                input: {
                  question: entry.question,
                  answer: entry.answer,
                  keywords: entry.keywords,
                  sortOrder: entry.sortOrder,
                  enabled,
                },
              });
            }}
            onDelete={(id) => deleteEntry.mutate(id)}
          />
        )}
      </div>
    </div>
  );
}
