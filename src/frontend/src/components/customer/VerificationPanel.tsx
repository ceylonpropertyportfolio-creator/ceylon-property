import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useConfirmEmailVerification,
  useRequestEmailVerification,
  useSubmitMobileNumber,
} from "@/hooks/use-customer";
import { emailVerificationLabel, mobileVerificationLabel } from "@/lib/format";
import type { Customer } from "@/types/listing";
import { EmailVerification } from "@/types/listing";
import { Loader2, MailCheck, ShieldCheck, Smartphone } from "lucide-react";
import { type FormEvent, useState } from "react";

interface VerificationPanelProps {
  /** The stored customer record whose verification states are shown. */
  customer: Customer;
}

/**
 * Email and mobile verification. Email uses a one-time code typed in by the
 * customer; mobile numbers are recorded and reviewed manually by an
 * administrator because no SMS provider is configured.
 */
export function VerificationPanel({ customer }: VerificationPanelProps) {
  const requestEmail = useRequestEmailVerification();
  const confirmEmail = useConfirmEmailVerification();
  const submitMobile = useSubmitMobileNumber();

  const [email, setEmail] = useState(customer.email);
  const [code, setCode] = useState("");
  const [mobile, setMobile] = useState(customer.phone);
  const [codeSent, setCodeSent] = useState(false);

  const isEmailVerified =
    customer.emailVerification === EmailVerification.verified;

  function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const captured = email.trim();
    if (!captured) return;
    requestEmail.mutate(captured, {
      onSuccess: () => {
        setCodeSent(true);
        setCode("");
      },
    });
  }

  function handleConfirmCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const captured = code.trim();
    if (!captured) return;
    setCode("");
    confirmEmail.mutate(captured, {
      onError: () =>
        setCode((current) => (current === "" ? captured : current)),
    });
  }

  function handleSubmitMobile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const captured = mobile.trim();
    if (!captured) return;
    submitMobile.mutate(captured);
  }

  return (
    <section
      data-ocid="account.verification_section"
      className="rounded-3xl border border-border bg-card p-7 shadow-subtle md:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Verification
          </h2>
          <p className="text-sm text-muted-foreground">
            Confirm your email and register a mobile number for our team.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <MailCheck className="size-4 text-primary" aria-hidden="true" />
              Email address
            </h3>
            <Badge variant="outline" className="shrink-0 rounded-full">
              {emailVerificationLabel(customer.emailVerification)}
            </Badge>
          </div>

          {isEmailVerified ? (
            <p
              data-ocid="account.email_verified_state"
              className="mt-4 text-sm leading-relaxed text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                {customer.email}
              </span>{" "}
              is verified. Enquiries from your listings reach this address.
            </p>
          ) : (
            <>
              <form onSubmit={handleRequestCode} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="account-verify-email">Email address</Label>
                  <Input
                    id="account-verify-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    data-ocid="account.email_input"
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  data-ocid="account.email_send_code_button"
                  disabled={email.trim().length === 0 || requestEmail.isPending}
                  className="rounded-full"
                >
                  {requestEmail.isPending ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                  {requestEmail.isPending
                    ? "Sending…"
                    : "Send verification code"}
                </Button>
              </form>

              {requestEmail.isError ? (
                <p
                  data-ocid="account.email_request_error"
                  className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {requestEmail.error.message}
                </p>
              ) : null}

              {codeSent ? (
                <form
                  onSubmit={handleConfirmCode}
                  className="mt-4 space-y-3 border-t border-border pt-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="account-verify-code">
                      Verification code
                    </Label>
                    <Input
                      id="account-verify-code"
                      inputMode="numeric"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      placeholder="6-digit code"
                      data-ocid="account.email_code_input"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    data-ocid="account.email_confirm_button"
                    disabled={
                      code.trim().length === 0 || confirmEmail.isPending
                    }
                    className="rounded-full"
                  >
                    {confirmEmail.isPending ? "Confirming…" : "Confirm code"}
                  </Button>
                </form>
              ) : null}

              {confirmEmail.isError ? (
                <p
                  data-ocid="account.email_confirm_error"
                  className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {confirmEmail.error.message}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <Smartphone className="size-4 text-primary" aria-hidden="true" />
              Mobile number
            </h3>
            <Badge variant="outline" className="shrink-0 rounded-full">
              {mobileVerificationLabel(customer.mobileVerification)}
            </Badge>
          </div>

          <form onSubmit={handleSubmitMobile} className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="account-mobile">Mobile number</Label>
              <Input
                id="account-mobile"
                type="tel"
                required
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                placeholder="+94 77 000 0000"
                data-ocid="account.mobile_input"
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              data-ocid="account.mobile_submit_button"
              disabled={mobile.trim().length === 0 || submitMobile.isPending}
              className="rounded-full"
            >
              {submitMobile.isPending ? "Submitting…" : "Submit for review"}
            </Button>
          </form>

          {submitMobile.isError ? (
            <p
              data-ocid="account.mobile_error"
              className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {submitMobile.error.message}
            </p>
          ) : null}

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Mobile numbers are reviewed manually by our team. No SMS is sent.
          </p>
        </div>
      </div>
    </section>
  );
}
