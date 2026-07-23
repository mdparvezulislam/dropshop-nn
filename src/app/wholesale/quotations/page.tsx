"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Plus, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListLayout } from "@/components/workspace/list-layout";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Spinner } from "@/components/ui/spinner";
import { RequestQuoteForm } from "./request-quote-form";

type Row = {
  id: string;
  quoteNumber: string;
  itemCount: number;
  grandTotal: number;
  status: string;
  validUntil: string;
  createdAt: string;
};

export default function WholesaleQuotationsPage(): React.ReactElement {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { listQuotationsAction } = await import("@/features/quotation/actions/quotation-actions");
      const res = await listQuotationsAction();
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : [];
        setRows(items.map((q: any) => ({
          id: q.id,
          quoteNumber: q.quoteNumber,
          itemCount: q.items?.length ?? 0,
          grandTotal: q.grandTotal ?? 0,
          status: q.status ?? "draft",
          validUntil: q.validUntil ?? "",
          createdAt: q.createdAt,
        })));
      }
    } catch {
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<Row>[] = [
    {
      id: "quoteNumber",
      header: "Quote #",
      cell: (r) => <span className="font-mono text-sm font-medium">{r.quoteNumber}</span>,
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
      id: "items",
      header: "Items",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.itemCount}</span>,
    },
    {
      id: "total",
      header: "Total",
      cell: (r) => <span className="font-semibold tabular-nums">{formatCents(r.grandTotal)}</span>,
    },
    {
      id: "validUntil",
      header: "Valid Until",
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.validUntil ? new Date(r.validUntil).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
  ];

  if (showForm) {
    return (
      <RequestQuoteForm
        onBack={() => setShowForm(false)}
        onSuccess={() => { setShowForm(false); load(); }}
      />
    );
  }

  return (
    <ListLayout
      header={{
        title: "Quotations",
        description: "Request and manage price quotations",
        actions: (
          <Button className="gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Request Quote
          </Button>
        ),
      }}
      stats={
        loading ? (
          <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <StatCard label="Total Requests" value={rows.length} icon={FileText} />
            <StatCard label="Pending Review" value={rows.filter((r) => r.status === "draft" || r.status === "submitted").length} icon={Clock} accent="warning" />
            <StatCard label="Approved" value={rows.filter((r) => r.status === "approved").length} icon={CheckCircle2} accent="success" />
            <StatCard label="Rejected" value={rows.filter((r) => r.status === "rejected").length} icon={XCircle} accent="danger" />
          </>
        )
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyTitle="No quotations yet"
        emptyDescription="Request a quote to get wholesale pricing on products."
      />
    </ListLayout>
  );
}
