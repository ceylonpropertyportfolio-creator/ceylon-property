import { ErrorState } from "@/components/common/ErrorState";
import { CustomerAuthPanel } from "@/components/customer/CustomerAuthPanel";
import {
  CustomerListingForm,
  EMPTY_CUSTOMER_LISTING_FORM,
} from "@/components/customer/CustomerListingForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddMyListingPhotos,
  useCreateMyListing,
  useMyAccount,
  useRegisterCustomer,
} from "@/hooks/use-customer";
import type {
  CustomerProfileInput,
  ListingFormValues,
  ListingInput,
  Photo,
} from "@/types/listing";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, CheckCircle2, PackageOpen, UserPlus } from "lucide-react";
import { useState } from "react";

/** Converts a validated draft into the backend create payload. */
function toListingInput(values: ListingFormValues): ListingInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    listingType: values.listingType,
    propertyType: values.propertyType,
    price: BigInt(values.price),
    currency: values.currency,
    addressLine: values.addressLine.trim(),
    city: values.city.trim(),
    region: values.region.trim(),
    postcode: values.postcode.trim(),
    country: values.country.trim(),
    bedrooms: BigInt(values.bedrooms),
    bathrooms: BigInt(values.bathrooms),
    area: BigInt(values.area),
    photos: [],
  };
}

const EMPTY_PROFILE: CustomerProfileInput = {
  name: "",
  email: "",
  phone: "",
  whatsapp: "",
  company: "",
  address: "",
};

/**
 * The customer "post your property" flow. Visitors sign in with Internet
 * Identity — entirely separate from the administrator console — register a
 * profile, choose an advertising plan, then submit a listing for review.
 */
