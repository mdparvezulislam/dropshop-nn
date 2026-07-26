"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SpecificationField } from "../types/studio-types";

/* ─────────────────────────────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────────────────────────────── */

export interface InlineSpecEditorProps {
  specs?: SpecificationField[];
  onChange?: (specs: SpecificationField[]) => void;
  className?: string;
  /** Max number of rows before warning */
  maxRows?: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────────────────── */

export function InlineSpecEditor({
  specs = [],
  onChange,
  className,
  maxRows = 50,
}: InlineSpecEditorProps): React.ReactElement {
  /* Ensure every spec has a stable "local" id for list management */
  const [rows, setRows] = React.useState<Array<SpecificationField & { _lid: string }>>(() =>
    specs.map((s) => ({ ...s, _lid: `spec_${Math.random().toString(36).slice(2, 8)}` })),
  );

  /* Sync from external specs changes (e.g. parser fill) */
  React.useEffect(() => {
    setRows((prev) => {
      const prevKeys = new Map(prev.map((r) => [r.key.toLowerCase(), r]));
      const merged: Array<SpecificationField & { _lid: string }> = [];

      for (const s of specs) {
        const existing = prevKeys.get(s.key.toLowerCase());
        if (existing) {
          // Keep existing row data (may have been edited)
          merged.push(existing);
          prevKeys.delete(s.key.toLowerCase());
        } else {
          merged.push({ ...s, _lid: `spec_${Math.random().toString(36).slice(2, 8)}` });
        }
      }

      return merged;
    });
  }, [specs]);

  const emitChange = React.useCallback(
    (updated: Array<SpecificationField & { _lid: string }>) => {
      setRows(updated);
      onChange?.(updated.map(({ _lid, ...spec }) => spec));
    },
    [onChange],
  );

  const handleKeyChange = (lid: string, newKey: string) => {
    emitChange(rows.map((r) => (r._lid === lid ? { ...r, key: newKey, label: newKey } : r)));
  };

  const handleValueChange = (lid: string, newValue: string) => {
    emitChange(rows.map((r) => (r._lid === lid ? { ...r, value: newValue } : r)));
  };

  const handleAddRow = () => {
    if (rows.length >= maxRows) return;
    const newRow = {
      key: "",
      label: "",
      type: "text" as const,
      value: "",
      group: "General",
      _lid: `spec_${Math.random().toString(36).slice(2, 8)}`,
    };
    emitChange([...rows, newRow]);
  };

  const handleRemoveRow = (lid: string) => {
    emitChange(rows.filter((r) => r._lid !== lid));
  };

  const handleKeyDown = (e: React.KeyboardEvent, lid: string, field: "key" | "value") => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Focus next row's key input
      const idx = rows.findIndex((r) => r._lid === lid);
      if (idx >= 0 && idx < rows.length - 1) {
        const nextLid = rows[idx + 1]._lid;
        const nextInput = document.querySelector<HTMLInputElement>(
          `[data-spec-id="${nextLid}"][data-spec-field="key"]`,
        );
        nextInput?.focus();
      } else if (idx >= 0 && idx === rows.length - 1) {
        // On last row's value Enter → add new row
        handleAddRow();
      }
    }
    if (e.key === "Escape") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const hasValues = rows.length > 0 && rows.some((r) => r.key || r.value);

  if (!hasValues && specs.length === 0) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            No specifications yet. Use{" "}
            <span className="font-bold text-foreground">⚡ Magic Parse</span> to extract them from
            the product description, or add them manually below.
          </p>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add First Specification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="grid grid-cols-[1fr_2fr_32px] gap-3 px-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Attribute
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Value
        </div>
        <div />
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row._lid}
            className="group grid grid-cols-[1fr_2fr_32px] gap-3 items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40 focus-within:bg-muted/30 focus-within:ring-1 focus-within:ring-primary/20"
          >
            <input
              data-spec-id={row._lid}
              data-spec-field="key"
              type="text"
              value={row.key}
              onChange={(e) => handleKeyChange(row._lid, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, row._lid, "key")}
              placeholder="e.g. Display"
              className="studio-input h-8 text-sm font-semibold bg-transparent border-0 border-b-2 border-transparent focus:border-primary/40 focus:bg-transparent focus:ring-0 px-0 rounded-none"
            />
            <input
              data-spec-id={row._lid}
              data-spec-field="value"
              type="text"
              value={String(row.value)}
              onChange={(e) => handleValueChange(row._lid, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, row._lid, "value")}
              placeholder="e.g. 6.7 inch"
              className="studio-input h-8 text-sm bg-transparent border-0 border-b-2 border-transparent focus:border-primary/40 focus:bg-transparent focus:ring-0 px-0 rounded-none"
            />
            <button
              type="button"
              onClick={() => handleRemoveRow(row._lid)}
              className="flex h-10 sm:h-8 w-10 sm:w-8 items-center justify-center rounded-xl sm:rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all focus:opacity-100 focus:ring-2 focus:ring-ring/60"
              aria-label={`Remove ${row.key || "specification"}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Row */}
      <button
        type="button"
        onClick={handleAddRow}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Row
      </button>

      {rows.length >= maxRows && (
        <p className="text-xs text-warning">Maximum {maxRows} specifications reached.</p>
      )}
    </div>
  );
}
