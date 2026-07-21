"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";

export interface WidgetGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

const COL_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function WidgetGrid({
  children,
  className,
  columns = 4,
}: WidgetGridProps): React.ReactElement {
  return (
    <div className={cn("grid gap-3", COL_CLASS[columns], className)}>{children}</div>
  );
}

export interface WorkspaceWidgetProps {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4;
  delay?: number;
}

export function WorkspaceWidget({
  children,
  className,
  span = 1,
  delay = 0,
}: WorkspaceWidgetProps): React.ReactElement {
  const spanClass =
    span === 2
      ? "sm:col-span-2"
      : span === 3
        ? "xl:col-span-3"
        : span === 4
          ? "lg:col-span-4"
          : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={cn(spanClass, className)}
    >
      {children}
    </motion.div>
  );
}

export interface QuickActionItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface QuickActionsWidgetProps {
  actions: QuickActionItem[];
  title?: string;
}

export function QuickActionsWidget({
  actions,
  title = "Quick actions",
}: QuickActionsWidgetProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.a
              key={action.href}
              href={action.href}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="group flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
              {action.description ? (
                <span className="text-[10px] text-muted-foreground">{action.description}</span>
              ) : null}
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

export default WidgetGrid;