export function PostPropertyPage() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const accountQuery = useMyAccount();
  const registerCustomer = useRegisterCustomer();
  const createListing = useCreateMyListing();
  const addPhotos = useAddMyListingPhotos();

  const [profile, setProfile] = useState<CustomerProfileInput>(EMPTY_PROFILE);
  const [values, setValues] = useState<ListingFormValues>(
    EMPTY_CUSTOMER_LISTING_FORM,
  );
  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTitle, setCreatedTitle] = useState<string | null>(null);

  const account = accountQuery.data ?? null;
  const subscription = account?.subscription ?? null;
  const hasActiveSubscription = subscription?.status === "active";

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerCustomer.mutate(
      {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        whatsapp: profile.whatsapp.trim(),
        company: profile.company.trim(),
        address: profile.address.trim(),
      },
      { onSuccess: () => setProfile(EMPTY_PROFILE) },
    );
  }

  function handleSubmit(next: ListingFormValues) {
    setErrorMessage(null);
    setCreatedTitle(null);
    createListing.mutate(toListingInput(next), {
      onSuccess: async (created) => {
        if (pendingPhotos.length > 0) {
          try {
            await addPhotos.mutateAsync({
              id: created.id,
              photos: pendingPhotos,
            });
          } catch {
            setErrorMessage(
              "Your listing was submitted, but its photos could not be uploaded. Open it from My account to attach them.",
            );
            return;
          }
        }
        setPendingPhotos([]);
        setValues(EMPTY_CUSTOMER_LISTING_FORM);
        setCreatedTitle(created.title);
      },
      onError: (error) => setErrorMessage(error.message),
    });
  }

  async function handleUpload(photos: Photo[]) {
    setPendingPhotos((current) => [...current, ...photos]);
  }

  async function handleRemovePhoto(index: number) {
    setPendingPhotos((current) =>
      current.filter((_, position) => position !== index),
    );
  }

  return (
    <div data-ocid="post_property.page">
      <section className="bg-gradient-subtle py-16 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground/80">
              Advertise with us
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              Post your property
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Sign in, choose a monthly plan and submit your property. Every
              listing is reviewed by our team before it appears in the public
              portfolio.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          {isInitializing ? (
            <div data-ocid="post_property.loading_state" className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          ) : !isAuthenticated ? (
            <CustomerAuthPanel
              data-ocid="post_property.auth_panel"
              title="Sign in to post a property"
              description="Customer accounts use Internet Identity and are kept separate from the administrator console."
            />
          ) : accountQuery.isLoading ? (
            <div
              data-ocid="post_property.account_loading_state"
              className="space-y-4"
            >
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : accountQuery.isError || accountQuery.isUnavailable ? (
            <ErrorState
              data-ocid="post_property.error_state"
              title="We could not load your account"
              description="The account service did not respond. Please try again in a moment."
              onRetry={() => void accountQuery.refetch()}
            />
          ) : !account ? (
            <RegisterPanel
              profile={profile}
              onChange={setProfile}
              onSubmit={handleRegister}
              isSaving={registerCustomer.isPending}
              errorMessage={
                registerCustomer.isError ? registerCustomer.error.message : null
              }
            />
          ) : !hasActiveSubscription ? (
            <div className="rounded-3xl border border-border bg-card p-8 shadow-subtle md:p-12">
              <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PackageOpen className="size-6" aria-hidden="true" />
              </span>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Choose an advertising plan
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Welcome back, {account.customer.name || "there"}. An active
                monthly plan is required before you can publish a listing.
                Choose a plan, submit your payment reference, and our team will
                confirm it.
              </p>
              <Button asChild className="mt-6 rounded-full px-7">
                <Link to="/plans" data-ocid="post_property.plans_button">
                  View plans
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                data-ocid="post_property.subscription_banner"
                className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-5"
              >
                <BadgeCheck
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">
                    {subscription?.planName}
                  </span>{" "}
                  is active. Your listing will be reviewed by our team before it
                  goes live.
                </p>
              </div>

              {createdTitle ? (
                <output
                  data-ocid="post_property.success_state"
                  className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-5 text-sm text-foreground"
                >
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-semibold">{createdTitle}</span> was
                    submitted. Track its status from{" "}
                    <Link
                      to="/account"
                      data-ocid="post_property.success_account_link"
                      className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      My account
                    </Link>
                    .
                  </span>
                </output>
              ) : null}

              <CustomerListingForm
                values={values}
                onChange={setValues}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setValues(EMPTY_CUSTOMER_LISTING_FORM);
                  setPendingPhotos([]);
                  setErrorMessage(null);
                }}
                isSaving={createListing.isPending || addPhotos.isPending}
                errorMessage={errorMessage}
                submitLabel="Submit listing"
                photos={pendingPhotos}
                onUploadPhotos={handleUpload}
                onRemovePhoto={handleRemovePhoto}
                isPhotoBusy={addPhotos.isPending}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface RegisterPanelProps {
  profile: CustomerProfileInput;
  onChange: (next: CustomerProfileInput) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  errorMessage: string | null;
}

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

/** The one-time customer profile form shown before a plan can be chosen. */
function RegisterPanel({
  profile,
  onChange,
  onSubmit,
  isSaving,
  errorMessage,
}: RegisterPanelProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-subtle md:p-10">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserPlus className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Create your advertiser account
          </h2>
          <p className="text-sm text-muted-foreground">
            One short step before you can post a property.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {PROFILE_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`profile-${field.key}`}>{field.label}</Label>
              <Input
                id={`profile-${field.key}`}
                type={field.type}
                required={field.required}
                value={profile[field.key]}
                onChange={(event) =>
                  onChange({ ...profile, [field.key]: event.target.value })
                }
                data-ocid={`post_property.profile_${field.key}_input`}
                className="h-11 rounded-xl"
              />
            </div>
          ))}
        </div>

        {errorMessage ? (
          <p
            data-ocid="post_property.register_error"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          data-ocid="post_property.register_button"
          disabled={isSaving}
          className="rounded-full px-7"
        >
          {isSaving ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
