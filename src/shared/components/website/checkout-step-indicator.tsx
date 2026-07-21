"use client";

import { cn } from "@/shared/utils/cn";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

interface CheckoutStepIndicatorProps {
  steps: Step[];
  currentStep: string;
  onStepClick?: (step: string) => void;
}

export function CheckoutStepIndicator({ steps, currentStep, onStepClick }: CheckoutStepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!onStepClick || i > currentIndex}
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                "flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors",
                isComplete && "text-success",
                isCurrent && "text-foreground",
                !isComplete && !isCurrent && "text-foreground/30",
                onStepClick && i <= currentIndex && "cursor-pointer hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                  isComplete && "bg-success border-success text-white",
                  isCurrent && "border-primary text-primary",
                  !isComplete && !isCurrent && "border-foreground/20 text-foreground/30",
                )}
              >
                {isComplete ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2 sm:mx-4",
                  isComplete ? "bg-success" : "bg-border/60",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
