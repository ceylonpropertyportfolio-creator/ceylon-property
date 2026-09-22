import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  CreditCard,
  FolderTree,
  Image,
  LayoutDashboard,
  Mail,
  MessageCircleQuestion,
  Package,
  Users,
} from "lucide-react";

/** The console's primary navigation, grouped by the job it serves. */
const ADMIN_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Portfolio",
    items: [
      {
        to: "/admin/listings",
        label: "Listings",
        icon: Building2,
        exact: false,
      },
      {
        to: "/admin/categories",
        label: "Categories",
        icon: FolderTree,
        exact: false,
      },
      { to: "/admin/enquiries", label: "Enquiries", icon: Mail, exact: false },
    ],
  },
  {
    label: "Accounts",
    items: [
      { to: "/admin/customers", label: "Customers", icon: Users, exact: false },
      { to: "/admin/plans", label: "Plans", icon: Package, exact: false },
      {
        to: "/admin/payments",
        label: "Payments",
        icon: CreditCard,
        exact: false,
      },
    ],
  },
  {
    label: "Site content",
    items: [
      { to: "/admin/banners", label: "Banners", icon: Image, exact: false },
      {
        to: "/admin/chatbot",
        label: "Help content",
        icon: MessageCircleQuestion,
        exact: false,
      },
    ],
  },
] as const;

/** Dark neutral rail that structurally separates the admin console. */
export function AdminSidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col bg-sidebar text-sidebar-foreground md:w-64">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary font-display text-lg font-semibold text-sidebar-primary-foreground">
          C
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-display text-sm font-semibold tracking-tight">
            Ceylon Admin
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/60">
            Console
          </span>
        </span>
      </div>

      <nav
        aria-label="Admin"
        className="flex flex-1 flex-col gap-5 overflow-y-auto p-3"
      >
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">
              {group.label}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={`admin_sidebar.nav.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
                activeOptions={{ exact: item.exact }}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-smooth hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/50",
                )}
                activeProps={{
                  className: "bg-sidebar-accent text-sidebar-accent-foreground",
                }}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <Link
          to="/"
          data-ocid="admin_sidebar.public_site_link"
          className="text-xs font-medium text-sidebar-foreground/60 transition-smooth hover:text-sidebar-foreground"
        >
          ← Back to public site
        </Link>
      </div>
    </aside>
  );
}
