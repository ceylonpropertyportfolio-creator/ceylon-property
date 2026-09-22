import { EmptyState } from "@/components/common/EmptyState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { AdminBannersPage } from "@/pages/admin/AdminBannersPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
import { AdminChatbotPage } from "@/pages/admin/AdminChatbotPage";
import { AdminCustomersPage } from "@/pages/admin/AdminCustomersPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminEnquiriesPage } from "@/pages/admin/AdminEnquiriesPage";
import { AdminListingEditorPage } from "@/pages/admin/AdminListingEditorPage";
import { AdminListingsPage } from "@/pages/admin/AdminListingsPage";
import { AdminPaymentsPage } from "@/pages/admin/AdminPaymentsPage";
import { AdminPlansPage } from "@/pages/admin/AdminPlansPage";
import { AboutPage } from "@/pages/public/AboutPage";
import { AccountPage } from "@/pages/public/AccountPage";
import { BrowsePage } from "@/pages/public/BrowsePage";
import { ContactPage } from "@/pages/public/ContactPage";
import { HomePage } from "@/pages/public/HomePage";
import { ListingDetailPage } from "@/pages/public/ListingDetailPage";
import { PlansPage } from "@/pages/public/PlansPage";
import { PostPropertyPage } from "@/pages/public/PostPropertyPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Compass } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Route tree
 *
 * Public site  → PublicLayout  (warm editorial shell)
 * Admin console → AdminLayout  (dark emerald rail, gated)
 * ------------------------------------------------------------------ */

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
  errorComponent: RootErrorComponent,
});

/** Root route render-error fallback, shown instead of a blank page. */
function RootErrorComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-20">
      <EmptyState
        icon={AlertTriangle}
        data-ocid="app.route_error"
        title="Something went wrong"
        description="This page ran into an unexpected problem. Reloading usually clears it."
        action={
          <Button
            type="button"
            onClick={() => window.location.reload()}
            data-ocid="app.route_error.reload_button"
            className="rounded-full"
          >
            Reload the page
          </Button>
        }
      />
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-20">
      <EmptyState
        icon={Compass}
        data-ocid="not_found.empty_state"
        title="Page not found"
        description="The page you were looking for does not exist or has moved."
        action={
          <Button asChild className="rounded-full">
            <Link to="/" data-ocid="not_found.home_button">
              Back to home
            </Link>
          </Button>
        }
      />
    </div>
  );
}

/* --- Public route tree -------------------------------------------- */

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: HomePage,
});

/** Search params for the public browse page; every key is optional. */
export interface BrowseSearch {
  q?: string;
  type?: string;
  property?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  location?: string;
  sort?: string;
}

/**
 * Coerce a raw search value to a string. TanStack Router's default search
 * parser JSON-parses numeric-looking params, so `?minPrice=100000` arrives as
 * a number; accepting both shapes keeps numeric filters alive across refresh.
 */
function toSearchString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

const browseRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/listings",
  validateSearch: (search: Record<string, unknown>): BrowseSearch => ({
    q: toSearchString(search.q),
    type: toSearchString(search.type),
    property: toSearchString(search.property),
    minPrice: toSearchString(search.minPrice),
    maxPrice: toSearchString(search.maxPrice),
    beds: toSearchString(search.beds),
    location: toSearchString(search.location),
    sort: toSearchString(search.sort),
  }),
  component: BrowsePage,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/listings/$listingId",
  component: ListingDetailPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/about",
  component: AboutPage,
});

const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/contact",
  component: ContactPage,
});

const plansRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/plans",
  component: PlansPage,
});

const postPropertyRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/post-property",
  component: PostPropertyPage,
});

const accountRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/account",
  component: AccountPage,
});

/* --- Admin route tree --------------------------------------------- */

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminDashboardPage,
});

const adminListingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/listings",
  component: AdminListingsPage,
});

const adminListingNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/listings/new",
  component: AdminListingEditorPage,
});

const adminListingEditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/listings/$listingId/edit",
  component: AdminListingEditorPage,
});

const adminEnquiriesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/enquiries",
  component: AdminEnquiriesPage,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/customers",
  component: AdminCustomersPage,
});

const adminPlansRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/plans",
  component: AdminPlansPage,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/payments",
  component: AdminPaymentsPage,
});

const adminBannersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/banners",
  component: AdminBannersPage,
});

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/categories",
  component: AdminCategoriesPage,
});

const adminChatbotRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/chatbot",
  component: AdminChatbotPage,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    browseRoute,
    listingDetailRoute,
    aboutRoute,
    contactRoute,
    plansRoute,
    postPropertyRoute,
    accountRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminListingsRoute,
    adminListingNewRoute,
    adminListingEditRoute,
    adminEnquiriesRoute,
    adminCustomersRoute,
    adminPlansRoute,
    adminPaymentsRoute,
    adminBannersRoute,
    adminCategoriesRoute,
    adminChatbotRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
