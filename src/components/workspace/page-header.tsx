import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  icon?: LucideIcon;
  separator?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  meta,
  icon: Icon,
  separator = false,
  className,
}: PageHeaderProps): React.ReactElement {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex items-start gap-3">
          {Icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs mt-0.5">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {title}
              </h1>
              {badge}
            </div>
            {description ? (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {description}
              </p>
            ) : null}
            {meta}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
      </div>
      {separator ? <div className="h-px w-full bg-border/80" /> : null}
    </div>
  );
}

export default PageHeader;
