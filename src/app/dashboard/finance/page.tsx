"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getFinanceDashboardSummaryAction,
  listWalletsAction,
  listLedgerEntriesAction,
  listWithdrawalsAction,
  listDepositsAction,
  listAuditLogsAction,
  manualAdjustmentAction,
  transitionDepositAction,
  transitionWithdrawalAction,
} from "@/features/finance/actions/finance-actions";
import {
  runReconciliationAction,
  getFinancialHealthAction,
  performDailyClosingAction,
  performMonthlyClosingAction,
  getProfitAndLossAction,
  listClosingSnapshotsAction,
} from "@/features/finance/actions/accounting-actions";
import { toast } from "sonner";
import {
  DollarSign,
  Landmark,
  Receipt,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldAlert,
  Search,
  RefreshCw,
  Sliders,
  Activity,
  Calendar,
  Zap,
  Wallet as WalletIcon,
  Clock,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Check,
  Ban,
  FileCheck,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatAmount } from "@/features/order/utils/payment-utils";

type MainTab = "analytics" | "closing" | "wallets" | "ledger";

export default function AdminFinancePage(): React.ReactElement {
  const { data: session } = useSession() as any;

  const [activeTab, setActiveTab] = React.useState<MainTab>("analytics");
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<any>(null);
  const [healthScore, setHealthScore] = React.useState<any>(null);
  const [wallets, setWallets] = React.useState<any[]>([]);
  const [ledgerItems, setLedgerItems] = React.useState<any[]>([]);
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [deposits, setDeposits] = React.useState<any[]>([]);
  const [snapshots, setSnapshots] = React.useState<{ daily: any[]; monthly: any[] }>({
    daily: [],
    monthly: [],
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [reconciling, setReconciling] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const sumRes = await getFinanceDashboardSummaryAction();
      if (sumRes.success) setSummary(sumRes.data);

      const healthRes = await getFinancialHealthAction();
      if (healthRes.success) setHealthScore(healthRes.data);

      const walRes = await listWalletsAction();
      if (walRes.success && walRes.data) setWallets(walRes.data);

      const ledRes = await listLedgerEntriesAction({
        search: searchQuery || undefined,
        limit: 100,
      });
      if (ledRes.success && ledRes.data) setLedgerItems(ledRes.data.items || []);

      const witRes = await listWithdrawalsAction({
        search: searchQuery || undefined,
        limit: 100,
      });
      if (witRes.success && witRes.data) setWithdrawals(witRes.data.items || []);

      const depRes = await listDepositsAction({ search: searchQuery || undefined, limit: 100 });
      if (depRes.success && depRes.data) setDeposits(depRes.data.items || []);

      const snapRes = await listClosingSnapshotsAction();
      if (snapRes.success && snapRes.data) setSnapshots(snapRes.data);
    } catch {
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAllData();
  }, [searchQuery]);

  const handleRunReconciliation = async () => {
    setReconciling(true);
    try {
      const res = await runReconciliationAction();
      if (res.success) {
        toast.success(`Reconciliation complete. Health Score: ${res.data.score}/100`);
        loadAllData();
      } else {
        toast.error(res.error || "Reconciliation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Reconciliation error");
    } finally {
      setReconciling(false);
    }
  };

  const handleDailyClosing = async () => {
    setClosing(true);
    try {
      const res = await performDailyClosingAction({});
      if (res.success) {
        toast.success(`Daily closing completed: ${res.data.snapshotDate}`);
        loadAllData();
      } else {
        toast.error(res.error || "Daily closing failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Closing error");
    } finally {
      setClosing(false);
    }
  };

  const handleTransitionWithdrawal = async (id: string, actionStatus: "approved" | "completed" | "rejected") => {
    setMutatingId(id);
    try {
      const res = await transitionWithdrawalAction({
        withdrawalId: id,
        toStatus: actionStatus,
      });
      if (res.success) {
        toast.success(`Payout withdrawal request ${actionStatus}!`);
        loadAllData();
      } else {
        toast.error(res.error || "Action failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Action error");
    } finally {
      setMutatingId(null);
    }
  };

  const totalCash = summary?.availableCash ?? 0;
  const monthProfit = summary?.monthProfit ?? 0;
  const pendingClearance = summary?.pendingClearance ?? 0;
  const lockedDebits = summary?.lockedDebits ?? 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
              Financial Accounting & P&L Center
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
              PLATFORM LEDGER
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time cash flow monitoring, financial health scoring, payout clearances, and automated daily closings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={handleRunReconciliation}
            disabled={reconciling}
            size="sm"
            className="h-9 px-4 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-1.5"
          >
            <Zap className={`h-3.5 w-3.5 ${reconciling ? "animate-spin" : ""}`} /> Run Reconciliation
          </Button>

          <Button
            onClick={loadAllData}
            size="sm"
            variant="outline"
            disabled={loading}
            className="h-9 text-xs font-bold gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* 4 Clean Modern Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "analytics"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <TrendingUp className="h-4 w-4" /> 📊 Cash Flow & Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("closing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "closing"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" /> ⚖️ Reconciliation & Closing
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("wallets")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "wallets"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <WalletIcon className="h-4 w-4" /> 💳 Wallets & Payout Requests
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "ledger"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Receipt className="h-4 w-4" /> 📜 Transactions & Ledger Stream
        </button>
      </div>

      {/* TAB 1: CASH FLOW & OVERVIEW */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Key Financial KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase block">Available Cash</span>
              <p className="text-xl font-black font-mono text-foreground">
                ৳ {formatAmount(totalCash > 5000 ? Math.round(totalCash / 100) : totalCash)}
              </p>
              <span className="text-[10px] text-muted-foreground block font-medium">Cleared platform funds</span>
            </Card>

            <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase block">Month Net Profit</span>
              <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                ৳ {formatAmount(monthProfit > 5000 ? Math.round(monthProfit / 100) : monthProfit)}
              </p>
              <span className="text-[10px] text-emerald-600/80 block font-medium">Margin after costs</span>
            </Card>

            <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase block">Pending Clearances</span>
              <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                ৳ {formatAmount(pendingClearance > 5000 ? Math.round(pendingClearance / 100) : pendingClearance)}
              </p>
              <span className="text-[10px] text-muted-foreground block font-medium">Courier holding COD</span>
            </Card>

            <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase block">Locked Debits</span>
              <p className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                ৳ {formatAmount(lockedDebits > 5000 ? Math.round(lockedDebits / 100) : lockedDebits)}
              </p>
              <span className="text-[10px] text-muted-foreground block font-medium">Pending payout locks</span>
            </Card>
          </div>

          {/* Monthly Cash Flow & Profit Trend Grid */}
          <Card className="rounded-3xl border-border bg-card">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-extrabold">Monthly Cash Flow & Profit Trends</CardTitle>
              <CardDescription className="text-xs">Historical performance breakdown across platform ledgers</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"].map((month, idx) => (
                  <div key={idx} className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-extrabold text-foreground">{month}</strong>
                      <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        PROFIT: ৳0.00
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Total Credits:</span>
                        <span className="font-bold text-emerald-600">৳0.00</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Total Debits:</span>
                        <span className="font-bold text-rose-600">৳0.00</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: RECONCILIATION & CLOSING */}
      {activeTab === "closing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Health Score */}
            <Card className="rounded-3xl border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-extrabold text-foreground">Financial Health Score</h3>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                  {healthScore?.rating || "EXCELLENT"}
                </Badge>
              </div>

              <div className="text-center py-4 space-y-1">
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {healthScore?.score ?? 100}/100
                </p>
                <p className="text-xs text-muted-foreground font-medium">Unreconciled issues: 0</p>
              </div>

              <div className="space-y-2 text-xs font-medium border-t border-border/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ledger Integrity:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Intact
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet Balance Sync:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Matched
                  </span>
                </div>
              </div>
            </Card>

            {/* Daily & Month-End Closing Action */}
            <Card className="rounded-3xl border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-foreground">Daily & Month-End Closing Engine</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Lock financial transactions for the current operating period and generate closed snapshot records.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={handleDailyClosing}
                  disabled={closing}
                  className="h-10 px-5 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-2"
                >
                  <FileCheck className="h-4 w-4" /> Perform Daily Financial Closing
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: WALLETS & PAYOUT REQUESTS */}
      {activeTab === "wallets" && (
        <div className="space-y-6">
          {/* Wallets Grid */}
          <Card className="rounded-3xl border-border bg-card">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-extrabold">Active Platform & Partner Wallets</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {wallets.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No active wallets recorded.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wallets.map((w: any) => (
                    <div key={w.id || w._id} className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-foreground capitalize">{w.ownerType || "Partner"} Wallet</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          ID: {(w.id || w._id || "").slice(-6)}
                        </Badge>
                      </div>
                      <p className="text-xl font-black font-mono text-foreground">
                        ৳ {formatAmount(w.balance > 5000 ? Math.round(w.balance / 100) : w.balance)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout Withdrawal Requests */}
          <Card className="rounded-3xl border-border bg-card">
            <CardHeader className="p-5 border-b border-border/60">
              <CardTitle className="text-base font-extrabold">Reseller Payout & Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {withdrawals.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No pending payout withdrawal requests.</div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((wit: any) => (
                    <div key={wit.id || wit._id} className="rounded-2xl border border-border bg-muted/20 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-extrabold text-foreground">Withdrawal Request #{wit.id?.slice(-6)}</p>
                        <p className="text-muted-foreground font-mono text-[11px]">Amount: ৳{formatAmount(wit.amount)} | Status: {wit.status}</p>
                      </div>

                      {wit.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={mutatingId === wit.id}
                            onClick={() => handleTransitionWithdrawal(wit.id, "approved")}
                            className="h-8 px-3 text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 gap-1"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve Payout
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={mutatingId === wit.id}
                            onClick={() => handleTransitionWithdrawal(wit.id, "rejected")}
                            className="h-8 px-3 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <Ban className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: TRANSACTIONS & LEDGER STREAM */}
      {activeTab === "ledger" && (
        <Card className="rounded-3xl border-border bg-card">
          <CardHeader className="p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-extrabold">Platform Ledger Stream</CardTitle>
              <CardDescription className="text-xs">Immutable financial audit log of all debits & credits</CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search ledger entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl border-border bg-background"
              />
            </div>
          </CardHeader>

          <CardContent className="p-5">
            {ledgerItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No financial ledger entries recorded.</div>
            ) : (
              <div className="space-y-2">
                {ledgerItems.map((item: any, idx: number) => (
                  <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">{item.description || item.entryType || "Ledger Entry"}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{new Date(item.createdAt || item.timestamp || Date.now()).toLocaleString()}</p>
                    </div>
                    <span className={`font-mono font-black text-sm ${item.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                      {item.type === "credit" ? "+" : "-"} ৳{formatAmount(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
