"use client";

import * as React from "react";
import { Sidebar } from "@/shared/components/workspace/sidebar";
import { ResellerTopbar } from "@/features/reseller-workspace/reseller-topbar";
import { RESELLER_NAV } from "@/features/reseller-workspace/nav-config";
import { cn } from "@/shared/utils/cn";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { Store } from "lucide-react";

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-current",
      collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
    );
  }, [collapsed]);

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background text-foreground ws-grain">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          nav={RESELLER_NAV}
          workspaceLabel="My Shop"
          workspaceIcon={<Store className="h-4 w-4" />}
        />
        <div
          className={cn(
            "flex min-h-screen flex-col transition-[padding] duration-200 ease-out",
            "lg:pl-[var(--sidebar-current)]",
          )}
        >
          <ResellerTopbar
            collapsed={collapsed}
            onMenuClick={() => setMobileOpen(true)}
            onCommandOpen={() => setCommandOpen(true)}
          />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[var(--content-max)] px-4 py-5 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </div>
    </SessionProvider>
  );
}
