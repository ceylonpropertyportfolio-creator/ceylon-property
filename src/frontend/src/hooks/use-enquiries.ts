import { createActor } from "@/backend";
import type { Enquiry, EnquiryInput } from "@/backend";
import { adminKeys } from "@/hooks/use-admin";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** Submits a public enquiry against a published listing. */
export function useSubmitEnquiry() {
  const { actor, isUnavailable } = useBackendStatus(createActor);
  const queryClient = useQueryClient();
  const mutation = useMutation<Enquiry, Error, EnquiryInput>({
    mutationFn: async (input: EnquiryInput) => {
      if (!actor) {
        throw new Error(
          isUnavailable
            ? "The enquiry service is unavailable right now. Please try again shortly."
            : "The enquiry service is still connecting. Please try again in a moment.",
        );
      }
      const result = await actor.submitEnquiry(input);
      if (result.__kind__ === "err") {
        throw new Error(
          result.err.__kind__ === "listingNotFound"
            ? "This listing is no longer available."
            : "This listing is not currently accepting enquiries.",
        );
      }
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.enquiries() });
    },
  });
  return { ...mutation, isUnavailable };
}
