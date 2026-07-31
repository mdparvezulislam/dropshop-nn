"use client";

import * as React from "react";
import { Loader2, AlertCircle, CheckCircle2, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function MobileLoadingState({ message = "লোড হচ্ছে..." }: { message?: string }): React.ReactElement {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3" aria-busy="true">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" aria-hidden />
      <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}

export function MobileEmptyState({
  title = "কোনো তথ্য পাওয়া যায়নি",
  description = "এই মুহূর্তে দেখানোর জন্য কোনো আইটেম নেই।",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="py-10 px-4 flex flex-col items-center justify-center text-center mobile-card my-4 space-y-3">
      <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600">
        <PackageOpen className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1 max-w-xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function MobileErrorState({
  title = "সমস্যা হয়েছে",
  description = "তথ্য লোড করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}): React.ReactElement {
  return (
    <div className="py-8 px-4 flex flex-col items-center justify-center text-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl my-4 space-y-3">
      <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" aria-hidden />
      <div className="space-y-1">
        <h3 className="text-sm font-black text-red-900 dark:text-red-200">{title}</h3>
        <p className="text-xs font-semibold text-red-700 dark:text-red-300">{description}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="touch-target h-10 px-4 text-xs font-black bg-red-600 text-white rounded-xl shadow-xs active:scale-95"
        >
          পুনরায় চেষ্টা করুন
        </button>
      )}
    </div>
  );
}

export function MobileSuccessState({
  title = "সফল হয়েছে!",
  description,
}: {
  title?: string;
  description?: string;
}): React.ReactElement {
  return (
    <div className="py-8 px-4 flex flex-col items-center justify-center text-center bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl my-4 space-y-2">
      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
      <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200">{title}</h3>
      {description && <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{description}</p>}
    </div>
  );
}

export function MobileBadge({
  children,
  variant = "amber",
  className,
}: {
  children: React.ReactNode;
  variant?: "amber" | "slate" | "green" | "red" | "blue";
  className?: string;
}): React.ReactElement {
  const variantStyles = {
    amber: "bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    green: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    red: "bg-red-100 dark:bg-red-950/50 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800",
    blue: "bg-blue-100 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border tracking-wide",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
