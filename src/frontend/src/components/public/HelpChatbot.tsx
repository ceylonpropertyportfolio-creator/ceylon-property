import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbotEntries } from "@/hooks/use-content";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  HelpCircle,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  from: "assistant" | "visitor";
  text: string;
}

const GREETING =
  "Hello — I am the Ceylon Property assistant. Ask me about buying, renting, listing a property or our advertising plans.";

const SUGGESTIONS = [
  "How do I list my property?",
  "What do the plans cost?",
  "How do I arrange a viewing?",
] as const;

/** Scores a chatbot entry against a visitor's question. */
function scoreEntry(
  entry: { question: string; answer: string; keywords: string[] },
  query: string,
): number {
  const normalized = query.toLowerCase();
  const terms = normalized
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);
  let score = 0;
  for (const keyword of entry.keywords) {
    const needle = keyword.toLowerCase().trim();
    if (needle && normalized.includes(needle)) score += 3;
  }
  for (const term of terms) {
    if (entry.question.toLowerCase().includes(term)) score += 2;
    if (entry.answer.toLowerCase().includes(term)) score += 1;
  }
  return score;
}

/**
 * The built-in help assistant. Answers are matched against the admin-managed
 * chatbot entries; when nothing matches, the visitor is routed to the Contact
 * page rather than left with a dead end.
 */
export function HelpChatbot() {
  const { data } = useChatbotEntries();
  const entries = data ?? [];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "greeting", from: "assistant", text: GREETING },
  ]);
  const logRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scroll whenever the transcript grows
  useEffect(() => {
    if (!open) return;
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [open, messages]);

  function answerFor(question: string): string {
    if (entries.length === 0) {
      return "I do not have the answer base loaded right now. Send us a note on the Contact page and an advisor will reply within one working day.";
    }
    let best: { answer: string; score: number } | null = null;
    for (const entry of entries) {
      if (!entry.enabled) continue;
      const score = scoreEntry(entry, question);
      if (score > 0 && (!best || score > best.score)) {
        best = { answer: entry.answer, score };
      }
    }
    if (best) return best.answer;
    return "I could not find that in the help base. Try asking about listing a property, plans or viewings — or reach an advisor on the Contact page.";
  }

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const reply = answerFor(trimmed);
    setDraft("");
    setMessages((current) => [
      ...current,
      { id: `visitor-${current.length}`, from: "visitor", text: trimmed },
      { id: `assistant-${current.length}`, from: "assistant", text: reply },
    ]);
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {open ? (
          <div
            data-ocid="help_chatbot.panel"
            className="flex h-[30rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-float"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border bg-primary px-5 py-4 text-primary-foreground">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-sm font-semibold">
                    Property assistant
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-primary-foreground/70">
                    Help &amp; guidance
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close the help assistant"
                data-ocid="help_chatbot.close_button"
                onClick={() => setOpen(false)}
                className="size-8 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <div
              ref={logRef}
              data-ocid="help_chatbot.messages"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    message.from === "assistant"
                      ? "bg-muted text-foreground"
                      : "ml-auto bg-primary text-primary-foreground",
                  )}
                >
                  {message.text}
                </div>
              ))}

              {messages.length === 1 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      data-ocid={`help_chatbot.suggestion.${suggestion
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "_")
                        .replace(/^_|_$/g, "")}`}
                      onClick={() => ask(suggestion)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(draft);
              }}
              className="flex items-center gap-2 border-t border-border px-3 py-3"
            >
              <label htmlFor="help-chatbot-input" className="sr-only">
                Ask the property assistant a question
              </label>
              <Input
                id="help-chatbot-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask a question…"
                data-ocid="help_chatbot.input"
                className="h-10 rounded-full"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send question"
                data-ocid="help_chatbot.send_button"
                disabled={draft.trim().length === 0}
                className="size-10 shrink-0 rounded-full"
              >
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>

            <div className="border-t border-border bg-muted/40 px-4 py-2.5 text-center">
              <Link
                to="/contact"
                data-ocid="help_chatbot.contact_link"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                Talk to an advisor
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}

        <Button
          type="button"
          data-ocid="help_chatbot.open_button"
          aria-expanded={open}
          aria-label={
            open ? "Close the help assistant" : "Open the help assistant"
          }
          onClick={() => setOpen((value) => !value)}
          className="h-14 rounded-full px-5 shadow-float transition-smooth hover:shadow-elevated"
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <>
              <MessageCircle className="size-5" aria-hidden="true" />
              <span className="hidden sm:inline">Need help?</span>
            </>
          )}
        </Button>
      </div>

      {!open ? (
        <span className="sr-only">
          <HelpCircle aria-hidden="true" />
          The help assistant is available from the button in the bottom right
          corner.
        </span>
      ) : null}
    </>
  );
}
