import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CURRENCY_OPTIONS,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  LISTING_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/lib/listing-options";
import { cn } from "@/lib/utils";
import type { Listing, ListingFormValues, Photo } from "@/types/listing";
import { ListingType, PropertyType } from "@/types/listing";
import { Loader2, Save, X } from "lucide-react";
import { type FormEvent, useState } from "react";

/** The empty draft used when creating a new listing. */
export const EMPTY_LISTING_FORM: ListingFormValues = {
  title: "",
  description: "",
  listingType: ListingType.sale,
  propertyType: PropertyType.house,
  price: "",
  currency: DEFAULT_CURRENCY,
  addressLine: "",
  city: "",
  region: "",
  postcode: "",
  country: DEFAULT_COUNTRY,
  bedrooms: "3",
  bathrooms: "2",
  area: "",
};

/** Maps a stored listing onto the editable form shape. */
export function listingToFormValues(listing: Listing): ListingFormValues {
  return {
    title: listing.title,
    description: listing.description,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    price: listing.price.toString(),
    currency: listing.currency,
    addressLine: listing.addressLine,
    city: listing.city,
    region: listing.region,
    postcode: listing.postcode,
    country: listing.country,
    bedrooms: listing.bedrooms.toString(),
    bathrooms: listing.bathrooms.toString(),
    area: listing.area.toString(),
  };
}

type FieldErrors = Partial<Record<keyof ListingFormValues, string>>;

const REQUIRED_TEXT: (keyof ListingFormValues)[] = [
  "title",
  "description",
  "addressLine",
  "city",
  "region",
  "country",
];

function validate(values: ListingFormValues): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of REQUIRED_TEXT) {
    if (!values[field].trim()) errors[field] = "This field is required.";
  }
  if (values.title.trim().length > 0 && values.title.trim().length < 4) {
    errors.title = "Use at least 4 characters.";
  }
  if (
    values.description.trim().length > 0 &&
    values.description.trim().length < 20
  ) {
    errors.description = "Describe the property in at least 20 characters.";
  }

  const price = Number(values.price);
  if (!values.price.trim()) errors.price = "Enter a price.";
  else if (!Number.isFinite(price) || price <= 0)
    errors.price = "Enter a price greater than zero.";

  const area = Number(values.area);
  if (!values.area.trim()) errors.area = "Enter the floor area.";
  else if (!Number.isFinite(area) || area <= 0)
    errors.area = "Enter an area greater than zero.";

  const bedrooms = Number(values.bedrooms);
  if (!values.bedrooms.trim() || !Number.isInteger(bedrooms) || bedrooms < 0)
    errors.bedrooms = "Enter a whole number of bedrooms.";

  const bathrooms = Number(values.bathrooms);
  if (!values.bathrooms.trim() || !Number.isInteger(bathrooms) || bathrooms < 0)
    errors.bathrooms = "Enter a whole number of bathrooms.";

  return errors;
}

/** The advertiser contact details captured alongside a listing. */
export interface AdvertiserValues {
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
}

/** The publication flags an administrator controls on a listing. */
export interface ListingFlags {
  published: boolean;
  featured: boolean;
  blocked: boolean;
}

interface AdminListingFormProps {
  /** The current draft values, owned by the parent page. */
  values: ListingFormValues;
  /** Called with the next draft whenever a field changes. */
  onChange: (values: ListingFormValues) => void;
  /** The advertiser contact draft, owned by the parent page. */
  advertiser: AdvertiserValues;
  /** Called with the next advertiser draft whenever a field changes. */
  onAdvertiserChange: (values: AdvertiserValues) => void;
  /** The publication flags, owned by the parent page. */
  flags: ListingFlags;
  /** Called with the next flags whenever a toggle changes. */
  onFlagsChange: (flags: ListingFlags) => void;
  /** Photos already attached to the listing. */
  photos: Photo[];
  /** Persists the given photos against the listing. */
  onUploadPhotos: (photos: Photo[]) => Promise<void>;
  /** Removes the photo at the given index. */
  onRemovePhoto: (index: number) => Promise<void>;
  /** True while a photo mutation is in flight. */
  isPhotoBusy: boolean;
  /** Called with the validated draft when the form is submitted. */
  onSubmit: (values: ListingFormValues) => void;
  /** Called when the administrator cancels editing. */
  onCancel: () => void;
  /** True while the save mutation is in flight. */
  isSaving: boolean;
  /** A backend error to surface above the actions. */
  errorMessage?: string | null;
  /** Label for the primary action. */
  submitLabel: string;
}

