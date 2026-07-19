import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "./button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  className,
  title = "An error occurred",
  description = "Something went wrong while loading this section.",
  actionLabel = "Try Again",
  onRetry,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-destructive/20 rounded-xl bg-destructive/5",
        className,
      )}
      {...props}
    >
      <div className="p-4 rounded-full bg-destructive/10 text-destructive-foreground mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="destructive" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
