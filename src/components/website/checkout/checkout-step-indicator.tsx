"use client";

import type { ReactElement } from "react";
import { Check } from "lucide-react";

export type CheckoutStep = "shipping" | "delivery" | "payment" | "review";

export interface CheckoutStepIndicatorProps {
  currentStep: CheckoutStep;
}

const STEPS: ReadonlyArray<{ id: CheckoutStep; label: string; number: number }> = [
  { id: "shipping", label: "ঠিকানা", number: 1 },
  { id: "delivery", label: "ডেলিভারি", number: 2 },
  { id: "payment", label: "পেমেন্ট", number: 3 },
  { id: "review", label: "কনফার্মেশন", number: 4 },
];

export function CheckoutStepIndicator({ currentStep }: CheckoutStepIndicatorProps): ReactElement {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 shadow-xs">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="flex items-center gap-1.5 sm:gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-2xs"
                      : isCurrent
                        ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden /> : step.number}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-extrabold ${
                    isCurrent
                      ? "text-slate-900 dark:text-slate-100 font-black"
                      : isDone
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 sm:mx-2 rounded-full transition-colors ${
                    idx < currentIndex
                      ? "bg-emerald-500"
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CheckoutStepIndicator;
