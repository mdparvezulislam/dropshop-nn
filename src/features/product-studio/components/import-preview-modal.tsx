"use client";

import * as React from "react";
import {
  Globe,
  FileText,
  Hash,
  List,
  ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Tag,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { ImportResult } from "../utils/url-importer/types";

export interface ImportPreviewModalProps {
  result: ImportResult;
  onApply: () => void;
  onDismiss: () => void;
}

function SummaryRow({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number | string;
  color: string;
}): React.ReactElement {
  return (
    <div className={cn("flex items-center gap-2.5 p-3 rounded-xl border transition-all", color)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/80">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground">
          {typeof count === "number" ? `${count} item${count !== 1 ? "s" : ""}` : count}
        </div>
      </div>
    </div>
  );
}

export function ImportPreviewModal({
  result,
  onApply,
  onDismiss,
}: ImportPreviewModalProps): React.ReactElement {
  const { extracted, parsed, duplicates, summary } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Globe className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">Import Preview</h2>
              <p className="text-[11px] text-muted-foreground">
                Review extracted data before applying
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Page Title */}
          {(extracted.pageTitle || parsed.title) && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Product Name
              </div>
              <div className="text-sm font-bold text-foreground">
                {extracted.pageTitle || parsed.title}
              </div>
            </div>
          )}

          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-2">
            <SummaryRow
              icon={<FileText className="h-4 w-4 text-blue-500" />}
              label="Description"
              count={extracted.description ? "Detected" : "Not found"}
              color="bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20"
            />
            <SummaryRow
              icon={<Hash className="h-4 w-4 text-purple-500" />}
              label="Specifications"
              count={extracted.specifications.length}
              color="bg-purple-50/50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/20"
            />
            <SummaryRow
              icon={<List className="h-4 w-4 text-amber-500" />}
              label="Features"
              count={extracted.features.length}
              color="bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20"
            />
            <SummaryRow
              icon={<ImageIcon className="h-4 w-4 text-emerald-500" />}
              label="Images"
              count={extracted.images.length}
              color="bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
            />
            <SummaryRow
              icon={<Tag className="h-4 w-4 text-rose-500" />}
              label="Brand"
              count={extracted.brandHint || "Not detected"}
              color="bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20"
            />
            <SummaryRow
              icon={<Sparkles className="h-4 w-4 text-indigo-500" />}
              label="Category"
              count={extracted.categoryHint || "Not detected"}
              color="bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20"
            />
          </div>

          {/* Smart Parse Summary */}
          {parsed.keywords && parsed.keywords.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Extracted Keywords
              </div>
              <div className="flex flex-wrap gap-1">
                {parsed.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Preview (truncated) */}
          {extracted.specifications.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Specifications ({extracted.specifications.length})
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {extracted.specifications.slice(0, 10).map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-foreground shrink-0">{spec.key}:</span>
                    <span className="text-muted-foreground truncate">{spec.value}</span>
                  </div>
                ))}
                {extracted.specifications.length > 10 && (
                  <div className="text-[10px] text-muted-foreground font-semibold pt-1">
                    +{extracted.specifications.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duplicate Warnings */}
          {duplicates.length > 0 && (
            <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Possible Duplicate{duplicates.length > 1 ? "s" : ""} Detected
                </span>
              </div>
              {duplicates.map((d, i) => (
                <div key={i} className="text-[11px] text-amber-600 dark:text-amber-500 ml-6">
                  {d.type.toUpperCase()} &quot;{d.value}&quot; matches &quot;{d.existingProductName}
                  &quot;
                </div>
              ))}
              <div className="text-[10px] text-muted-foreground mt-1 ml-6">
                You can still apply the import — duplicate fields will be flagged.
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="flex flex-wrap gap-1">
            {summary.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-2.5 w-2.5" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="text-xs font-semibold"
          >
            Discard
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="text-xs font-semibold"
            >
              Edit Manually
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-xs"
              onClick={onApply}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Apply to Studio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
