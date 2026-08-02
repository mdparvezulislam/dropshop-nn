"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getOrCreateUserWalletAction,
  getWalletBalanceAction,
  requestWithdrawalAction,
  listLedgerEntriesAction,
  listWithdrawalsAction,
} from "@/features/finance/actions/finance-actions";
import { toast } from "sonner";
import {
  DollarSign,
  Send,
  ArrowUpRight,
  Landmark,
  Receipt,
  Wallet as WalletIcon,
  RefreshCw,
  Clock,
  Lock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Building,
  CreditCard,
} from "lucide-react";
import { formatAmount } from "@/features/order/utils/payment-utils";
import { Spinner } from "@/components/ui/spinner";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";

type MainTab = "request" | "ledger" | "withdrawals";

export default function ResellerWalletPage(): React.ReactElement {
  const { data: session } = useSession() as any;

  const [activeTab, setActiveTab] = React.useState<MainTab>("request");
  const [wallet, setWallet] = React.useState<any>(null);
  const [balances, setBalances] = React.useState<any>({
    availableBalance: 0,
    pendingBalance: 0,
    lockedBalance: 0,
    withdrawableBalance: 0,
    lifetimeEarnings: 0,
    lifetimeWithdrawals: 0,
  });

  const [ledger, setLedger] = React.useState<any[]>([]);
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Payout Form States
  const [withdrawAmount, setWithdrawAmount] = React.useState("");
  const [payoutMethod, setPayoutMethod] = React.useState<"bkash" | "nagad" | "rocket" | "upay" | "bank">("bkash");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [branchName, setBranchName] = React.useState("");
  const [routingNumber, setRoutingNumber] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const walletRes = await getOrCreateUserWalletAction();
      if (walletRes.success && walletRes.data) {
        const w = walletRes.data;
        setWallet(w);

        const balRes = await getWalletBalanceAction({ walletId: w.id });
        if (balRes.success && balRes.data) {
          setBalances(balRes.data);
        }

        const ledRes = await listLedgerEntriesAction({ walletId: w.id });
        if (ledRes.success && ledRes.data) {
          setLedger(Array.isArray(ledRes.data) ? ledRes.data : ledRes.data.items || []);
        }

        const witRes = await listWithdrawalsAction(w.id);
        if (witRes.success && witRes.data) {
          setWithdrawals(Array.isArray(witRes.data) ? witRes.data : witRes.data.items || []);
        }
      }
    } catch {
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    const amountTaka = parseFloat(withdrawAmount);
    if (isNaN(amountTaka) || amountTaka <= 0) {
      toast.error("Please enter a valid withdrawal amount in Taka");
      return;
    }

    const amountCents = Math.floor(amountTaka * 100);
    const maxWithdrawableCents = balances.withdrawableBalance ?? 0;

    if (amountCents > maxWithdrawableCents && maxWithdrawableCents > 0) {
      toast.error("Requested amount exceeds available withdrawable balance");
      return;
    }

    if (!accountNumber) {
      toast.error("Please enter payout account number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestWithdrawalAction({
        walletId: wallet.id,
        amount: amountCents,
        method: payoutMethod,
        payoutDetails: {
          accountNumber,
          accountName: accountName || undefined,
          bankName: payoutMethod === "bank" ? bankName : undefined,
          branchName: payoutMethod === "bank" ? branchName : undefined,
          routingNumber: payoutMethod === "bank" ? routingNumber : undefined,
        },
      });

      if (res.success) {
        toast.success("Withdrawal payout request submitted successfully!");
        setWithdrawAmount("");
        setAccountNumber("");
        setAccountName("");
        setBankName("");
        setBranchName("");
        setRoutingNumber("");
        loadData();
      } else {
        toast.error(res.error || "Failed to submit withdrawal request");
      }
    } catch (err: any) {
      toast.error(err.message || "Withdrawal error");
    } finally {
      setSubmitting(false);
    }
  };

  const normalizeTaka = (rawCents: number) => {
    if (!rawCents) return 0;
    return rawCents > 5000 ? Math.round(rawCents / 100) : rawCents;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
              Reseller Partner E-Wallet
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
              PAYOUT HUB
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track order profits, withdraw earnings to bKash / Nagad / Bank, and view real-time ledger entries.
          </p>
        </div>

        <Button
          onClick={loadData}
          size="sm"
          variant="outline"
          disabled={loading}
          className="h-9 text-xs font-bold gap-1 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Balance
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Withdrawable Cash</span>
          <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ৳ {formatAmount(normalizeTaka(balances.withdrawableBalance))}
          </p>
          <span className="text-[10px] text-muted-foreground block font-medium">Ready for payout</span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Locked / Requested</span>
          <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
            ৳ {formatAmount(normalizeTaka(balances.lockedBalance))}
          </p>
          <span className="text-[10px] text-muted-foreground block font-medium">Pending payout approval</span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Pending Clearance</span>
          <p className="text-xl font-black font-mono text-foreground">
            ৳ {formatAmount(normalizeTaka(balances.pendingBalance))}
          </p>
          <span className="text-[10px] text-muted-foreground block font-medium">Courier holding period</span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase block">Lifetime Earnings</span>
          <p className="text-xl font-black font-mono text-foreground">
            ৳ {formatAmount(normalizeTaka(balances.lifetimeEarnings))}
          </p>
          <span className="text-[10px] text-muted-foreground block font-medium">Total profit earned</span>
        </Card>
      </div>

      {/* 3 Main Modern Tab Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("request")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "request"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Send className="h-4 w-4" /> 💳 Request Payout
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
          <Receipt className="h-4 w-4" /> 📜 Wallet Ledger
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("withdrawals")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
            activeTab === "withdrawals"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" /> ⏳ Payout History
        </button>
      </div>

      {/* TAB 1: REQUEST PAYOUT FORM */}
      {activeTab === "request" && (
        <Card className="rounded-3xl border-border max-w-2xl mx-auto">
          <CardHeader className="p-5 sm:p-6 border-b border-border/60">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" /> Request Payout Withdrawal
            </CardTitle>
            <CardDescription className="text-xs">
              Transfer cleared profits to your Mobile Banking or Bank Account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Payout Method</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(["bkash", "nagad", "rocket", "upay", "bank"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayoutMethod(method)}
                      className={`h-10 text-xs font-extrabold rounded-xl border uppercase transition-all ${
                        payoutMethod === method
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-2xs"
                          : "bg-card text-muted-foreground border-border hover:border-amber-500/50"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Withdrawal Amount (৳ Taka)</label>
                <Input
                  type="number"
                  placeholder="e.g. 1500"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="h-10 text-xs font-mono font-bold rounded-xl"
                  min={100}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {payoutMethod === "bank" ? "Bank Account Number" : `${payoutMethod.toUpperCase()} Personal/Agent Number`}
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 01700000000"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-10 text-xs font-mono rounded-xl"
                />
              </div>

              {payoutMethod === "bank" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Bank Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Islami Bank Bangladesh"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Branch & Routing</label>
                    <Input
                      type="text"
                      placeholder="e.g. Dhanmondi Branch"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs gap-2"
                >
                  <Send className="h-4 w-4" /> Submit Payout Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: WALLET LEDGER STREAM */}
      {activeTab === "ledger" && (
        <Card className="rounded-3xl border-border bg-card">
          <CardHeader className="p-5 border-b border-border/60">
            <CardTitle className="text-base font-extrabold">Wallet Ledger Transactions</CardTitle>
            <CardDescription className="text-xs">History of credited order profits and debit payouts</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {ledger.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No ledger transactions found.</div>
            ) : (
              <div className="space-y-2">
                {ledger.map((item: any, idx: number) => {
                  const amt = item.amount || 0;
                  const taka = normalizeTaka(amt);
                  return (
                    <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-foreground">{item.description || item.entryType || "Wallet Transaction"}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{new Date(item.createdAt || item.timestamp || Date.now()).toLocaleString()}</p>
                      </div>
                      <span className={`font-mono font-black text-sm ${item.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                        {item.type === "credit" ? "+" : "-"} ৳{formatAmount(taka)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: PAYOUT WITHDRAWAL HISTORY */}
      {activeTab === "withdrawals" && (
        <Card className="rounded-3xl border-border bg-card">
          <CardHeader className="p-5 border-b border-border/60">
            <CardTitle className="text-base font-extrabold">Payout Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {withdrawals.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No payout withdrawal requests found.</div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((wit: any) => {
                  const taka = normalizeTaka(wit.amount || 0);
                  return (
                    <div key={wit.id || wit._id} className="rounded-2xl border border-border bg-muted/20 p-4 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-foreground capitalize">
                          {wit.method || "bKash"} Payout #{wit.id?.slice(-6)}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          Account: {wit.payoutDetails?.accountNumber || "N/A"}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-mono font-black text-sm text-foreground">৳ {formatAmount(taka)}</p>
                        <StatusChip label={wit.status} tone={statusToneFromValue(wit.status)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
