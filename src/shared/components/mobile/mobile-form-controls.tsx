"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

const mobileInputBase =
  "w-full h-12 min-h-[48px] px-3.5 rounded-xl border bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 placeholder:font-medium transition-colors shadow-2xs " +
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-amber-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800";

export interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ElementType;
}

export function MobileInput({
  className,
  error,
  icon: Icon,
  ...props
}: MobileInputProps): React.ReactElement {
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none"
          aria-hidden
        />
      )}
      <input
        aria-invalid={error || undefined}
        className={cn(
          mobileInputBase,
          Icon && "pl-10.5",
          error
            ? "border-red-500 text-red-900 dark:text-red-300 focus-visible:outline-red-500"
            : "border-slate-300 dark:border-slate-700",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function MobileTextarea({
  className,
  error,
  ...props
}: MobileTextareaProps): React.ReactElement {
  return (
    <textarea
      aria-invalid={error || undefined}
      className={cn(
        mobileInputBase,
        "h-auto py-3 resize-y leading-relaxed",
        error
          ? "border-red-500 text-red-900 dark:text-red-300 focus-visible:outline-red-500"
          : "border-slate-300 dark:border-slate-700",
        className,
      )}
      {...props}
    />
  );
}

export interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function MobileButton({
  className,
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: MobileButtonProps): React.ReactElement {
  const variantStyles = {
    primary: "bg-amber-500 hover:bg-amber-600 active:bg-amber-600 text-slate-950 shadow-xs",
    secondary: "bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-950 shadow-xs",
    outline: "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-xs",
    ghost: "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  };

  const sizeStyles = {
    sm: "h-10 min-h-[44px] px-3.5 text-xs rounded-xl font-extrabold",
    md: "h-12 min-h-[48px] px-4 text-sm rounded-xl font-black",
    lg: "h-13 min-h-[52px] px-5 text-base rounded-2xl font-black",
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "touch-target flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-amber-500",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>অপেক্ষা করুন...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
