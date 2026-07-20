"use client";

import * as React from "react";
import Link from "next/link";
import { Wallet, ArrowUpRight, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { StatCard } from "@/shared/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/data-table";
import { PageHeader } from "@/shared/components/workspace/page-header";
import { Spinner } from "@/shared/components/ui/spinner";

type LedgerRow = {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
};

export default function ResellerWalletPage(): React.ReactElement {
  const [balance, setBalance] = React.useState(0);
  const [pendingProfit, setPendingProfit] = React.useState(0);
  const [ledger, setLedger] = React.useState<LedgerRow[]>([]);
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const finance = await import("@/features/finance/actions/finance-actions");

        const [walletRes, ledgerRes, withdrawalRes] = await Promise.allSettled([
          finance.getOrCreateUserWalletAction(),
          finance.listLedgerEntriesAction(),
          finance.listWithdrawalsAction(),
        ]);

        if (walletRes.status === "fulfilled" && walletRes.value.success) {
          const w = walletRes.value.data as any;
          setBalance(w?.balance ?? 0);
          setPendingProfit(w?.pendingProfit ?? 0);
        }

        if (ledgerRes.status === "fulfilled" && ledgerRes.value.success) {
          const entries = (Array.isArray(ledgerRes.value.data) ? ledgerRes.value.data : []) as any[];
          setLedger(entries.map((e: any) => ({
            id: e.id ?? e._id,
            type: e.type ?? "unknown",
            amount: e.amount ?? 0,
            status: e.status ?? "cleared",
            description: e.description ?? "",
            createdAt: e.createdAt,
          })));
        }

        if (withdrawalRes.status === "fulfilled" && withdrawalRes.value.success) {
          const wd = (Array.isArray(withdrawalRes.value.data) ? withdrawalRes.value.data : []) as any[];
          setWithdrawals(wd);
        }
      } catch {
        toast.error("Failed to load wallet data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCents = (cents: number): string =>
    `৳${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const columns: DataTableColumn<LedgerRow>[] = [
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
      id: "description",
      header: "Description",
      cell: (r) => <span>{r.description || r.type}</span>,
    },
    {
      id: "amount",
      header: "Amount",
      cell: (r) => (
        <span className={cn(
          "font-semibold tabular-nums",
          r.type === "credit" ? "text-success" : "text-destructive",
        )}>
          {r.type === "credit" ? "+" : "-"}{formatCents(r.amount)}
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
        title="Wallet"
        description="Your earnings, balance, and transactions"
        actions={
          <Link href="/reseller/withdraw">
            <Button className="gap-1.5">
              <ArrowUpRight className="h-4 w-4" /> Withdraw
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <StatCard label="Available Balance" value={loading ? "—" : formatCents(balance)} icon={Wallet} accent="success" />
        <StatCard label="Pending Profit" value={loading ? "—" : formatCents(pendingProfit)} icon={Clock} accent="warning" />
        <StatCard label="Total Withdrawn" value={loading ? "—" : formatCents(withdrawals.filter((w: any) => w.status === "completed").reduce((s: number, w: any) => s + (w.amount ?? 0), 0))} icon={DollarSign} accent="info" />
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={ledger}
            loading={loading}
            emptyTitle="No transactions yet"
            emptyDescription="Your earnings and withdrawals will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
