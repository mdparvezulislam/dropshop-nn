"use client";

import * as React from "react";
import { toast } from "sonner";
import { Warehouse, AlertTriangle, Boxes, History } from "lucide-react";
import { ListLayout } from "@/components/workspace/list-layout";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Spinner } from "@/components/ui/spinner";

type Row = {
  id: string;
  productName: string;
  sku: string;
  available: number;
  reserved: number;
  incoming: number;
  status: string;
};

export default function SupplierInventoryPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    async function load() {
      try {
        const { listInventoryAction } = await import("@/features/inventory/actions/inventory-actions");
        const res = await listInventoryAction({ limit: 100 });
        if (res.success && res.data) {
          const raw = res.data as any;
          const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
          setRows(items.map((inv: any) => ({
            id: inv.id ?? inv._id,
            productName: inv.productName ?? inv.product?.name ?? "—",
            sku: inv.sku ?? inv.variantSku ?? "—",
            available: inv.available ?? inv.onHand ?? 0,
            reserved: inv.reserved ?? 0,
            incoming: inv.incoming ?? 0,
            status: inv.status ?? "active",
          })));
        }
      } catch {
        toast.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns: DataTableColumn<Row>[] = [
    {
      id: "product",
      header: "Product",
      cell: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.productName}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{r.sku}</div>
        </div>
      ),
    },
    {
      id: "available",
      header: "Available",
      cell: (r) => (
        <span className={r.available <= 0 ? "text-destructive font-medium tabular-nums" : "tabular-nums"}>
          {r.available}
        </span>
      ),
    },
    {
      id: "reserved",
      header: "Reserved",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.reserved}</span>,
    },
    {
      id: "incoming",
      header: "Incoming",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.incoming}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
  ];

  return (
    <ListLayout
      header={{ title: "Inventory", description: "Monitor your stock levels and incoming supply" }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Total SKUs" value={rows.length} icon={Boxes} />
            <StatCard label="In Stock" value={rows.filter((r) => r.available > 0).length} accent="success" />
            <StatCard label="Low Stock" value={rows.filter((r) => r.available > 0 && r.available < 10).length} icon={AlertTriangle} accent="warning" />
            <StatCard label="Out of Stock" value={rows.filter((r) => r.available <= 0).length} icon={AlertTriangle} accent="danger" />
          </>
        )
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyTitle="No inventory records"
        emptyDescription="Stock information will appear here when products have inventory records."
      />
    </ListLayout>
  );
}
