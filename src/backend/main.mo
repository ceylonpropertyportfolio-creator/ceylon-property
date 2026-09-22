import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import Types "types/common";
import ListingsTypes "types/listings";
import CustomersTypes "types/customers";
import ContentTypes "types/content";
import ListingsApiMixin "mixins/listings-api";
import CustomersApiMixin "mixins/customers-api";
import PlansApiMixin "mixins/plans-api";
import ContentApiMixin "mixins/content-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let listingsState : ListingsTypes.ListingsState;
  let customersState : CustomersTypes.CustomersState;
  let contentState : ContentTypes.ContentState;
  let listings : Map.Map<Types.ListingId, Types.Listing>;
  let enquiries : Map.Map<Types.EnquiryId, Types.Enquiry>;
  let customers : Map.Map<Types.CustomerId, CustomersTypes.Customer>;
  let plans : Map.Map<Types.PlanId, CustomersTypes.Plan>;
  let payments : Map.Map<Types.PaymentId, CustomersTypes.Payment>;
  let subscriptions : Map.Map<Types.CustomerId, CustomersTypes.Subscription>;
  let banners : Map.Map<Types.BannerId, ContentTypes.Banner>;
  let categories : Map.Map<Types.CategoryId, ContentTypes.Category>;
  let chatbotEntries : Map.Map<Types.ChatbotEntryId, ContentTypes.ChatbotEntry>;

  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();
  include ListingsApiMixin(
    accessControlState,
    listingsState,
    listings,
    enquiries,
    customers,
    subscriptions,
    plans,
  );
  include CustomersApiMixin(accessControlState, customersState, customers, subscriptions);
  include PlansApiMixin(
    accessControlState,
    customersState,
    plans,
    payments,
    subscriptions,
    customers,
  );
  include ContentApiMixin(accessControlState, contentState, banners, categories, chatbotEntries);
  include ApiDocMixin();
  include Expose({
    entities = [
      // Listings carry variant and collection fields, so they are exposed in
      // manual mode: each column is projected explicitly.
      listings.toEntityManual("listing", "Listing", "id")
        .sample({
          id = 0;
          owner = null;
          title = "";
          description = "";
          listingType = #sale;
          propertyType = #house;
          price = 0;
          currency = "";
          addressLine = "";
          city = "";
          region = "";
          postcode = "";
          country = "";
          bedrooms = 0;
          bathrooms = 0;
          area = 0;
          photos = [];
          published = false;
          featured = false;
          blocked = false;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func l = l.id)
        .payload("title", func l = l.title)
        .payload("description", func l = l.description)
        .payload("listingType", func l = switch (l.listingType) {
          case (#sale) { "sale" };
          case (#rent) { "rent" };
        })
        .payload("propertyType", func l = switch (l.propertyType) {
          case (#house) { "house" };
          case (#apartment) { "apartment" };
          case (#condo) { "condo" };
          case (#townhouse) { "townhouse" };
          case (#land) { "land" };
          case (#commercial) { "commercial" };
          case (#other) { "other" };
        })
        .payload("price", func l = l.price)
        .payload("currency", func l = l.currency)
        .payload("addressLine", func l = l.addressLine)
        .payload("city", func l = l.city)
        .payload("region", func l = l.region)
        .payload("postcode", func l = l.postcode)
        .payload("country", func l = l.country)
        .payload("bedrooms", func l = l.bedrooms)
        .payload("bathrooms", func l = l.bathrooms)
        .payload("area", func l = l.area)
        .payload("photoCount", func l = l.photos.size())
        .payload("published", func l = l.published)
        .payload("featured", func l = l.featured)
        .payload("blocked", func l = l.blocked)
        .payload("createdAt", func l = l.createdAt)
        .payload("updatedAt", func l = l.updatedAt)
        .public_()
        .build(),
      // Enquiries are all-primitive records, so they auto-derive.
      enquiries.toEntity("enquiry", "Enquiry", "id")
        .sample({
          id = 0;
          listingId = 0;
          name = "";
          email = "";
          phone = "";
          message = "";
          read = false;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      // Customers carry variant verification fields, so they are exposed in
      // manual mode with explicit projections.
      customers.toEntityManual("customer", "Customer", "principal")
        .sample({
          principal = Principal.fromText("aaaaa-aa");
          email = "";
          name = "";
          phone = "";
          whatsapp = "";
          company = "";
          address = "";
          emailVerification = #unverified;
          mobileVerification = #notSubmitted;
          blocked = false;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("principal", func c = c.principal)
        .payload("email", func c = c.email)
        .payload("name", func c = c.name)
        .payload("phone", func c = c.phone)
        .payload("whatsapp", func c = c.whatsapp)
        .payload("company", func c = c.company)
        .payload("address", func c = c.address)
        .payload("emailVerification", func c = switch (c.emailVerification) {
          case (#unverified) { "unverified" };
          case (#pending) { "pending" };
          case (#verified) { "verified" };
        })
        .payload("mobileVerification", func c = switch (c.mobileVerification) {
          case (#notSubmitted) { "notSubmitted" };
          case (#pendingReview) { "pendingReview" };
          case (#approved) { "approved" };
          case (#rejected) { "rejected" };
        })
        .payload("blocked", func c = c.blocked)
        .payload("createdAt", func c = c.createdAt)
        .payload("updatedAt", func c = c.updatedAt)
        .controllerOnly()
        .build(),
      // Plans carry optional allowances and a feature list, so they are
      // exposed in manual mode with explicit projections.
      plans.toEntityManual("plan", "Plan", "id")
        .sample({
          id = 0;
          name = "";
          price = 0;
          billingPeriod = "";
          listingAllowance = null;
          imageAllowance = null;
          features = [];
          active = false;
          sortOrder = 0;
        })
        .payload("id", func p = p.id)
        .payload("name", func p = p.name)
        .payload("price", func p = p.price)
        .payload("billingPeriod", func p = p.billingPeriod)
        .payload("active", func p = p.active)
        .payload("sortOrder", func p = p.sortOrder)
        .public_()
        .build(),
      // Payments carry a variant status field, so they are exposed in manual
      // mode with explicit projections.
      payments.toEntityManual("payment", "Payment", "id")
        .sample({
          id = 0;
          customer = Principal.fromText("aaaaa-aa");
          planId = 0;
          planName = "";
          amount = 0;
          reference = "";
          status = #pending;
          submittedAt = 0;
          reviewedAt = null;
          periodStart = null;
          periodEnd = null;
        })
        .payload("id", func p = p.id)
        .payload("customer", func p = p.customer)
        .payload("planId", func p = p.planId)
        .payload("planName", func p = p.planName)
        .payload("amount", func p = p.amount)
        .payload("reference", func p = p.reference)
        .payload("status", func p = switch (p.status) {
          case (#pending) { "pending" };
          case (#confirmed) { "confirmed" };
          case (#rejected) { "rejected" };
        })
        .payload("submittedAt", func p = p.submittedAt)
        .controllerOnly()
        .build(),
      // Subscriptions are keyed by customer principal, which the stored value
      // does not carry, so the row is projected from the map entries with the
      // key spliced in as the `customer` column. The status variant is
      // rendered as text.
      Entity.manual<{
        customer : Principal;
        planId : Nat;
        planName : Text;
        price : Nat;
        billingPeriod : Text;
        status : Text;
        startedAt : Int;
        expiresAt : Int;
      }>(
        "subscription",
        func () = subscriptions.entries().map(func ((customer, s)) = {
          customer;
          planId = s.planId;
          planName = s.planName;
          price = s.price;
          billingPeriod = s.billingPeriod;
          status = switch (s.status) {
            case (#active) { "active" };
            case (#expired) { "expired" };
          };
          startedAt = s.startedAt;
          expiresAt = s.expiresAt;
        }),
        "Subscription",
        "customer",
      )
        .sample({
          customer = Principal.fromText("aaaaa-aa");
          planId = 0;
          planName = "";
          price = 0;
          billingPeriod = "";
          status = "active";
          startedAt = 0;
          expiresAt = 0;
        })
        .payload("customer", func s = s.customer)
        .payload("planId", func s = s.planId)
        .payload("planName", func s = s.planName)
        .payload("price", func s = s.price)
        .payload("billingPeriod", func s = s.billingPeriod)
        .payload("status", func s = s.status)
        .payload("startedAt", func s = s.startedAt)
        .payload("expiresAt", func s = s.expiresAt)
        .controllerOnly()
        .build(),
      // Banners carry an optional photo, so they are exposed in manual mode.
      banners.toEntityManual("banner", "Banner", "id")
        .sample({
          id = 0;
          title = "";
          subtitle = "";
          image = null;
          linkUrl = "";
          enabled = false;
          sortOrder = 0;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func b = b.id)
        .payload("title", func b = b.title)
        .payload("subtitle", func b = b.subtitle)
        .payload("linkUrl", func b = b.linkUrl)
        .payload("enabled", func b = b.enabled)
        .payload("sortOrder", func b = b.sortOrder)
        .payload("createdAt", func b = b.createdAt)
        .payload("updatedAt", func b = b.updatedAt)
        .public_()
        .build(),
      // Categories are all-primitive records, so they auto-derive.
      categories.toEntity("category", "Category", "id")
        .sample({
          id = 0;
          name = "";
          slug = "";
          description = "";
          enabled = false;
          sortOrder = 0;
        })
        .public_()
        .build(),
      // Chatbot entries carry a keyword list, so they are exposed in manual
      // mode with explicit projections.
      chatbotEntries.toEntityManual("chatbotEntry", "ChatbotEntry", "id")
        .sample({
          id = 0;
          question = "";
          answer = "";
          keywords = [];
          enabled = false;
          sortOrder = 0;
          updatedAt = 0;
        })
        .payload("id", func e = e.id)
        .payload("question", func e = e.question)
        .payload("answer", func e = e.answer)
        .payload("enabled", func e = e.enabled)
        .payload("sortOrder", func e = e.sortOrder)
        .payload("updatedAt", func e = e.updatedAt)
        .public_()
        .build(),
    ];
  });
};
