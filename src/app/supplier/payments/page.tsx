"use client";

import * as React from "react";
import { toast } from "sonner";
import { Wallet, DollarSign, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";

type PaymentRow = {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function SupplierPaymentsPage(): React.ReactElement {
  const [balance, setBalance] = React.useState(0);
  const [rows, setRows] = React.useState<PaymentRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const finance = await import("@/features/finance/actions/finance-actions");
        const [walletRes, ledgerRes] = await Promise.allSettled([
          finance.getOrCreateUserWalletAction(),
          finance.listLedgerEntriesAction(),
        ]);

        if (walletRes.status === "fulfilled" && walletRes.value.success) {
          const w = walletRes.value.data as any;
          setBalance(w?.balance ?? 0);
        }
        if (ledgerRes.status === "fulfilled" && ledgerRes.value.success) {
          const entries = Array.isArray(ledgerRes.value.data) ? ledgerRes.value.data : [];
          setRows(entries.map((e: any) => ({
            id: e.id ?? e._id,
            type: e.type ?? "unknown",
            description: e.description ?? "",
            amount: e.amount ?? 0,
            status: e.status ?? "cleared",
            createdAt: e.createdAt,
          })));
        }
      } catch {
        toast.error("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<PaymentRow>[] = [
    {
      id: "date",
      header: "Date",
      cell: (r) => <span className="text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</span>,
    },
    {
      id: "description",
      header: "Description",
      cell: (r) => <span>{r.description || r.type}</span>,
    },
    {
      id: "amount",
      header: "Amount",
      cell: (r) => (
        <span className="font-semibold tabular-nums">
          {r.type === "credit" ? "+" : r.type === "debit" ? "-" : ""}{formatCents(r.amount)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader
        title="Payments"
        description="Your payment history and settlement status"
        actions={
          <Button className="gap-1.5">
            <ArrowUpRight className="h-4 w-4" /> Request Withdrawal
          </Button>
        }
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <StatCard label="Available Balance" value={loading ? "—" : formatCents(balance)} icon={Wallet} accent="success" />
        <StatCard label="Pending Settlement" value={loading ? "—" : formatCents(0)} icon={Clock} accent="warning" />
        <StatCard label="Total Paid" value={loading ? "—" : formatCents(0)} icon={DollarSign} accent="info" />
      </div>

      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Payment History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            emptyTitle="No payments yet"
            emptyDescription="Your payment transactions will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
