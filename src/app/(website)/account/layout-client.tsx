"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { CustomerHeader } from "@/components/account/customer-header";
import { CustomerBottomNav } from "@/components/account/customer-bottom-nav";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export function AccountLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent("/account")}`);
    }
  }, [status, router]);

  useEffect(() => {
    document.documentElement.style.setProperty("--account-sidebar-w", collapsed ? "4rem" : "15rem");
  }, [collapsed]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16 md:pb-12">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AccountSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Header & Dedicated Customer Bottom Navigation */}
      <CustomerHeader />
      <CustomerBottomNav />

      <main
        className={cn(
          "min-h-[calc(100vh-3.5rem)] transition-[padding] duration-200 ease-out py-4 sm:py-6",
          "md:pl-[var(--account-sidebar-w)]",
        )}
      >
        <div className="mx-auto w-full max-w-(--content-max) px-3 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
