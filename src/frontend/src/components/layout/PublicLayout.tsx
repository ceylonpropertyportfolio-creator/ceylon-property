import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HelpChatbot } from "@/components/public/HelpChatbot";
import { Outlet } from "@tanstack/react-router";

/** Warm editorial shell for the public property site. */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <HelpChatbot />
    </div>
  );
}
