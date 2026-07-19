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
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-10 border border-dashed border-border rounded-xl bg-muted/20",
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
