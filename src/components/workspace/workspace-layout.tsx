"use client";

import * as React from "react";
import { Sidebar } from "@/components/workspace/sidebar";
import { Topbar } from "@/components/workspace/topbar";
import { CommandPalette } from "@/components/workspace/command-palette";
import type { NavSection } from "@/components/workspace/nav-config";
import type { Breadcrumb } from "@/components/workspace/nav-config";
import type { TopbarUserMenuItem } from "@/components/workspace/topbar";
import {
  buildCommandsForWorkspace,
  type WorkspaceShellConfig,
} from "@/components/workspace/workspace-registry";
import { cn } from "@/lib/utils/cn";
import { Toaster } from "sonner";
import { SessionProvider, useSession } from "next-auth/react";

export interface WorkspaceLayoutProps {
  children: React.ReactNode;
  /** Preferred: full shell config from registry */
  config?: WorkspaceShellConfig;
  /** Legacy props (still supported) */
  nav?: NavSection[];
  workspaceLabel?: string;
  workspaceIcon?: React.ReactNode;
  homeHref?: string;
  topbar?: React.ComponentType<{
    collapsed: boolean;
    onMenuClick: () => void;
    onCommandOpen: () => void;
  }>;
  getBreadcrumbsFn?: (pathname: string) => Breadcrumb[];
  searchPlaceholder?: string;
  showQuickAction?: boolean;
  userMenuItems?: TopbarUserMenuItem[];
}

function WorkspaceShellInner({
  children,
  config,
  nav,
  workspaceLabel,
  workspaceIcon,
  homeHref,
  topbar: CustomTopbar,
  getBreadcrumbsFn,
  searchPlaceholder,
  showQuickAction,
  userMenuItems,
}: WorkspaceLayoutProps): React.ReactElement {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  const resolvedNav = config?.nav ?? nav ?? [];
  const resolvedLabel = config?.label ?? workspaceLabel ?? "Workspace";
  const resolvedHome = config?.homeHref ?? homeHref ?? "/dashboard";
  const resolvedSearch = config?.searchPlaceholder ?? searchPlaceholder ?? "Search workspace…";
  const resolvedQuick = config?.showQuickAction ?? showQuickAction ?? false;
  const resolvedCrumbs = config?.getBreadcrumbs ?? getBreadcrumbsFn;

  const commands = React.useMemo(() => {
    if (config) return buildCommandsForWorkspace(config);
    return buildCommandsForWorkspace({
      id: "admin",
      label: resolvedLabel,
      description: "",
      basePath: resolvedHome,
      homeHref: resolvedHome,
      nav: resolvedNav,
      roles: [],
      getBreadcrumbs: resolvedCrumbs ?? (() => []),
      searchPlaceholder: resolvedSearch,
      showQuickAction: resolvedQuick,
    });
  }, [
    config,
    resolvedNav,
    resolvedLabel,
    resolvedHome,
    resolvedCrumbs,
    resolvedSearch,
    resolvedQuick,
  ]);

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

  const sessionUser = session?.user as
    { name?: string | null; email?: string | null; role?: string } | undefined;
  const displayName = sessionUser?.name || resolvedLabel;
  const displayEmail = sessionUser?.email || "";
  const avatarFallback = (displayName || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const settingsHref =
    resolvedHome === "/dashboard" ? "/account" : `${resolvedHome.replace(/\/$/, "")}/settings`;

  const defaultMenu: TopbarUserMenuItem[] = [
    { label: "Account", href: "/account" },
    { label: "Settings", href: settingsHref },
    { label: "Sign out", destructive: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground ws-grain">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        nav={resolvedNav}
        workspaceLabel={resolvedLabel}
        workspaceIcon={workspaceIcon}
        homeHref={resolvedHome}
        subtitle={config?.description}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200 ease-out",
          "lg:pl-[var(--sidebar-current)]",
        )}
      >
        {CustomTopbar ? (
          <CustomTopbar
            collapsed={collapsed}
            onMenuClick={() => setMobileOpen(true)}
            onCommandOpen={() => setCommandOpen(true)}
          />
        ) : (
          <Topbar
            collapsed={collapsed}
            onMenuClick={() => setMobileOpen(true)}
            onCommandOpen={() => setCommandOpen(true)}
            getBreadcrumbsFn={resolvedCrumbs}
            searchPlaceholder={resolvedSearch}
            showQuickAction={resolvedQuick}
            avatarFallback={avatarFallback}
            userLabel={displayName}
            userEmail={displayEmail}
            userMenuItems={userMenuItems ?? defaultMenu}
          />
        )}
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[var(--content-max)] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        commands={commands}
        placeholder={resolvedSearch}
      />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export function WorkspaceLayout(props: WorkspaceLayoutProps): React.ReactElement {
  return (
    <SessionProvider>
      <WorkspaceShellInner {...props} />
    </SessionProvider>
  );
}

export default WorkspaceLayout;
