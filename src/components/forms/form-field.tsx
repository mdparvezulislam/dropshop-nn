import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  success?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  success,
  children,
  className,
}: FormFieldProps): React.ReactElement {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
        {success ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-[11px] font-medium text-destructive animate-fade-in" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default FormField;
