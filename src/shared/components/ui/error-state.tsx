import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "./button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  className,
  title = "An error occurred",
  description = "Something went wrong while loading this section.",
  actionLabel = "Try Again",
  onRetry,
  compact = false,
  ...props
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-xs",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="truncate font-medium">{description || title}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 font-semibold hover:underline shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-destructive/20 rounded-xl bg-destructive/5 backdrop-blur-xs",
        className,
      )}
      {...props}
    >
      <div className="p-3.5 rounded-2xl bg-destructive/10 text-destructive mb-4 border border-destructive/20 shadow-xs">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="destructive" size="sm">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
