"use client";

import * as React from "react";
import {
  Globe,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  List,
  Hash,
  Tag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useUrlImport } from "../hooks/use-url-import";
import type { StudioFormState } from "../hooks/use-product-studio";
import { ImportPreviewModal } from "./import-preview-modal";

export interface UrlImportBarProps {
  bulkUpdate: (partial: Partial<StudioFormState>) => void;
  className?: string;
}

function ProgressIndicator({ stage }: { stage: string }): React.ReactElement {
  const labels: Record<string, string> = {
    validating: "Validating URL...",
    fetching: "Fetching page...",
    extracting: "Extracting product info...",
    parsing: "Running smart parser...",
    "detecting-duplicates": "Checking for duplicates...",
  };

  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>{labels[stage] || "Processing..."}</span>
    </div>
  );
}

export function UrlImportBar({ bulkUpdate, className }: UrlImportBarProps): React.ReactElement {
  const [url, setUrl] = React.useState("");
  const [showPreview, setShowPreview] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { progress, importFromUrl, applyImport, dismissImport } = useUrlImport(bulkUpdate);

  const handleImport = () => {
    if (!url.trim()) return;
    importFromUrl(url.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleImport();
    }
  };

  const handleApply = () => {
    applyImport();
    setShowPreview(false);
  };

  const handleDismiss = () => {
    dismissImport();
    setShowPreview(false);
  };

  const isImporting =
    progress.stage !== "idle" && progress.stage !== "complete" && progress.stage !== "error";

  const result = progress.stage === "complete" ? progress.result : null;

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border transition-all duration-200",
          result
            ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10"
            : progress.stage === "error"
              ? "border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-950/10"
              : "border-border bg-card",
          "shadow-xs",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              result
                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : progress.stage === "error"
                  ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                  : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
            )}
          >
            {result ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : progress.stage === "error" ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-extrabold text-foreground">Product URL Import</span>
            <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
              Paste any supplier product URL — data auto-extracts
            </span>
          </div>

          {result && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-bold border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              onClick={() => setShowPreview(true)}
            >
              <FileText className="h-3.5 w-3.5" /> Review Import
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="px-4 pb-4 space-y-3">
          {/* URL Input Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (result) dismissImport();
                }}
                onKeyDown={handleKeyDown}
                placeholder="https://www.alibaba.com/product/... or any supplier URL"
                className="w-full h-10 sm:h-9 rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                disabled={isImporting}
              />
            </div>
            <Button
              type="button"
              className={cn(
                "h-10 sm:h-9 gap-1.5 font-bold text-xs shrink-0",
                "bg-indigo-500 hover:bg-indigo-600 text-white shadow-xs",
              )}
              onClick={handleImport}
              disabled={isImporting || !url.trim()}
            >
              {isImporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )}
              {isImporting ? "Importing..." : "Import URL"}
            </Button>
          </div>

          {/* Progress Indicator */}
          {isImporting && <ProgressIndicator stage={progress.stage} />}

          {/* Error State */}
          {progress.stage === "error" && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{progress.error}</span>
              </div>
              <button
                type="button"
                onClick={dismissImport}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Complete State — Compact Summary */}
          {result && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {result.summary.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
                >
                  {item.includes("Specification") ? (
                    <Hash className="h-3 w-3" />
                  ) : item.includes("Feature") ? (
                    <List className="h-3 w-3" />
                  ) : item.includes("Image") ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : item.includes("Duplicate") ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <Tag className="h-3 w-3" />
                  )}
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {result && showPreview && (
        <ImportPreviewModal result={result} onApply={handleApply} onDismiss={handleDismiss} />
      )}
    </>
  );
}
