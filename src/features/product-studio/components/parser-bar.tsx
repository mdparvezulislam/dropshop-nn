"use client";

import * as React from "react";
import { Sparkles, ChevronDown, ChevronUp, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────────────────────────────── */

export interface ParserBarProps {
  onParse: (text: string) => void;
  onClear?: () => void;
  isParsing?: boolean;
  summary?: string[];
  className?: string;
  /** Initial placeholder text */
  placeholder?: string;
  /** Collapsed by default on mobile */
  defaultCollapsed?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────────────────── */

export function ParserBar({
  onParse,
  onClear,
  isParsing = false,
  summary = [],
  className,
  placeholder = "Paste product URL, supplier text, HTML, marketing copy, or any product description here…",
  defaultCollapsed = false,
}: ParserBarProps): React.ReactElement {
  const [text, setText] = React.useState("");
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [hasParsed, setHasParsed] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleParse = () => {
    if (!text.trim() || isParsing) return;
    onParse(text);
    setHasParsed(true);
  };

  const handleClear = () => {
    setText("");
    setHasParsed(false);
    onClear?.();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd+Enter or Ctrl+Enter to parse
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        hasParsed
          ? "border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10"
          : "border-border bg-card",
        collapsed ? "shadow-2xs" : "shadow-xs",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-extrabold text-foreground">Smart Product Parse</span>
            <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
              Paste any product text — fields auto-populate
            </span>
          </div>
          {isParsing && <Loader2 className="h-4 w-4 animate-spin text-amber-500 shrink-0" />}
        </div>

        <div className="flex items-center gap-1.5">
          {hasParsed && summary.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 inline mr-1" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={collapsed ? "Expand parser" : "Collapse parser"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Body (collapsible) */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (hasParsed) setHasParsed(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
            disabled={isParsing}
          />

          {/* Parse bar footer */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {/* Summary chips */}
              {hasParsed && summary.length > 0
                ? summary.slice(0, 5).map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {item}
                    </span>
                  ))
                : hasParsed && (
                    <span className="text-xs text-muted-foreground italic">
                      No attributes could be extracted. Try pasting more detailed text.
                    </span>
                  )}
              {summary.length > 5 && (
                <span className="text-[11px] text-muted-foreground font-semibold">
                  +{summary.length - 5} more
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {text.length} chars
              </span>
              <Button
                type="button"
                size="sm"
                className="gap-1.5 font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 dark:text-amber-950 shadow-xs"
                onClick={handleParse}
                disabled={isParsing || !text.trim()}
              >
                <Sparkles className="h-3.5 w-3.5 fill-amber-950 dark:fill-amber-950" />
                {isParsing ? "Parsing…" : "⚡ Magic Parse"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed state — compact summary bar */}
      {collapsed && hasParsed && summary.length > 0 && (
        <div className="px-4 pb-2.5 flex items-center gap-2 flex-wrap">
          {summary.slice(0, 3).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
            >
              <CheckCircle2 className="h-2.5 w-2.5" />
              {item}
            </span>
          ))}
          {summary.length > 3 && (
            <span className="text-[10px] text-muted-foreground font-semibold">
              +{summary.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
