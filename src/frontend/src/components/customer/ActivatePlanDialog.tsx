import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmitPayment } from "@/hooks/use-customer";
import { formatMonthlyPrice } from "@/lib/format";
import type { Plan } from "@/types/listing";
import { CheckCircle2, Info, Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

interface ActivatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Every plan the customer can activate. */
  plans: Plan[];
  /** The plan to preselect, normally the current subscription's plan. */
  defaultPlanId: bigint | null;
  /** The customer's name, used in the confirmation copy. */
  customerName: string;
}

/**
 * The ACTIVATE PLAN dialog. The customer picks a plan and submits a payment
 * reference; the subscription stays pending until an administrator confirms
 * the payment. Nothing here marks a payment successful automatically.
 */
export function ActivatePlanDialog({
  open,
  onOpenChange,
  plans,
  defaultPlanId,
  customerName,
}: ActivatePlanDialogProps) {
  const submitPayment = useSubmitPayment();
  const [planId, setPlanId] = useState<string>("");
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setReference("");
    setPlanId(
      defaultPlanId !== null
        ? defaultPlanId.toString()
        : (plans[0]?.id.toString() ?? ""),
    );
  }, [open, defaultPlanId, plans]);

  const selectedPlan =
    plans.find((plan) => plan.id.toString() === planId) ?? null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan) return;
    const captured = reference.trim();
    if (!captured) return;
    setReference("");
    setSubmitted(false);
    submitPayment.mutate(
      { planId: selectedPlan.id, reference: captured },
      {
        onSuccess: () => setSubmitted(true),
        onError: () =>
          setReference((current) => (current === "" ? captured : current)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="account.activate_plan_dialog"
        className="rounded-3xl sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Activate your plan
          </DialogTitle>
          <DialogDescription>
            Transfer the monthly amount to our account, then submit the
            reference below. Your plan activates once an administrator confirms
            the payment.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <output
            data-ocid="account.activate_plan_success"
            className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 text-sm text-foreground"
          >
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>
              Thank you{customerName ? `, ${customerName}` : ""}. Your payment
              reference was received and is awaiting confirmation. You can track
              its status in your payment history.
            </span>
          </output>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="activate-plan">Plan</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger
                  id="activate-plan"
                  data-ocid="account.activate_plan_select"
                  className="h-11 w-full rounded-xl"
                >
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem
                      key={plan.id.toString()}
                      value={plan.id.toString()}
                    >
                      {plan.name} — {formatMonthlyPrice(plan.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activate-reference">Payment reference</Label>
              <Input
                id="activate-reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Bank transfer reference or slip number"
                data-ocid="account.activate_reference_input"
                className="h-11 rounded-xl"
              />
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Payments are confirmed manually by our team. No payment is ever
                marked successful automatically.
              </p>
            </div>

            {submitPayment.isError ? (
              <p
                data-ocid="account.activate_plan_error"
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {submitPayment.error.message}
              </p>
            ) : null}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="account.activate_plan_cancel_button"
                disabled={submitPayment.isPending}
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="account.activate_plan_submit_button"
                disabled={
                  !selectedPlan ||
                  reference.trim().length === 0 ||
                  submitPayment.isPending
                }
                className="rounded-full px-6"
              >
                {submitPayment.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {submitPayment.isPending ? "Submitting…" : "Submit reference"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
