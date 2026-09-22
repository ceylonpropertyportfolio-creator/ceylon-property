import type {
  AdminEnquiry,
  AdminListingSummary,
  AdminPayment,
  Banner,
  BannerInput,
  Category,
  CategoryInput,
  ChatbotEntry,
  ChatbotEntryInput,
  Customer,
  CustomerAccount,
  CustomerProfileInput,
  Enquiry,
  EnquiryInput,
  Listing,
  ListingFilter,
  ListingInput,
  ListingUpdate,
  Payment,
  Photo,
  Plan,
  PlanInput,
  Subscription,
} from "@/backend";
import {
  EmailVerification,
  ListingType,
  MobileVerification,
  PaymentStatus,
  PropertyType,
  SubscriptionStatus,
} from "@/backend";

export {
  EmailVerification,
  ListingType,
  MobileVerification,
  PaymentStatus,
  PropertyType,
  SubscriptionStatus,
};

export type {
  AdminEnquiry,
  AdminListingSummary,
  AdminPayment,
  Banner,
  BannerInput,
  Category,
  CategoryInput,
  ChatbotEntry,
  ChatbotEntryInput,
  Customer,
  CustomerAccount,
  CustomerProfileInput,
  Enquiry,
  EnquiryInput,
  Listing,
  ListingFilter,
  ListingInput,
  ListingUpdate,
  Payment,
  Photo,
  Plan,
  PlanInput,
  Subscription,
};

/** A listing id as used across the frontend. */
export type ListingId = bigint;

/** An enquiry id as used across the frontend. */
export type EnquiryId = bigint;

/** A plan id as used across the frontend. */
export type PlanId = bigint;

/** A single option in a select control. */
export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

/** The editable shape of a listing form, with numeric fields as strings. */
export interface ListingFormValues {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: string;
  currency: string;
  addressLine: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
}

/** The editable shape of the public enquiry form. */
export interface EnquiryFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/** The editable shape of the customer registration form. */
export interface CustomerFormValues {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  company: string;
  address: string;
}
