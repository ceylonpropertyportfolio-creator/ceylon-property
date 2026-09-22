import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitEnquiry } from "@/hooks/use-enquiries";
import { cn } from "@/lib/utils";
import type { EnquiryFormValues, ListingId } from "@/types/listing";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";

interface EnquiryFormProps {
  listingId: ListingId;
  /** Listing title, echoed in the success confirmation. */
  listingTitle: string;
  className?: string;
}

const EMPTY_FORM: EnquiryFormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<keyof EnquiryFormValues, string>>;

function validate(values: EnquiryFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.phone.trim()) errors.phone = "Please enter a phone number.";
  if (!values.message.trim()) {
    errors.message = "Please tell us what you would like to know.";
  }
  return errors;
}

/**
 * Public enquiry form bound to a single listing. Captures name, email, phone
 * and message, validates locally, and reports backend error variants clearly.
 */
export function EnquiryForm({
  listingId,
  listingTitle,
  className,
}: EnquiryFormProps) {
  const [values, setValues] = useState<EnquiryFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const mutation = useSubmitEnquiry();

  function update<K extends keyof EnquiryFormValues>(
    field: K,
    value: EnquiryFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      listingId,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        setValues(EMPTY_FORM);
        setErrors({});
        setSubmitted(true);
      },
    });
  }

  if (submitted) {
    return (
      <output
        data-ocid="enquiry.success_state"
        className={cn(
          "block rounded-2xl border border-success/30 bg-success/5 p-6 text-center sm:p-8",
          className,
        )}
      >
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h3 className="font-display text-xl font-semibold text-foreground">
          Enquiry sent
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thank you — your enquiry about {listingTitle} has reached our team. We
          will be in touch shortly.
        </p>
        <Button
          type="button"
          variant="outline"
          data-ocid="enquiry.send_another_button"
          onClick={() => setSubmitted(false)}
          className="mt-5 rounded-full"
        >
          Send another enquiry
        </Button>
      </output>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      data-ocid="enquiry.form"
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="enquiry-name">Full name</Label>
        <Input
          id="enquiry-name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "enquiry-name-error" : undefined}
          data-ocid="enquiry.name_input"
          placeholder="Amara Perera"
          className="rounded-lg"
        />
        {errors.name ? (
          <p
            id="enquiry-name-error"
            data-ocid="enquiry.name_error"
            className="text-xs font-medium text-destructive"
          >
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="enquiry-email">Email address</Label>
        <Input
          id="enquiry-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "enquiry-email-error" : undefined}
          data-ocid="enquiry.email_input"
          placeholder="you@example.com"
          className="rounded-lg"
        />
        {errors.email ? (
          <p
            id="enquiry-email-error"
            data-ocid="enquiry.email_error"
            className="text-xs font-medium text-destructive"
          >
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="enquiry-phone">Phone number</Label>
        <Input
          id="enquiry-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => update("phone", event.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "enquiry-phone-error" : undefined}
          data-ocid="enquiry.phone_input"
          placeholder="+94 77 123 4567"
          className="rounded-lg"
        />
        {errors.phone ? (
          <p
            id="enquiry-phone-error"
            data-ocid="enquiry.phone_error"
            className="text-xs font-medium text-destructive"
          >
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="enquiry-message">Message</Label>
        <Textarea
          id="enquiry-message"
          name="message"
          rows={4}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "enquiry-message-error" : undefined
          }
          data-ocid="enquiry.message_textarea"
          placeholder="I would like to arrange a viewing of this property."
          className="rounded-lg"
        />
        {errors.message ? (
          <p
            id="enquiry-message-error"
            data-ocid="enquiry.message_error"
            className="text-xs font-medium text-destructive"
          >
            {errors.message}
          </p>
        ) : null}
      </div>

      {mutation.isError ? (
        <p
          role="alert"
          data-ocid="enquiry.error_state"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {mutation.error instanceof Error
            ? mutation.error.message
            : "We could not send your enquiry. Please try again."}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={mutation.isPending}
        data-ocid="enquiry.submit_button"
        className="rounded-full bg-primary text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
      >
        {mutation.isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {mutation.isPending ? "Sending…" : "Send enquiry"}
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Your details are shared only with the Ceylon Property Portfolio team.
      </p>
    </form>
  );
}
