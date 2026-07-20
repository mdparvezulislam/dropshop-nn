"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Warehouse,
  Building2,
  Users,
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
            className="flex w-full items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-muted/50 p-2 hover:bg-sidebar-muted transition-colors"
            aria-label="Switch workspace"
          >
            <Icon className="h-4 w-4 text-sidebar-accent" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((ws) => {
            const WsIcon = getWorkspaceIcon(ws);
            return (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => handleSelect(ws)}
                className={cn(ws.id === active.id && "bg-muted font-medium")}
              >
                <WsIcon className="h-4 w-4" />
                <span>{ws.label}</span>
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
          className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-muted/50 px-3 py-2.5 hover:bg-sidebar-muted transition-colors text-left"
        >
          <Icon className="h-5 w-5 shrink-0 text-sidebar-accent" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-white truncate">{active.label}</div>
            <div className="text-[10px] text-sidebar-foreground/50 truncate">{active.description}</div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-64">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((ws) => {
          const WsIcon = getWorkspaceIcon(ws);
          return (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => handleSelect(ws)}
              className={cn(
                "flex items-center gap-3",
                ws.id === active.id && "bg-muted font-medium",
              )}
            >
              <WsIcon className="h-4 w-4 shrink-0 text-sidebar-accent" />
              <div className="min-w-0">
                <div className="text-sm truncate">{ws.label}</div>
                <div className="text-xs text-muted-foreground truncate">{ws.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WorkspaceSwitcher;
