import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-semibold text-foreground/90 tracking-tight leading-none select-none",
        className,
      )}
      {...props}
    >
      {children}
      {required ? <span className="text-destructive font-bold ml-1">*</span> : null}
    </label>
  ),
);
Label.displayName = "Label";

export { Label };
export default Label;
