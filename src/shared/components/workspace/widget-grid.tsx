"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { ArrowUpRight } from "lucide-react";

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
    <div className={cn("grid gap-4 sm:gap-5", COL_CLASS[columns], className)}>{children}</div>
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
      transition={{ delay, duration: 0.2 }}
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
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
            >
              <Link
                href={action.href}
                className="group relative flex flex-col justify-between h-full rounded-xl border border-border/80 bg-card p-3.5 transition-all duration-200 hover:border-primary/40 hover:bg-card/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-all group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground shadow-2xs">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {action.label}
                  </span>
                  {action.description ? (
                    <span className="block text-[10px] text-muted-foreground/80 truncate mt-0.5">
                      {action.description}
                    </span>
                  ) : null}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default WidgetGrid;
