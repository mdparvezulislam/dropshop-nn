import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9.5 w-full rounded-lg border bg-card px-3 py-1.5 text-sm text-foreground shadow-2xs transition-all duration-150",
          "file:border-0 file:bg-transparent file:text-sm file:font-semibold",
          "placeholder:text-muted-foreground/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-destructive/60 focus-visible:ring-destructive/30 focus-visible:border-destructive"
            : success
              ? "border-success/60 focus-visible:ring-success/30 focus-visible:border-success"
              : "border-input/90",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

/* ── Floating Label Input ── */
export interface FloatingInputProps extends InputProps {
  label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, id, error, success, ...props }, ref) => {
    const inputId = id || `floating-${label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          placeholder=" "
          error={error}
          success={success}
          className={cn("peer pt-4 pb-1 h-11", className)}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none transition-all duration-150 origin-left select-none",
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:scale-100",
            "peer-focus:top-2 peer-focus:text-[10px] peer-focus:scale-90 peer-focus:text-primary",
            "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:scale-90",
          )}
        >
          {label}
        </label>
      </div>
    );
  },
);
FloatingInput.displayName = "FloatingInput";

export { Input, FloatingInput };
export default Input;
