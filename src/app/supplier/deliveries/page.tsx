"use client";

import * as React from "react";
import { toast } from "sonner";
import { Truck, Package, Clock, CheckCircle2 } from "lucide-react";
import { ListLayout } from "@/components/workspace/list-layout";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type Row = {
  id: string;
  orderRef: string;
  product: string;
  quantity: number;
  status: string;
  deliveryDate: string;
  carrier: string;
};

export default function SupplierDeliveriesPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    async function load() {
      try {
        const { listOrdersAction } = await import("@/features/order/actions/order-actions");
        const res = await listOrdersAction({ limit: 50 });
        if (res.success && res.data) {
          const raw = res.data as any;
          const items = raw?.items ?? (Array.isArray(raw) ? raw : []);
          const mapped: Row[] = [];
          items.forEach((o: any) => {
            (o.items ?? []).forEach((item: any, i: number) => {
              mapped.push({
                id: `${o._id ?? o.id}_${i}`,
                orderRef: o.orderNumber ?? o._id?.slice(-6) ?? "—",
                product: item.productName ?? item.name ?? "—",
                quantity: item.quantity ?? 0,
                status: o.status ?? "pending",
                deliveryDate: o.deliveryDate ?? o.tracking?.deliveryDate ?? "",
                carrier: o.carrierName ?? o.tracking?.carrier ?? "—",
              });
            });
          });
          setRows(mapped);
        }
      } catch {
        toast.error("Failed to load deliveries");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns: DataTableColumn<Row>[] = [
    {
      id: "orderRef",
      header: "Order #",
      cell: (r) => <span className="font-mono text-sm">{r.orderRef}</span>,
    },
    {
      id: "product",
      header: "Product",
      cell: (r) => <span>{r.product}</span>,
    },
    {
      id: "qty",
      header: "Qty",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.quantity}</span>,
    },
    {
      id: "carrier",
      header: "Carrier",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{r.carrier}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "deliveryDate",
      header: "Delivery",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <ListLayout
      header={{ title: "Deliveries", description: "Track shipment and delivery status" }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground"><Spinner size="sm" /> Loading…</div>
        ) : (
          <>
            <StatCard label="Total Items" value={rows.length} icon={Truck} />
            <StatCard label="Delivered" value={rows.filter((r) => ["delivered", "completed"].includes(r.status)).length} icon={CheckCircle2} accent="success" />
            <StatCard label="In Transit" value={rows.filter((r) => ["shipped", "out_for_delivery", "courier_assigned"].includes(r.status)).length} icon={Clock} accent="info" />
          </>
        )
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyTitle="No deliveries"
        emptyDescription="Deliveries will appear here when orders are placed."
      />
    </ListLayout>
  );
}
