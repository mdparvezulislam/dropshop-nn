import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
  compact?: boolean;
}

export function EmptyState({
  className,
  title = "No data found",
  description = "There are no records to display at the moment.",
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
  compact = false,
  ...props
}: EmptyStateProps): React.ReactElement {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 p-4 border border-dashed border-border/70 rounded-lg bg-card/50",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-foreground truncate">{title}</h4>
            {description ? (
              <p className="text-[11px] text-muted-foreground truncate">{description}</p>
            ) : null}
          </div>
        </div>
        {actionLabel && onAction ? (
          <Button onClick={onAction} variant="outline" size="sm" className="shrink-0 text-xs h-7 px-2.5">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border/80 rounded-xl bg-card/40 backdrop-blur-xs",
        className,
      )}
      {...props}
    >
      <div className="mb-4 relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5 text-primary shadow-xs">
        <Icon className="h-7 w-7" />
        <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-md -z-10" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} variant="default" size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
