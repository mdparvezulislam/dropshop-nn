"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  X,
  Printer,
  Truck,
  UserCheck,
  Download,
  Ban,
  Tag,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface OrderBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

export function OrderBulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
}: OrderBulkActionBarProps): React.ReactElement | null {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-3xl rounded-2xl bg-slate-900/95 text-white p-3 shadow-2xl backdrop-blur-md border border-slate-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5">
      {/* Left: Selected Counter */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-mono">
          {selectedCount}
        </div>
        <div>
          <p className="text-xs font-extrabold text-white leading-tight">
            {selectedCount} {selectedCount === 1 ? "Order" : "Orders"} Selected
          </p>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-[11px] text-slate-400 hover:text-amber-400 font-semibold underline flex items-center gap-0.5"
          >
            Clear selection
          </button>
        </div>
      </div>

      {/* Right: Bulk Action Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onBulkAction("confirm")}
          className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shrink-0"
        >
          Confirm
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onBulkAction("book_courier")}
          className="h-8 px-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white border-0 shrink-0"
        >
          <Truck className="h-3.5 w-3.5 mr-1" /> Courier
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onBulkAction("print_invoice")}
          className="h-8 px-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shrink-0"
        >
          <Printer className="h-3.5 w-3.5 mr-1" /> Invoice
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onBulkAction("export")}
          className="h-8 px-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shrink-0"
        >
          <Download className="h-3.5 w-3.5 mr-1" /> Export
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onBulkAction("cancel")}
          className="h-8 px-2 text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 shrink-0"
        >
          <Ban className="h-3.5 w-3.5" />
        </Button>

        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default OrderBulkActionBar;
