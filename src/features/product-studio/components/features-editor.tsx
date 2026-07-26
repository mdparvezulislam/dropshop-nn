"use client";

import * as React from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────────────────────────────── */

export interface FeaturesEditorProps {
  features?: string[];
  onChange?: (features: string[]) => void;
  className?: string;
  maxFeatures?: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────────────────── */

export function FeaturesEditor({
  features = [],
  onChange,
  className,
  maxFeatures = 20,
}: FeaturesEditorProps): React.ReactElement {
  const emitChange = React.useCallback(
    (updated: string[]) => {
      onChange?.(updated);
    },
    [onChange],
  );

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    emitChange(updated);
  };

  const handleRemoveFeature = (index: number) => {
    emitChange(features.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (features.length >= maxFeatures) return;
    emitChange([...features, ""]);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (index === features.length - 1) {
        handleAddFeature();
      } else {
        // Focus next feature
        const nextInput = document.querySelector<HTMLInputElement>(
          `[data-feature-index="${index + 1}"]`,
        );
        nextInput?.focus();
      }
    }
    if (e.key === "Escape") {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Backspace" && features[index] === "" && features.length > 1) {
      handleRemoveFeature(index);
      // Focus previous
      const prevInput = document.querySelector<HTMLInputElement>(
        `[data-feature-index="${Math.max(0, index - 1)}"]`,
      );
      prevInput?.focus();
    }
  };

  const nonEmptyFeatures = features.filter((f) => f.trim().length > 0);

  if (!features.length) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Key Features & Highlights</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Use <span className="font-bold text-foreground">⚡ Magic Parse</span> to extract
            features from the product description, or add them manually.
          </p>
          <button
            type="button"
            onClick={handleAddFeature}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Feature
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          Key Features & Highlights
          {nonEmptyFeatures.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({nonEmptyFeatures.length})
            </span>
          )}
        </h3>
      </div>

      <div className="space-y-1.5">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted/40 focus-within:bg-muted/30"
          >
            <span className="text-sm text-muted-foreground shrink-0 select-none">•</span>
            <input
              data-feature-index={index}
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder="Enter a feature or highlight..."
              className="flex-1 h-8 text-sm bg-transparent border-0 border-b-2 border-transparent focus:border-primary/40 focus:bg-transparent focus:ring-0 px-0 rounded-none"
            />
            <button
              type="button"
              onClick={() => handleRemoveFeature(index)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all focus:opacity-100 focus:ring-2 focus:ring-ring/60"
              aria-label={`Remove feature ${index + 1}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {features.length < maxFeatures && (
        <button
          type="button"
          onClick={handleAddFeature}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Feature
        </button>
      )}

      {features.length >= maxFeatures && (
        <p className="text-xs text-warning mt-1">Maximum {maxFeatures} features.</p>
      )}
    </div>
  );
}
