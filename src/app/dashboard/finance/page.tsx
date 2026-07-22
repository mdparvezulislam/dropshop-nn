"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import {
  getFinanceDashboardSummaryAction,
  listWalletsAction,
  listLedgerEntriesAction,
  listWithdrawalsAction,
  listDepositsAction,
  listAuditLogsAction,
  listInvoicesAction,
  manualAdjustmentAction,
  createDepositAction,
  transitionDepositAction,
  transitionWithdrawalAction,
  settleOrderAction,
  processRefundAction,
} from "@/features/finance/actions/finance-actions";
import {
  runReconciliationAction,
  getFinancialHealthAction,
  performDailyClosingAction,
  performMonthlyClosingAction,
  getProfitAndLossAction,
  getRevenueAnalysisAction,
  generateFinancialReportAction,
  listClosingSnapshotsAction,
  listFailedTransactionsAction,
  retryFailedTransactionAction,
} from "@/features/finance/actions/accounting-actions";
import { toast } from "sonner";
import {
  DollarSign,
  Landmark,
  Receipt,
  ClipboardList,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  Search,
  Filter,
  Download,
  PlusCircle,
  Clock,
  Lock,
  Wallet as WalletIcon,
  RefreshCw,
  Sliders,
  FileCheck,
  Activity,
  Calendar,
  AlertTriangle,
  Play,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminFinancePage() {
  const { data: session } = useSession() as any;

  const [activeTab, setActiveTab] = React.useState<
    | "analytics"
    | "reconciliation"
    | "closing"
    | "pnl"
    | "failed_txns"
    | "wallets"
    | "ledger"
    | "withdrawals"
    | "deposits"
    | "adjustments"
    | "audit"
  >("analytics");

  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<any>(null);
  const [healthScore, setHealthScore] = React.useState<any>(null);
  const [wallets, setWallets] = React.useState<any[]>([]);
  const [ledgerItems, setLedgerItems] = React.useState<any[]>([]);
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [deposits, setDeposits] = React.useState<any[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [failedTxns, setFailedTxns] = React.useState<any[]>([]);
  const [snapshots, setSnapshots] = React.useState<{ daily: any[]; monthly: any[] }>({ daily: [], monthly: [] });
  const [pnlReport, setPnlReport] = React.useState<any>(null);
  const [revenueReport, setRevenueReport] = React.useState<any>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [reportPeriod, setReportPeriod] = React.useState("This Month");

  // Action States
  const [refTxId, setRefTxId] = React.useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = React.useState<Record<string, string>>({});
  const [reconciling, setReconciling] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [retrying, setRetrying] = React.useState<Record<string, boolean>>({});

  // Manual Adjustment Form
  const [adjWalletId, setAdjWalletId] = React.useState("");
  const [adjType, setAdjType] = React.useState<"credit" | "debit">("credit");
  const [adjAmount, setAdjAmount] = React.useState("");
  const [adjReason, setAdjReason] = React.useState("");
  const [adjInternalNote, setAdjInternalNote] = React.useState("");
  const [adjSubmitting, setAdjSubmitting] = React.useState(false);
  const [showAdjModal, setShowAdjModal] = React.useState(false);

  // Manual Deposit Form
  const [depWalletId, setDepWalletId] = React.useState("");
  const [depAmount, setDepAmount] = React.useState("");
  const [depMethod, setDepMethod] = React.useState<any>("bkash");
  const [depPaymentRef, setDepPaymentRef] = React.useState("");
  const [depNotes, setDepNotes] = React.useState("");
  const [depSubmitting, setDepSubmitting] = React.useState(false);
  const [showDepModal, setShowDepModal] = React.useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const sumRes = await getFinanceDashboardSummaryAction();
      if (sumRes.success) setSummary(sumRes.data);

      const healthRes = await getFinancialHealthAction();
      if (healthRes.success) setHealthScore(healthRes.data);

      const walRes = await listWalletsAction();
      if (walRes.success && walRes.data) setWallets(walRes.data);

      const ledRes = await listLedgerEntriesAction({ search: searchQuery, type: typeFilter !== "all" ? typeFilter : undefined, limit: 100 });
      if (ledRes.success && ledRes.data) setLedgerItems(ledRes.data.items || []);

      const witRes = await listWithdrawalsAction({ search: searchQuery, status: statusFilter !== "all" ? statusFilter : undefined, limit: 100 });
      if (witRes.success && witRes.data) setWithdrawals(witRes.data.items || []);

      const depRes = await listDepositsAction({ search: searchQuery, limit: 100 });
      if (depRes.success && depRes.data) setDeposits(depRes.data.items || []);

      const audRes = await listAuditLogsAction({ limit: 100 });
      if (audRes.success && audRes.data) setAuditLogs(audRes.data.items || []);

      const snapRes = await listClosingSnapshotsAction();
      if (snapRes.success && snapRes.data) setSnapshots(snapRes.data);

      const failRes = await listFailedTransactionsAction();
      if (failRes.success && failRes.data) setFailedTxns(failRes.data);

      const pnlRes = await getProfitAndLossAction({ period: reportPeriod });
      if (pnlRes.success) setPnlReport(pnlRes.data);

      const revRes = await getRevenueAnalysisAction({ period: reportPeriod });
      if (revRes.success) setRevenueReport(revRes.data);
    } catch (err) {
      toast.error("Failed to load financial workspace metadata");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAllData();
  }, [searchQuery, typeFilter, statusFilter, reportPeriod]);

  const handleRunReconciliation = async () => {
    setReconciling(true);
    try {
      const res = await runReconciliationAction();
      if (res.success) {
        toast.success(`Reconciliation complete. Health Score: ${res.data.score}/100 (${res.data.rating})`);
        loadAllData();
      } else {
        toast.error(res.error || "Reconciliation execution failed");
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
        toast.success(`Daily financial closing completed for date: ${res.data.snapshotDate}`);
        loadAllData();
      } else {
        toast.error(res.error || "Daily closing failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Daily closing error");
    } finally {
      setClosing(false);
    }
  };

  const handleMonthlyClosing = async () => {
    setClosing(true);
    try {
      const res = await performMonthlyClosingAction({});
      if (res.success) {
        toast.success(`Month-end financial closing completed for month: ${res.data.monthKey}`);
        loadAllData();
      } else {
        toast.error(res.error || "Monthly closing failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Monthly closing error");
    } finally {
      setClosing(false);
    }
  };

  const handleRetryFailed = async (item: any) => {
    setRetrying({ ...retrying, [item.id]: true });
    try {
      const res = await retryFailedTransactionAction({
        entityId: item.entityId,
        type: item.type,
      });

      if (res.success && res.data?.retried) {
        toast.success(`Retry action executed successfully for ${item.referenceNumber}`);
        loadAllData();
      } else {
        toast.error(res.error || "Retry failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Retry execution failed");
    } finally {
      setRetrying({ ...retrying, [item.id]: false });
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, toStatus: string) => {
    try {
      const payload: any = {
        withdrawalId,
        toStatus,
      };

      if (toStatus === "completed") {
        const referenceNumber = refTxId[withdrawalId];
        if (!referenceNumber?.trim()) {
          toast.error("Transaction payment receipt reference ID is required to complete payout");
          return;
        }
        payload.referenceNumber = referenceNumber;
        payload.fee = 0;
      } else if (toStatus === "rejected") {
        payload.reason = rejectReason[withdrawalId] || "Rejected by platform finance governance";
      }

      const res = await transitionWithdrawalAction(payload);
      if (res.success) {
        toast.success(`Withdrawal status updated to ${toStatus}`);
        loadAllData();
      } else {
        toast.error(res.error || "Failed to update withdrawal status");
      }
    } catch (err: any) {
      toast.error(err.message || "Action execution error");
    }
  };

  const handleDepositAction = async (depositId: string, action: "approve" | "reject") => {
    try {
      const res = await transitionDepositAction({
        depositId,
        action,
        reason: rejectReason[depositId] || "Rejected by finance admin",
      });

      if (res.success) {
        toast.success(`Deposit request ${action}d successfully`);
        loadAllData();
      } else {
        toast.error(res.error || "Failed to process deposit");
      }
    } catch (err: any) {
      toast.error(err.message || "Deposit processing failed");
    }
  };

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjWalletId || !adjAmount || !adjReason) {
      toast.error("Please fill in all mandatory adjustment fields");
      return;
    }

    setAdjSubmitting(true);
    try {
      const amountCents = Math.floor(parseFloat(adjAmount) * 100);
      const res = await manualAdjustmentAction({
        walletId: adjWalletId,
        amount: amountCents,
        type: adjType,
        reason: adjReason,
        internalNote: adjInternalNote,
      });

      if (res.success) {
        toast.success(`Manual ${adjType} of ৳${adjAmount} executed successfully on wallet ledger`);
        setShowAdjModal(false);
        setAdjAmount("");
        setAdjReason("");
        setAdjInternalNote("");
        loadAllData();
      } else {
        toast.error(res.error || "Adjustment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Adjustment failed");
    } finally {
      setAdjSubmitting(false);
    }
  };

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depWalletId || !depAmount) {
      toast.error("Please select a target wallet and amount");
      return;
    }

    setDepSubmitting(true);
    try {
      const amountCents = Math.floor(parseFloat(depAmount) * 100);
      const res = await createDepositAction({
        walletId: depWalletId,
        amount: amountCents,
        method: depMethod,
        paymentReference: depPaymentRef,
        notes: depNotes,
      });

      if (res.success) {
        toast.success("Deposit request logged into platform registry");
        setShowDepModal(false);
        setDepAmount("");
        setDepPaymentRef("");
        setDepNotes("");
        loadAllData();
      } else {
        toast.error(res.error || "Failed to log deposit request");
      }
    } catch (err: any) {
      toast.error(err.message || "Deposit creation error");
    } finally {
      setDepSubmitting(false);
    }
  };

  const exportCSV = () => {
    if (ledgerItems.length === 0) {
      toast.error("No ledger records to export");
      return;
    }

    const headers = ["Reference", "WalletId", "Type", "Amount (BDT)", "Status", "Source", "Date"];
    const rows = ledgerItems.map((l) => [
      l.referenceNumber,
      l.walletId,
      l.type,
      (l.amount / 100).toFixed(2),
      l.status,
      l.sourceModule,
      new Date(l.createdAt).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dropshop_accounting_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Finance ledger exported to CSV");
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "approved":
      case "cleared":
      case "matched":
      case "active":
        return "success" as const;
      case "pending":
      case "under_review":
      case "warning":
      case "hold":
        return "warning" as const;
      case "rejected":
      case "cancelled":
      case "mismatch":
      case "failed":
      case "suspended":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      {/* Top Console Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Enterprise Accounting & Reconciliation Center</h1>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-950/40 text-[10px]">
              FINANCE-CENTER-001B
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reconciliation Engine, Daily & Month-End Closing Snapshots, Financial Health Score & P&L Reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleRunReconciliation} disabled={reconciling} size="sm" variant="outline" className="border-indigo-600/50 bg-indigo-950/50 text-indigo-300 text-xs gap-1.5 hover:bg-indigo-900">
            <Play className={`h-3.5 w-3.5 text-indigo-400 ${reconciling ? "animate-spin" : ""}`} /> Run Reconciliation
          </Button>
          <Button onClick={() => setShowDepModal(true)} size="sm" variant="outline" className="border-slate-800 text-xs bg-slate-900 gap-1.5">
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" /> Log Deposit
          </Button>
          <Button onClick={() => setShowAdjModal(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> Adjustment
          </Button>
          <Button onClick={loadAllData} size="sm" variant="ghost" disabled={loading} className="text-slate-400 hover:text-white">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Financial Health Score & Summary Cards */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        {/* Health Score Gauge */}
        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-400" /> Financial Health Score
            </span>
            <Badge variant={healthScore?.score >= 90 ? "success" : healthScore?.score >= 75 ? "warning" : "destructive"} className="text-[10px]">
              {healthScore?.rating ?? "Calculating..."}
            </Badge>
          </div>

          <div className="my-4 text-center">
            <div className={`text-4xl font-extrabold tracking-tight ${healthScore?.score >= 90 ? "text-emerald-400" : healthScore?.score >= 75 ? "text-amber-400" : "text-rose-400"}`}>
              {healthScore?.score ?? 100}<span className="text-xl text-slate-500">/100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Unreconciled issues: <span className="font-semibold text-white">{healthScore?.unreconciledCount ?? 0}</span>
            </p>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <div className="flex justify-between">
              <span>Ledger Integrity:</span>
              <span className={healthScore?.ledgerIntegrity ? "text-emerald-400" : "text-rose-400"}>
                {healthScore?.ledgerIntegrity ? "✓ Intact" : "⚠ Issue"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Wallet Integrity:</span>
              <span className={healthScore?.walletIntegrity ? "text-emerald-400" : "text-rose-400"}>
                {healthScore?.walletIntegrity ? "✓ Matched" : "⚠ Mismatch"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Settlement Integrity:</span>
              <span className={healthScore?.settlementIntegrity ? "text-emerald-400" : "text-rose-400"}>
                {healthScore?.settlementIntegrity ? "✓ Reconciled" : "⚠ Pending"}
              </span>
            </div>
          </div>
        </Card>

        {/* 6 Core KPI Summary Cards */}
        <div className="lg:col-span-3 grid gap-3 grid-cols-2 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/50 p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Total Available Cash
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {formatCurrency(summary?.availableBalance ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{summary?.activeWalletsCount ?? 0} wallets</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-indigo-400" /> Pending Clearances
            </span>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              {formatCurrency(summary?.pendingBalance ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Holding profit period</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-amber-400" /> Locked Debits
            </span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {formatCurrency(summary?.lockedBalance ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Pending payouts locked</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Month Profit
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {formatCurrency(summary?.monthlyProfit ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Cleared profit margins</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Failed Transactions
            </span>
            <div className="text-xl font-bold text-rose-400 mt-1">
              {failedTxns.length} errors
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Ready for retry</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" /> Net Profit
            </span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {formatCurrency(summary?.netProfit ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Net after payouts</p>
          </Card>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <CardContent className="p-2 flex gap-1.5 overflow-x-auto">
          {[
            { id: "analytics", label: "Dashboard & Trends", icon: TrendingUp },
            { id: "reconciliation", label: `Reconciliation (${healthScore?.unreconciledCount ?? 0})`, icon: Activity },
            { id: "closing", label: "Daily & Monthly Closing", icon: Calendar },
            { id: "pnl", label: "P&L & Revenue Analysis", icon: FileSpreadsheet },
            { id: "failed_txns", label: `Failed Queue (${failedTxns.length})`, icon: AlertTriangle },
            { id: "wallets", label: `Wallets (${wallets.length})`, icon: WalletIcon },
            { id: "ledger", label: "Ledger Stream", icon: ClipboardList },
            { id: "withdrawals", label: "Withdrawals Queue", icon: Landmark },
            { id: "deposits", label: "Deposit Requests", icon: Receipt },
            { id: "adjustments", label: "Manual Adjustments", icon: Sliders },
            { id: "audit", label: `Audit Trail (${auditLogs.length})`, icon: ShieldAlert },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Main Workspace Body */}
      <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          {/* TAB 1: Analytics & Cash Flow Trends */}
          {activeTab === "analytics" && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Monthly Cash Flow & Profit Trends</h3>
                <p className="text-xs text-slate-400">Reconciled historical performance breakdown across platform ledgers</p>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {summary?.monthlyChartData?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-sm font-semibold text-slate-200">{item.month}</span>
                      <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                        Profit: {formatCurrency(item.profit)}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Credits:</span>
                        <span className="font-semibold text-emerald-400">{formatCurrency(item.credits)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Debits:</span>
                        <span className="font-semibold text-rose-400">{formatCurrency(item.debits)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Reconciliation Center */}
          {activeTab === "reconciliation" && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Reconciliation & Consistency Console</h3>
                  <p className="text-xs text-slate-400">Compare wallet available balances against computed ledger entries</p>
                </div>
                <Button onClick={handleRunReconciliation} disabled={reconciling} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs">
                  {reconciling ? "Reconciling..." : "Run Full System Check"}
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Health Verification Checklist</h4>
                <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                  {healthScore?.checkSummary?.map((check: string, idx: number) => (
                    <div key={idx} className="p-3 rounded border border-slate-800 bg-slate-950 text-xs font-mono text-slate-300">
                      {check}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Daily & Monthly Closing */}
          {activeTab === "closing" && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Financial Closing & Snapshot Freezer</h3>
                  <p className="text-xs text-slate-400">Perform Daily & Month-End Closing to lock immutable financial snapshots</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDailyClosing} disabled={closing} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold">
                    {closing ? "Closing..." : "Close Today"}
                  </Button>
                  <Button onClick={handleMonthlyClosing} disabled={closing} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold">
                    {closing ? "Closing..." : "Close Month"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs uppercase text-slate-400 font-semibold">Recent Daily Closing Snapshots</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Opening Cash</TableHead>
                      <TableHead className="text-slate-400">Revenue</TableHead>
                      <TableHead className="text-slate-400">Profit</TableHead>
                      <TableHead className="text-slate-400">Closing Cash</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshots.daily.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                          No daily closing snapshots generated yet. Click "Close Today" to perform closing.
                        </TableCell>
                      </TableRow>
                    ) : (
                      snapshots.daily.map((s) => (
                        <TableRow key={s.id} className="border-slate-800">
                          <TableCell className="font-mono text-xs text-indigo-300">{s.snapshotDate}</TableCell>
                          <TableCell className="text-xs text-slate-400">{formatCurrency(s.openingBalanceCents)}</TableCell>
                          <TableCell className="text-xs text-emerald-400 font-semibold">{formatCurrency(s.revenueCents)}</TableCell>
                          <TableCell className="text-xs text-teal-400 font-semibold">{formatCurrency(s.profitCents)}</TableCell>
                          <TableCell className="text-xs text-white font-bold">{formatCurrency(s.closingBalanceCents)}</TableCell>
                          <TableCell>
                            <Badge variant="success">Locked & Reconciled</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* TAB 4: P&L & Revenue Analysis */}
          {activeTab === "pnl" && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Profit & Loss Statement & Revenue Analysis</h3>
                  <p className="text-xs text-slate-400">Financial earnings, cost of goods, refund losses, and platform earnings</p>
                </div>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="h-8 rounded border border-slate-800 bg-slate-950 px-2.5 text-xs text-white outline-none"
                >
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
              </div>

              {pnlReport && (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card className="border-slate-800 bg-slate-950/60 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-emerald-400 border-b border-slate-800 pb-2">Profit & Loss Breakdown</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gross Revenue:</span>
                        <span className="font-semibold text-white">{formatCurrency(pnlReport.grossRevenueCents)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cost of Goods (COGS):</span>
                        <span className="font-semibold text-slate-300">{formatCurrency(pnlReport.costOfGoodsSoldCents)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1">
                        <span className="text-slate-300 font-medium">Gross Profit:</span>
                        <span className="font-semibold text-emerald-400">{formatCurrency(pnlReport.grossProfitCents)}</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>Refund Losses:</span>
                        <span>-{formatCurrency(pnlReport.refundLossCents)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-cyan-400">
                        <span>Net Platform Profit:</span>
                        <span>{formatCurrency(pnlReport.netProfitCents)}</span>
                      </div>
                    </div>
                  </Card>

                  {revenueReport && (
                    <Card className="border-slate-800 bg-slate-950/60 p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">Revenue Streams</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gross Inflow:</span>
                          <span className="font-semibold text-white">{formatCurrency(revenueReport.grossRevenueCents)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Net Inflow (after refunds):</span>
                          <span className="font-semibold text-teal-400">{formatCurrency(revenueReport.netRevenueCents)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Commissions Earned:</span>
                          <span className="font-semibold text-indigo-300">{formatCurrency(revenueReport.commissionCents)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-emerald-400">
                          <span>Total Platform Earnings:</span>
                          <span>{formatCurrency(revenueReport.platformEarningsCents)}</span>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Failed Transaction Center */}
          {activeTab === "failed_txns" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Reference</TableHead>
                  <TableHead className="text-slate-400">Failure Type</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Failure Reason</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedTxns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                      No failed transactions or pending error states logged
                    </TableCell>
                  </TableRow>
                ) : (
                  failedTxns.map((item) => (
                    <TableRow key={item.id} className="border-slate-800">
                      <TableCell className="font-mono text-xs text-indigo-300">{item.referenceNumber}</TableCell>
                      <TableCell className="capitalize text-xs font-medium text-white">{item.type.replace("_", " ")}</TableCell>
                      <TableCell className="font-semibold text-rose-400">{formatCurrency(item.amountCents)}</TableCell>
                      <TableCell className="text-xs text-slate-400 max-w-xs truncate">{item.failureReason}</TableCell>
                      <TableCell>
                        <Badge variant={item.retryStatus === "can_retry" ? "warning" : "destructive"}>
                          {item.retryStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.retryStatus === "can_retry" && (
                          <Button
                            onClick={() => handleRetryFailed(item)}
                            disabled={retrying[item.id]}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500 text-xs h-7 gap-1"
                          >
                            <RotateCcw className={`h-3 w-3 ${retrying[item.id] ? "animate-spin" : ""}`} /> Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 6: Wallets */}
          {activeTab === "wallets" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Wallet Account ID</TableHead>
                  <TableHead className="text-slate-400">Workspace Owner</TableHead>
                  <TableHead className="text-slate-400">Account Role</TableHead>
                  <TableHead className="text-slate-400">Available</TableHead>
                  <TableHead className="text-slate-400">Pending</TableHead>
                  <TableHead className="text-slate-400">Locked</TableHead>
                  <TableHead className="text-slate-400">Withdrawable</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                      No business wallets found in platform registry
                    </TableCell>
                  </TableRow>
                ) : (
                  wallets.map((w) => (
                    <TableRow key={w.id} className="border-slate-800">
                      <TableCell className="font-mono text-xs text-indigo-400">{w.id.slice(-10)}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{w.workspaceId}</TableCell>
                      <TableCell className="capitalize text-slate-200">
                        <Badge variant="outline" className="border-slate-700 text-xs">
                          {w.workspaceRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-400">{formatCurrency(w.balances?.availableBalance ?? 0)}</TableCell>
                      <TableCell className="text-indigo-400">{formatCurrency(w.balances?.pendingBalance ?? 0)}</TableCell>
                      <TableCell className="text-amber-400">{formatCurrency(w.balances?.lockedBalance ?? 0)}</TableCell>
                      <TableCell className="font-semibold text-white">{formatCurrency(w.balances?.withdrawableBalance ?? 0)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(w.status)}>{w.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => {
                            setAdjWalletId(w.id);
                            setShowAdjModal(true);
                          }}
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 7: Ledger Stream */}
          {activeTab === "ledger" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Date & Time</TableHead>
                  <TableHead className="text-slate-400">Reference Number</TableHead>
                  <TableHead className="text-slate-400">Source Module</TableHead>
                  <TableHead className="text-slate-400">Entry Type</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Description</TableHead>
                  <TableHead className="text-slate-400 text-right">Clearance Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-slate-500 text-xs">
                      No matching ledger entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  ledgerItems.map((l) => (
                    <TableRow key={l.id} className="border-slate-800">
                      <TableCell className="text-xs text-slate-400">{new Date(l.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs text-indigo-300">{l.referenceNumber || l.id.slice(-8)}</TableCell>
                      <TableCell className="capitalize text-xs text-slate-300">{l.sourceModule || "system"}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-200 capitalize">{l.type.replace("_", " ")}</TableCell>
                      <TableCell className={`font-semibold ${l.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {l.amount >= 0 ? "+" : ""}{formatCurrency(l.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(l.status)}>{l.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 max-w-xs truncate">{l.description || l.metadata?.reason || "—"}</TableCell>
                      <TableCell className="text-xs text-slate-400 text-right">
                        {l.clearsAt ? new Date(l.clearsAt).toLocaleDateString() : "Immediate"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 8: Withdrawals Queue */}
          {activeTab === "withdrawals" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Request Ref</TableHead>
                  <TableHead className="text-slate-400">Method</TableHead>
                  <TableHead className="text-slate-400">Account Details</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                      No withdrawal requests logged
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((w) => (
                    <TableRow key={w.id} className="border-slate-800">
                      <TableCell className="font-mono text-xs text-indigo-300">{w.referenceNumber || w.id.slice(-8)}</TableCell>
                      <TableCell className="capitalize text-slate-200 font-medium">{w.method}</TableCell>
                      <TableCell className="text-xs text-slate-300">
                        <div className="font-mono">{w.payoutDetails?.accountNumber}</div>
                        {w.payoutDetails?.accountName && <div className="text-[10px] text-slate-400">{w.payoutDetails.accountName}</div>}
                        {w.payoutDetails?.bankName && <div className="text-[10px] text-slate-400">{w.payoutDetails.bankName}</div>}
                      </TableCell>
                      <TableCell className="font-semibold text-white">{formatCurrency(w.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(w.status)}>{w.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {w.status === "pending" && (
                          <div className="inline-flex gap-1.5">
                            <Button
                              onClick={() => handleWithdrawalAction(w.id, "approved")}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-500 text-xs h-7"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleWithdrawalAction(w.id, "rejected")}
                              variant="destructive"
                              size="sm"
                              className="text-xs h-7"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {w.status === "approved" && (
                          <div className="inline-flex items-center gap-1.5">
                            <Input
                              placeholder="Trx ID reference"
                              value={refTxId[w.id] || ""}
                              onChange={(e) => setRefTxId({ ...refTxId, [w.id]: e.target.value })}
                              className="h-7 w-32 bg-slate-950 border-slate-800 text-[10px] text-white pl-2"
                            />
                            <Button
                              onClick={() => handleWithdrawalAction(w.id, "completed")}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-xs h-7"
                            >
                              Pay / Complete
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 9: Deposits Queue */}
          {activeTab === "deposits" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Deposit Ref</TableHead>
                  <TableHead className="text-slate-400">Method</TableHead>
                  <TableHead className="text-slate-400">Payment Ref</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                      No deposit requests logged
                    </TableCell>
                  </TableRow>
                ) : (
                  deposits.map((d) => (
                    <TableRow key={d.id} className="border-slate-800">
                      <TableCell className="font-mono text-xs text-indigo-300">{d.referenceNumber || d.id.slice(-8)}</TableCell>
                      <TableCell className="capitalize text-slate-200">{d.method}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{d.paymentReference || "N/A"}</TableCell>
                      <TableCell className="font-semibold text-emerald-400">{formatCurrency(d.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(d.status)}>{d.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {d.status === "pending" && (
                          <div className="inline-flex gap-1.5">
                            <Button
                              onClick={() => handleDepositAction(d.id, "approve")}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-xs h-7"
                            >
                              Approve Deposit
                            </Button>
                            <Button
                              onClick={() => handleDepositAction(d.id, "reject")}
                              variant="destructive"
                              size="sm"
                              className="text-xs h-7"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 10: Manual Adjustments */}
          {activeTab === "adjustments" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Manual Adjustments Console</h3>
                  <p className="text-xs text-slate-400">Direct wallet credit and debit actions protected by audit logs</p>
                </div>
                <Button onClick={() => setShowAdjModal(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs">
                  + New Adjustment
                </Button>
              </div>

              <p className="text-xs text-slate-400">
                To perform a credit or debit adjustment, click the "+ New Adjustment" button above or click "Adjust" on any wallet in the Wallets tab.
              </p>
            </div>
          )}

          {/* TAB 11: Audit Trail */}
          {activeTab === "audit" && (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Timestamp</TableHead>
                  <TableHead className="text-slate-400">Ref Number</TableHead>
                  <TableHead className="text-slate-400">Action</TableHead>
                  <TableHead className="text-slate-400">Actor</TableHead>
                  <TableHead className="text-slate-400">Amount</TableHead>
                  <TableHead className="text-slate-400">Old Balance</TableHead>
                  <TableHead className="text-slate-400">New Balance</TableHead>
                  <TableHead className="text-slate-400">Reason / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-slate-500 text-xs">
                      No financial audit records logged yet
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((a) => (
                    <TableRow key={a.id} className="border-slate-800">
                      <TableCell className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs text-indigo-300">{a.referenceNumber || "N/A"}</TableCell>
                      <TableCell className="capitalize text-xs font-semibold text-white">{a.action.replace("_", " ")}</TableCell>
                      <TableCell className="text-xs text-slate-300 font-mono">{a.actorId.slice(-8)}</TableCell>
                      <TableCell className={`font-semibold ${a.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {a.amount >= 0 ? "+" : ""}{formatCurrency(a.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">{formatCurrency(a.oldBalance)}</TableCell>
                      <TableCell className="text-xs text-white font-medium">{formatCurrency(a.newBalance)}</TableCell>
                      <TableCell className="text-xs text-slate-400 max-w-xs truncate">{a.reason}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* MODAL: Manual Adjustment */}
      {showAdjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold">Execute Manual Wallet Adjustment</h3>
              <button onClick={() => setShowAdjModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdjustment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Target Wallet</label>
                <select
                  value={adjWalletId}
                  onChange={(e) => setAdjWalletId(e.target.value)}
                  required
                  className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-2.5 text-xs text-white outline-none"
                >
                  <option value="">Select Target Wallet...</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.workspaceRole.toUpperCase()} — {w.workspaceId.slice(-10)} (Avail: ৳{(w.balances?.availableBalance / 100).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType("credit")}
                    className={`h-9 text-xs font-semibold rounded border ${
                      adjType === "credit" ? "bg-emerald-600 border-emerald-500 text-white" : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}
                  >
                    Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType("debit")}
                    className={`h-9 text-xs font-semibold rounded border ${
                      adjType === "debit" ? "bg-rose-600 border-rose-500 text-white" : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}
                  >
                    Debit (-)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Amount (BDT)</label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Mandatory Reason</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Promotional bonus credit, Fee correction"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Internal Note (Optional)</label>
                <Input
                  type="text"
                  placeholder="Internal audit metadata"
                  value={adjInternalNote}
                  onChange={(e) => setAdjInternalNote(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAdjModal(false)} className="w-1/2 text-xs border-slate-800">
                  Cancel
                </Button>
                <Button type="submit" disabled={adjSubmitting} className="w-1/2 text-xs bg-indigo-600 hover:bg-indigo-500 font-semibold">
                  {adjSubmitting ? "Executing..." : "Confirm Adjustment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Deposit */}
      {showDepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold">Log Platform Deposit Request</h3>
              <button onClick={() => setShowDepModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeposit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Target Wallet</label>
                <select
                  value={depWalletId}
                  onChange={(e) => setDepWalletId(e.target.value)}
                  required
                  className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-2.5 text-xs text-white outline-none"
                >
                  <option value="">Select Target Wallet...</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.workspaceRole.toUpperCase()} — {w.workspaceId.slice(-10)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Deposit Amount (BDT)</label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Payment Method</label>
                <select
                  value={depMethod}
                  onChange={(e: any) => setDepMethod(e.target.value)}
                  className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-2.5 text-xs text-white outline-none"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="manual">Manual Cash</option>
                  <option value="admin_credit">Admin Credit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Payment Transaction Ref</label>
                <Input
                  type="text"
                  placeholder="MFS Trx ID or Bank Slip reference"
                  value={depPaymentRef}
                  onChange={(e) => setDepPaymentRef(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400">Notes (Optional)</label>
                <Input
                  type="text"
                  placeholder="Additional context"
                  value={depNotes}
                  onChange={(e) => setDepNotes(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowDepModal(false)} className="w-1/2 text-xs border-slate-800">
                  Cancel
                </Button>
                <Button type="submit" disabled={depSubmitting} className="w-1/2 text-xs bg-emerald-600 hover:bg-emerald-500 font-semibold">
                  {depSubmitting ? "Logging..." : "Log Deposit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
