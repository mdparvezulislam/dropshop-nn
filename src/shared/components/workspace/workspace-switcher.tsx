"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Warehouse,
  Building2,
  Users,
  Check,
  ChevronsUpDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { WorkspaceDefinition } from "@/shared/platform/platform-types";

export interface WorkspaceSwitcherProps {
  workspaces: WorkspaceDefinition[];
  currentWorkspace?: WorkspaceDefinition;
  collapsed?: boolean;
  onSwitch?: (workspace: WorkspaceDefinition) => void;
}

const WORKSPACE_ICONS: Record<string, LucideIcon> = {
  admin: LayoutDashboard,
  reseller: Store,
  wholesaler: Warehouse,
  supplier: Building2,
  customer: Users,
};

const WORKSPACE_COLORS: Record<string, string> = {
  admin: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  reseller: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  wholesaler: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  supplier: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  customer: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function getWorkspaceIcon(workspace: WorkspaceDefinition): LucideIcon {
  return WORKSPACE_ICONS[workspace.id] ?? LayoutDashboard;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  collapsed,
  onSwitch,
}: WorkspaceSwitcherProps): React.ReactElement {
  const router = useRouter();
  const active = currentWorkspace ?? workspaces[0];
  const Icon = getWorkspaceIcon(active);

  const handleSelect = (workspace: WorkspaceDefinition): void => {
    onSwitch?.(workspace);
    router.push(workspace.href);
  };

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-muted/60 p-2 hover:bg-sidebar-muted transition-all active:scale-95"
            aria-label="Switch workspace"
          >
            <Icon className="h-4 w-4 text-primary" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-60 bg-sidebar text-sidebar-foreground border-sidebar-border shadow-xl">
          <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/50">Switch Workspace</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-sidebar-border" />
          {workspaces.map((ws) => {
            const WsIcon = getWorkspaceIcon(ws);
            const isActive = ws.id === active.id;
            return (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => handleSelect(ws)}
                className={cn(
                  "flex items-center justify-between py-2 text-xs cursor-pointer rounded-md transition-colors",
                  isActive
                    ? "bg-primary/15 text-white font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-white",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold", WORKSPACE_COLORS[ws.id])}>
                    <WsIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{ws.label}</span>
                </div>
                {isActive ? <Check className="h-3.5 w-3.5 text-primary shrink-0" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-muted/60 px-3 py-2.5 hover:bg-sidebar-muted hover:border-sidebar-border/80 transition-all text-left"
        >
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-xs transition-transform group-hover:scale-105", WORKSPACE_COLORS[active.id])}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate flex items-center justify-between">
              {active.label}
              <ChevronsUpDown className="h-3.5 w-3.5 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70 transition-colors" />
            </div>
            <div className="text-[10px] text-sidebar-foreground/50 truncate font-medium">{active.description}</div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-64 bg-sidebar text-sidebar-foreground border-sidebar-border shadow-2xl">
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-sidebar-border" />
        {workspaces.map((ws) => {
          const WsIcon = getWorkspaceIcon(ws);
          const isActive = ws.id === active.id;
          return (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => handleSelect(ws)}
              className={cn(
                "flex items-center justify-between p-2.5 text-xs cursor-pointer rounded-lg transition-colors mb-0.5",
                isActive
                  ? "bg-primary/15 text-white font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-white",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold", WORKSPACE_COLORS[ws.id])}>
                  <WsIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{ws.label}</div>
                  <div className="text-[10px] text-sidebar-foreground/50 truncate">{ws.description}</div>
                </div>
              </div>
              {isActive ? <Check className="h-4 w-4 text-primary shrink-0" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WorkspaceSwitcher;
