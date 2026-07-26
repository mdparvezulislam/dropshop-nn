"use client";

import * as React from "react";
import { History, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getAllPriceHistoryAction } from "@/features/pricing/actions/pricing-engine-actions";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/workspace/section-header";
import { formatCentsToCurrency } from "@/lib/utils/currency-utils";

type Entry = {
  id: string;
  productId: string;
  variantSku?: string;
  field: string;
  oldValue: number;
  newValue: number;
  changedByName?: string;
  reason?: string;
  source: string;
  createdAt: string;
};

export default function PriceHistoryPage(): React.ReactElement {
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await getAllPriceHistoryAction();
    if (res.success)
      setEntries(
        ((res.data ?? []) as any[]).map((e: any) => ({
          ...e,
          createdAt: e.createdAt?.toString() ?? new Date().toISOString(),
        })),
      );
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<Entry>[] = [
    {
      id: "product",
      header: "Product",
      cell: (r) => (
        <div>
          <div className="font-mono text-xs">{r.productId.slice(0, 12)}...</div>
          {r.variantSku && <div className="text-[10px] text-muted-foreground">{r.variantSku}</div>}
        </div>
      ),
    },
    {
      id: "field",
      header: "Field",
      cell: (r) => (
        <Badge variant="soft" size="xs">
          {r.field.replace(/([A-Z])/g, " $1").trim()}
        </Badge>
      ),
    },
    {
      id: "oldValue",
      header: "Old Value",
      cell: (r) => (
        <span className="tabular-nums text-destructive">
          {formatCentsToCurrency(r.oldValue, "BDT")}
        </span>
      ),
    },
    {
      id: "newValue",
      header: "New Value",
      cell: (r) => (
        <span className="tabular-nums text-success font-semibold">
          {formatCentsToCurrency(r.newValue, "BDT")}
        </span>
      ),
    },
    {
      id: "by",
      header: "Changed By",
      cell: (r) => <span className="text-xs">{r.changedByName ?? "System"}</span>,
    },
    {
      id: "source",
      header: "Source",
      cell: (r) => (
        <Badge variant="muted" size="xs">
          {r.source}
        </Badge>
      ),
    },
    {
      id: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (r) => <span className="text-xs">{new Date(r.createdAt).toLocaleString()}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: (r) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => toast.success("Restore feature coming soon")}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Price History"
        description="মূল্য পরিবর্তনের ইতিহাস — সব পরিবর্তন ট্র্যাক করুন ও পূর্বাবস্থায় ফিরুন"
        icon={History}
      />
      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        emptyTitle="No price history"
        emptyDescription="Price changes will be recorded here automatically."
      />
    </div>
  );
}
