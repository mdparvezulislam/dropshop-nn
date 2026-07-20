"use client";

import * as React from "react";
import { toast } from "sonner";
import { Receipt, Download, Eye } from "lucide-react";
import { listInvoicesAction } from "@/features/finance/actions/finance-actions";
import { ListLayout } from "@/shared/components/workspace/list-layout";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

type Row = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
};

export default function WholesaleInvoicesPage(): React.ReactElement {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await listInvoicesAction();
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : [];
          setRows(items.map((inv: any) => ({
            id: inv.id ?? inv._id,
            invoiceNumber: inv.invoiceNumber ?? inv._id?.slice(-8) ?? "—",
            amount: inv.amount ?? inv.grandTotal ?? 0,
            status: inv.status ?? "pending",
            dueDate: inv.dueDate ?? "",
            createdAt: inv.createdAt,
          })));
        }
      } catch {
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<Row>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      cell: (r) => <span className="font-mono text-sm font-medium">{r.invoiceNumber}</span>,
    },
    {
      id: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (r) => <span className="font-semibold tabular-nums">{formatCents(r.amount)}</span>,
    },
    {
      id: "dueDate",
      header: "Due Date",
      cell: (r) => {
        const due = r.dueDate ? new Date(r.dueDate) : null;
        const overdue = due && due < new Date() && r.status !== "paid" && r.status !== "completed";
        return (
          <span className={overdue ? "text-destructive font-medium" : "text-muted-foreground"}>
            {due ? due.toLocaleDateString() : "—"}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      header={{
        title: "Invoices",
        description: "View and download your invoices",
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Total Invoices" value={rows.length} icon={Receipt} />
            <StatCard label="Paid" value={rows.filter((r) => r.status === "paid" || r.status === "completed").length} accent="success" />
            <StatCard label="Pending" value={rows.filter((r) => r.status === "pending" || r.status === "due").length} accent="warning" />
          </>
        )
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyTitle="No invoices yet"
        emptyDescription="Invoices will appear here after placing orders."
      />
    </ListLayout>
  );
}
