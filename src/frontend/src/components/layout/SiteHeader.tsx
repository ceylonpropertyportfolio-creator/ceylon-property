import { CeylonLogo } from "@/components/brand/CeylonLogo";
import { Button } from "@/components/ui/button";
import { useMyAccount } from "@/hooks/use-customer";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, Plus, UserRound, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/listings", label: "Browse" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/plans", label: "Plans" },
] as const;

/**
 * Sticky public site header: brand lockup, the five-item primary navigation,
 * a prominent POST YOUR PROPERTY call to action, and the customer account
 * controls. Customer authentication is entirely separate from the admin
 * console, which keeps its own sign-in and layout.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isInitializing, isLoggingIn, login, clear } =
    useInternetIdentity();
  const { data: account } = useMyAccount();
  const customerName = account?.customer.name?.trim();

  function handleSignOut() {
    setOpen(false);
    clear();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          data-ocid="site_header.brand_link"
          className="rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <CeylonLogo />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-0.5 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`site_header.nav.${link.label.toLowerCase()}`}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              activeProps={{ className: "text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden items-center gap-1 lg:flex">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <Link to="/account" data-ocid="site_header.account_link">
                  <UserRound className="size-4" aria-hidden="true" />
                  {customerName ? customerName.split(" ")[0] : "My account"}
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid="site_header.logout_button"
                onClick={handleSignOut}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="site_header.login_button"
              disabled={isInitializing || isLoggingIn}
              onClick={() => login()}
              className="hidden rounded-full text-muted-foreground hover:text-foreground lg:inline-flex"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {isLoggingIn ? "Signing in…" : "Sign in"}
            </Button>
          )}

          <Button
            asChild
            data-ocid="site_header.post_property_button"
            className="hidden rounded-full px-5 shadow-subtle transition-smooth hover:shadow-elevated sm:inline-flex"
          >
            <Link to="/post-property">
              <Plus className="size-4" aria-hidden="true" />
              Post your property
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            data-ocid="site_header.menu_toggle"
            onClick={() => setOpen((value) => !value)}
            className="lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-border bg-card lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`site_header.mobile_nav.${link.label.toLowerCase()}`}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-muted text-foreground" }}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            <Button
              asChild
              className="w-full rounded-full"
              onClick={() => setOpen(false)}
            >
              <Link
                to="/post-property"
                data-ocid="site_header.mobile_post_property_button"
              >
                <Plus className="size-4" aria-hidden="true" />
                Post your property
              </Link>
            </Button>

            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => setOpen(false)}
                >
                  <Link
                    to="/account"
                    data-ocid="site_header.mobile_account_link"
                  >
                    <UserRound className="size-4" aria-hidden="true" />
                    My account
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  data-ocid="site_header.mobile_logout_button"
                  onClick={handleSignOut}
                  className="w-full rounded-full text-muted-foreground"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                data-ocid="site_header.mobile_login_button"
                disabled={isInitializing || isLoggingIn}
                onClick={() => {
                  setOpen(false);
                  login();
                }}
                className="w-full rounded-full"
              >
                <LogIn className="size-4" aria-hidden="true" />
                {isLoggingIn ? "Signing in…" : "Sign in"}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
