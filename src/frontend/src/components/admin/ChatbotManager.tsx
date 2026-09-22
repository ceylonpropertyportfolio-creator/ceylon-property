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
import type { ChatbotEntry, ChatbotEntryInput } from "@/types/listing";
import {
  Loader2,
  MessageCircleQuestion,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { type FormEvent, useState } from "react";

interface ChatbotFormValues {
  question: string;
  answer: string;
  keywords: string;
  sortOrder: string;
  enabled: boolean;
}

const EMPTY_CHATBOT_FORM: ChatbotFormValues = {
  question: "",
  answer: "",
  keywords: "",
  sortOrder: "0",
  enabled: true,
};

function entryToFormValues(entry: ChatbotEntry): ChatbotFormValues {
  return {
    question: entry.question,
    answer: entry.answer,
    keywords: entry.keywords.join(", "),
    sortOrder: entry.sortOrder.toString(),
    enabled: entry.enabled,
  };
}

interface ChatbotManagerProps {
  entries: ChatbotEntry[];
  /** Id of the entry whose mutation is in flight. */
  pendingId?: bigint | null;
  onCreate: (input: ChatbotEntryInput) => Promise<void>;
  onUpdate: (id: bigint, input: ChatbotEntryInput) => Promise<void>;
  onSetEnabled: (id: bigint, enabled: boolean) => void;
  onDelete: (id: bigint) => void;
  /** True while a create or update mutation is in flight. */
  isSaving: boolean;
}

/** Manages the help chatbot's question-and-answer content. */
export function ChatbotManager({
  entries,
  pendingId,
  onCreate,
  onUpdate,
  onSetEnabled,
  onDelete,
  isSaving,
}: ChatbotManagerProps) {
  const [editing, setEditing] = useState<ChatbotEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [values, setValues] = useState<ChatbotFormValues>(EMPTY_CHATBOT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ChatbotEntry | null>(null);

  const isDialogOpen = isCreating || editing !== null;

  function openCreate() {
    setValues({ ...EMPTY_CHATBOT_FORM, sortOrder: String(entries.length) });
    setFormError(null);
    setEditing(null);
    setIsCreating(true);
  }

  function openEdit(entry: ChatbotEntry) {
    setValues(entryToFormValues(entry));
    setFormError(null);
    setIsCreating(false);
    setEditing(entry);
  }

  function closeDialog() {
    if (isSaving) return;
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  }

  function set<K extends keyof ChatbotFormValues>(
    key: K,
    value: ChatbotFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!values.question.trim()) {
      setFormError("Enter the question the chatbot should answer.");
      return;
    }
    if (!values.answer.trim()) {
      setFormError("Enter the answer the chatbot should give.");
      return;
    }
    const input: ChatbotEntryInput = {
      question: values.question.trim(),
      answer: values.answer.trim(),
      keywords: values.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
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
      setFormError("We could not save this help entry. Please try again.");
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
          {entries.length} help entries
        </p>
        <Button
          type="button"
          onClick={openCreate}
          data-ocid="chatbot.new_entry_button"
          className="rounded-md"
        >
          <Plus className="size-4" aria-hidden="true" />
          New entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          data-ocid="chatbot.empty_state"
          icon={MessageCircleQuestion}
          title="No help content yet"
          description="Add the questions visitors ask most so the help assistant can answer them instantly."
          action={
            <Button
              type="button"
              onClick={openCreate}
              data-ocid="chatbot.empty_new_entry_button"
              className="rounded-md"
            >
              <Plus className="size-4" aria-hidden="true" />
              New entry
            </Button>
          }
        />
      ) : (
        <ul data-ocid="chatbot.list" className="space-y-3">
          {entries.map((entry, index) => {
            const isPending = pendingId === entry.id;
            return (
              <li
                key={entry.id.toString()}
                data-ocid={`chatbot.item.${index + 1}`}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border border-admin-border bg-card p-4 sm:flex-row sm:items-start",
                  !entry.enabled && "opacity-70",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {entry.question}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[0.6rem] text-muted-foreground">
                      #{entry.sortOrder.toString()}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {entry.answer}
                  </p>
                  {entry.keywords.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] text-secondary-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={entry.enabled}
                      disabled={isPending}
                      onCheckedChange={(checked) =>
                        onSetEnabled(entry.id, checked)
                      }
                      aria-label={`${entry.enabled ? "Disable" : "Enable"} ${entry.question}`}
                      data-ocid={`chatbot.enabled_switch.${index + 1}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => openEdit(entry)}
                    aria-label={`Edit ${entry.question}`}
                    data-ocid={`chatbot.edit_button.${index + 1}`}
                    className="rounded-md"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => setPendingDelete(entry)}
                    aria-label={`Delete ${entry.question}`}
                    data-ocid={`chatbot.delete_button.${index + 1}`}
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
          data-ocid="chatbot.form_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit help entry" : "New help entry"}
            </DialogTitle>
            <DialogDescription>
              The help assistant matches a visitor&apos;s question against these
              entries.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="chatbot-question" className="text-xs font-medium">
                Question
              </Label>
              <Input
                id="chatbot-question"
                data-ocid="chatbot.question_input"
                value={values.question}
                placeholder="How do I publish a listing?"
                onChange={(event) => set("question", event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="chatbot-answer" className="text-xs font-medium">
                Answer
              </Label>
              <Textarea
                id="chatbot-answer"
                data-ocid="chatbot.answer_textarea"
                rows={4}
                value={values.answer}
                placeholder="Choose a plan, submit your payment reference, then create the listing from your account page."
                onChange={(event) => set("answer", event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="chatbot-keywords"
                  className="text-xs font-medium"
                >
                  Keywords (comma separated)
                </Label>
                <Input
                  id="chatbot-keywords"
                  data-ocid="chatbot.keywords_input"
                  value={values.keywords}
                  placeholder="publish, listing, post"
                  onChange={(event) => set("keywords", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="chatbot-sort" className="text-xs font-medium">
                  Display order
                </Label>
                <Input
                  id="chatbot-sort"
                  data-ocid="chatbot.sort_input"
                  inputMode="numeric"
                  value={values.sortOrder}
                  onChange={(event) =>
                    set("sortOrder", event.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-admin-border bg-muted/30 px-3 py-2.5">
              <Checkbox
                id="chatbot-enabled"
                checked={values.enabled}
                onCheckedChange={(checked) => set("enabled", checked === true)}
                data-ocid="chatbot.enabled_checkbox"
              />
              <div>
                <Label
                  htmlFor="chatbot-enabled"
                  className="text-sm font-medium"
                >
                  Enabled
                </Label>
                <p className="text-xs text-muted-foreground">
                  Disabled entries are hidden from the public help assistant.
                </p>
              </div>
            </div>

            {formError ? (
              <p
                data-ocid="chatbot.form_error"
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
                data-ocid="chatbot.cancel_button"
                className="rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                data-ocid="chatbot.submit_button"
                className="rounded-md"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                {isSaving ? "Saving…" : editing ? "Save entry" : "Create entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent data-ocid="chatbot.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this help entry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.question}” will be removed from the help assistant. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="chatbot.delete_cancel_button"
              className="rounded-md"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
              data-ocid="chatbot.delete_confirm_button"
              className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
