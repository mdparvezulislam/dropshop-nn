"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowUpRight, Wallet, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";
import { WithdrawForm } from "./withdraw-form";

type WithdrawalRow = {
  id: string;
  amount: number;
  status: string;
  method: string;
  account: string;
  note: string;
  createdAt: string;
};

export default function ResellerWithdrawPage(): React.ReactElement {
  const [rows, setRows] = React.useState<WithdrawalRow[]>([]);
  const [balance, setBalance] = React.useState(0);
  const [walletId, setWalletId] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const finance = await import("@/features/finance/actions/finance-actions");
      const [walletRes, wdRes] = await Promise.allSettled([
        finance.getOrCreateUserWalletAction(),
        finance.listWithdrawalsAction(),
      ]);

      if (walletRes.status === "fulfilled" && walletRes.value.success) {
        const w = walletRes.value.data as any;
        setBalance(w?.balance ?? 0);
        setWalletId(w?.id ?? w?._id ?? "");
      }

      if (wdRes.status === "fulfilled" && wdRes.value.success) {
        const items = (Array.isArray(wdRes.value.data) ? wdRes.value.data : []) as any[];
        setRows(items.map((e: any) => ({
          id: e.id ?? e._id,
          amount: e.amount ?? 0,
          status: e.status ?? "pending",
          method: e.method ?? "—",
          account: e.account ?? "—",
          note: e.note ?? "",
          createdAt: e.createdAt,
        })));
      }
    } catch {
      toast.error("Failed to load withdrawal data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<WithdrawalRow>[] = [
    {
      id: "date",
      header: "Date",
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (r) => <span className="font-semibold tabular-nums">{formatCents(r.amount)}</span>,
    },
    {
      id: "method",
      header: "Method",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{r.method}</span>,
    },
    {
      id: "account",
      header: "Account",
      cell: (r) => <span className="font-mono text-sm text-muted-foreground">{r.account}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <StatusChip label={r.status} tone={statusToneFromValue(r.status)} />,
    },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader title="Withdraw" description="Withdraw your earnings" />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={rows}
                loading={loading}
                emptyTitle="No withdrawals yet"
                emptyDescription="Request your first withdrawal above."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <StatCard label="Available Balance" value={formatCents(balance)} icon={Wallet} accent="success" />
          <WithdrawForm balance={balance} walletId={walletId} onSuccess={load} />
        </div>
      </div>
    </div>
  );
}
