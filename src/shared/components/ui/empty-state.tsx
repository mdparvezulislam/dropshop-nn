import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  className,
  title = "No data found",
  description = "There are no records to display at the moment.",
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-slate-900/5 dark:bg-slate-900/20",
        className,
      )}
      {...props}
    >
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
