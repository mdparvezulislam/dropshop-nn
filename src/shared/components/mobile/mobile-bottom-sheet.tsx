"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: MobileBottomSheetProps): React.ReactElement | null {
  const sheetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "বটম শিট"}
        className={cn(
          "relative z-50 w-full max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 animate-in slide-in-from-bottom duration-250 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          className,
        )}
      >
        {/* Drag Handle Indicator */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 pointer-events-none" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              {title && (
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="touch-target h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              aria-label="বন্ধ করুন"
            >
              <X className="h-4.5 w-4.5" aria-hidden />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default MobileBottomSheet;
