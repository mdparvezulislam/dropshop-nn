import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-all duration-150",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary/50",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          error
            ? "border-destructive/60 focus-visible:ring-destructive/30 focus-visible:border-destructive"
            : success
              ? "border-success/60 focus-visible:ring-success/30 focus-visible:border-success"
              : "border-input",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
export default Textarea;
