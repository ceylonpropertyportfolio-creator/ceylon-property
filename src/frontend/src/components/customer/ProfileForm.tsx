import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateMyProfile } from "@/hooks/use-customer";
import type { Customer, CustomerProfileInput } from "@/types/listing";
import { Loader2, Save, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";

const PROFILE_FIELDS = [
  { key: "name", label: "Full name", type: "text", required: true },
  { key: "email", label: "Email address", type: "email", required: true },
  { key: "phone", label: "Phone number", type: "tel", required: true },
  { key: "whatsapp", label: "WhatsApp number", type: "tel", required: false },
  {
    key: "company",
    label: "Company (optional)",
    type: "text",
    required: false,
  },
  { key: "address", label: "Address", type: "text", required: false },
] as const;

function toDraft(customer: Customer): CustomerProfileInput {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    whatsapp: customer.whatsapp,
    company: customer.company,
    address: customer.address,
  };
}

interface ProfileFormProps {
  /** The stored customer record used to seed the draft. */
  customer: Customer;
}

/**
 * The advertiser profile editor. The draft is owned locally and only the
 * customer's own submit flow resets it, so a background refetch never wipes
 * in-progress edits.
 */
export function ProfileForm({ customer }: ProfileFormProps) {
  const updateProfile = useUpdateMyProfile();
  const [draft, setDraft] = useState<CustomerProfileInput>(() =>
    toDraft(customer),
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedMessage(null);
    updateProfile.mutate(
      {
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        whatsapp: draft.whatsapp.trim(),
        company: draft.company.trim(),
        address: draft.address.trim(),
      },
      { onSuccess: () => setSavedMessage("Your profile has been saved.") },
    );
  }

  return (
    <section
      data-ocid="account.profile_section"
      className="rounded-3xl border border-border bg-card p-7 shadow-subtle md:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Your advertiser details, shown on every listing you publish.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {PROFILE_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`account-${field.key}`}>{field.label}</Label>
              <Input
                id={`account-${field.key}`}
                type={field.type}
                required={field.required}
                value={draft[field.key]}
                onChange={(event) =>
                  setDraft({ ...draft, [field.key]: event.target.value })
                }
                data-ocid={`account.profile_${field.key}_input`}
                className="h-11 rounded-xl"
              />
            </div>
          ))}
        </div>

        {updateProfile.isError ? (
          <p
            data-ocid="account.profile_error"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {updateProfile.error.message}
          </p>
        ) : null}

        {savedMessage ? (
          <output
            data-ocid="account.profile_success"
            className="block rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground"
          >
            {savedMessage}
          </output>
        ) : null}

        <Button
          type="submit"
          data-ocid="account.profile_save_button"
          disabled={updateProfile.isPending}
          className="rounded-full px-7"
        >
          {updateProfile.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {updateProfile.isPending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </section>
  );
}