/** The full property field set used by both create and edit flows. */
export function AdminListingForm({
  values,
  onChange,
  advertiser,
  onAdvertiserChange,
  flags,
  onFlagsChange,
  photos,
  onUploadPhotos,
  onRemovePhoto,
  isPhotoBusy,
  onSubmit,
  onCancel,
  isSaving,
  errorMessage,
  submitLabel,
}: AdminListingFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function set<K extends keyof ListingFormValues>(
    key: K,
    value: ListingFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function setAdvertiser<K extends keyof AdvertiserValues>(
    key: K,
    value: AdvertiserValues[K],
  ) {
    onAdvertiserChange({ ...advertiser, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(values);
  }

  return (
    <form
      data-ocid="admin_listing_form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      <section className="rounded-lg border border-admin-border bg-background p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Property details
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The headline information buyers and renters see first.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            id="admin-listing-title"
            label="Title"
            error={errors.title}
            className="md:col-span-2"
          >
            <Input
              id="admin-listing-title"
              data-ocid="admin_listing_form.title_input"
              value={values.title}
              placeholder="Beachfront villa with infinity pool"
              aria-invalid={Boolean(errors.title)}
              onChange={(event) => set("title", event.target.value)}
            />
          </Field>

          <Field
            id="admin-listing-description"
            label="Description"
            error={errors.description}
            className="md:col-span-2"
          >
            <Textarea
              id="admin-listing-description"
              data-ocid="admin_listing_form.description_textarea"
              value={values.description}
              rows={5}
              placeholder="Describe the layout, outlook, finishes and nearby amenities."
              aria-invalid={Boolean(errors.description)}
              onChange={(event) => set("description", event.target.value)}
            />
          </Field>

          <Field id="admin-listing-type" label="Listing type">
            <Select
              value={values.listingType}
              onValueChange={(value) =>
                set("listingType", value as ListingType)
              }
            >
              <SelectTrigger
                id="admin-listing-type"
                data-ocid="admin_listing_form.listing_type_select"
                className="w-full"
              >
                <SelectValue placeholder="Select listing type" />
              </SelectTrigger>
              <SelectContent>
                {LISTING_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="admin-property-type" label="Category">
            <Select
              value={values.propertyType}
              onValueChange={(value) =>
                set("propertyType", value as PropertyType)
              }
            >
              <SelectTrigger
                id="admin-property-type"
                data-ocid="admin_listing_form.property_type_select"
                className="w-full"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="admin-listing-price" label="Price" error={errors.price}>
            <Input
              id="admin-listing-price"
              data-ocid="admin_listing_form.price_input"
              inputMode="numeric"
              value={values.price}
              placeholder="1300000"
              aria-invalid={Boolean(errors.price)}
              onChange={(event) =>
                set("price", event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </Field>

          <Field id="admin-listing-currency" label="Currency">
            <Select
              value={values.currency}
              onValueChange={(value) => set("currency", value)}
            >
              <SelectTrigger
                id="admin-listing-currency"
                data-ocid="admin_listing_form.currency_select"
                className="w-full"
              >
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-admin-border bg-background p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Location
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Where the property sits, as it should appear on the public site.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            id="admin-listing-address"
            label="Address line"
            error={errors.addressLine}
            className="md:col-span-2"
          >
            <Input
              id="admin-listing-address"
              data-ocid="admin_listing_form.address_input"
              value={values.addressLine}
              placeholder="42 Lighthouse Road"
              aria-invalid={Boolean(errors.addressLine)}
              onChange={(event) => set("addressLine", event.target.value)}
            />
          </Field>

          <Field id="admin-listing-city" label="City" error={errors.city}>
            <Input
              id="admin-listing-city"
              data-ocid="admin_listing_form.city_input"
              value={values.city}
              placeholder="Galle"
              aria-invalid={Boolean(errors.city)}
              onChange={(event) => set("city", event.target.value)}
            />
          </Field>

          <Field id="admin-listing-region" label="Region" error={errors.region}>
            <Input
              id="admin-listing-region"
              data-ocid="admin_listing_form.region_input"
              value={values.region}
              placeholder="Southern Province"
              aria-invalid={Boolean(errors.region)}
              onChange={(event) => set("region", event.target.value)}
            />
          </Field>

          <Field id="admin-listing-postcode" label="Postcode">
            <Input
              id="admin-listing-postcode"
              data-ocid="admin_listing_form.postcode_input"
              value={values.postcode}
              placeholder="80000"
              onChange={(event) => set("postcode", event.target.value)}
            />
          </Field>

          <Field
            id="admin-listing-country"
            label="Country"
            error={errors.country}
          >
            <Input
              id="admin-listing-country"
              data-ocid="admin_listing_form.country_input"
              value={values.country}
              placeholder="Sri Lanka"
              aria-invalid={Boolean(errors.country)}
              onChange={(event) => set("country", event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-admin-border bg-background p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Size and rooms
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Counts and details shown on every listing card.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field
            id="admin-listing-bedrooms"
            label="Bedrooms"
            error={errors.bedrooms}
          >
            <Input
              id="admin-listing-bedrooms"
              data-ocid="admin_listing_form.bedrooms_input"
              inputMode="numeric"
              value={values.bedrooms}
              aria-invalid={Boolean(errors.bedrooms)}
              onChange={(event) =>
                set("bedrooms", event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </Field>

          <Field
            id="admin-listing-bathrooms"
            label="Bathrooms"
            error={errors.bathrooms}
          >
            <Input
              id="admin-listing-bathrooms"
              data-ocid="admin_listing_form.bathrooms_input"
              inputMode="numeric"
              value={values.bathrooms}
              aria-invalid={Boolean(errors.bathrooms)}
              onChange={(event) =>
                set("bathrooms", event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </Field>

          <Field
            id="admin-listing-area"
            label="Area (sq ft)"
            error={errors.area}
          >
            <Input
              id="admin-listing-area"
              data-ocid="admin_listing_form.area_input"
              inputMode="numeric"
              value={values.area}
              placeholder="2400"
              aria-invalid={Boolean(errors.area)}
              onChange={(event) =>
                set("area", event.target.value.replace(/[^\d]/g, ""))
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-admin-border bg-background p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Advertiser contact
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          How enquirers reach the advertiser. Shown on the public listing.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field id="admin-advertiser-name" label="Advertiser name">
            <Input
              id="admin-advertiser-name"
              data-ocid="admin_listing_form.advertiser_name_input"
              value={advertiser.name}
              placeholder="Sunil Perera"
              onChange={(event) => setAdvertiser("name", event.target.value)}
            />
          </Field>

          <Field id="admin-advertiser-phone" label="Phone">
            <Input
              id="admin-advertiser-phone"
              data-ocid="admin_listing_form.advertiser_phone_input"
              value={advertiser.phone}
              placeholder="+94 77 123 4567"
              onChange={(event) => setAdvertiser("phone", event.target.value)}
            />
          </Field>

          <Field id="admin-advertiser-email" label="Email">
            <Input
              id="admin-advertiser-email"
              type="email"
              data-ocid="admin_listing_form.advertiser_email_input"
              value={advertiser.email}
              placeholder="sunil@example.lk"
              onChange={(event) => setAdvertiser("email", event.target.value)}
            />
          </Field>

          <Field id="admin-advertiser-whatsapp" label="WhatsApp">
            <Input
              id="admin-advertiser-whatsapp"
              data-ocid="admin_listing_form.advertiser_whatsapp_input"
              value={advertiser.whatsapp}
              placeholder="+94 77 123 4567"
              onChange={(event) =>
                setAdvertiser("whatsapp", event.target.value)
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-admin-border bg-background p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Photos
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Uploaded photos are stored securely and shown on the public listing.
        </p>
        <div className="mt-5">
          <PhotoUploader
            photos={photos}
            onUpload={onUploadPhotos}
            onRemove={onRemovePhoto}
            disabled={isPhotoBusy}
          />
        </div>
      </section>

      <section className="rounded-lg border border-admin-border bg-background p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Publication
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Control exactly how this listing appears on the public site.
        </p>

        <div className="mt-5 space-y-3">
          <ToggleRow
            id="admin-listing-published"
            label="Published"
            description="Visible on the public browse and search pages."
            checked={flags.published}
            onCheckedChange={(checked) =>
              onFlagsChange({ ...flags, published: checked })
            }
          />
          <ToggleRow
            id="admin-listing-featured"
            label="Featured"
            description="Promoted on the homepage and featured listings."
            checked={flags.featured}
            onCheckedChange={(checked) =>
              onFlagsChange({ ...flags, featured: checked })
            }
          />
          <ToggleRow
            id="admin-listing-blocked"
            label="Blocked"
            description="Hidden from the public site regardless of publish state."
            checked={flags.blocked}
            onCheckedChange={(checked) =>
              onFlagsChange({ ...flags, blocked: checked })
            }
          />
        </div>
      </section>

      {errorMessage ? (
        <p
          data-ocid="admin_listing_form.error_state"
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          data-ocid="admin_listing_form.cancel_button"
          disabled={isSaving}
          onClick={onCancel}
          className="rounded-md"
        >
          <X className="size-4" aria-hidden="true" />
          Cancel
        </Button>
        <Button
          type="submit"
          data-ocid="admin_listing_form.submit_button"
          disabled={isSaving}
          className="rounded-md"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isSaving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-admin-border bg-muted/30 px-3 py-2.5">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        data-ocid={`admin_listing_form.${id.replace("admin-listing-", "")}_checkbox`}
        className="mt-0.5"
      />
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ id, label, error, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p
          data-ocid={`admin_listing_form.${id.replace("admin-listing-", "").replace("admin-", "")}_error`}
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
