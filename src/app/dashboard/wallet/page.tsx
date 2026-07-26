"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  getOrCreateUserWalletAction,
  getWalletBalanceAction,
  requestWithdrawalAction,
  listLedgerEntriesAction,
  listWithdrawalsAction,
  listInvoicesAction,
} from "@/features/finance/actions/finance-actions";
import { toast } from "sonner";
import { DollarSign, Send, ArrowUpRight, Landmark, Receipt } from "lucide-react";

export default function ResellerWalletPage() {
  const { data: session } = useSession() as any;

  const [wallet, setWallet] = React.useState<any>(null);
  const [balances, setBalances] = React.useState<any>({
    availableBalance: 0,
    pendingBalance: 0,
    lockedBalance: 0,
    withdrawableBalance: 0,
    lifetimeEarnings: 0,
    lifetimeWithdrawals: 0,
  });

  const [activeTab, setActiveTab] = React.useState<"ledger" | "withdrawals" | "invoices">("ledger");
  const [ledger, setLedger] = React.useState<any[]>([]);
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = React.useState("");
  const [payoutMethod, setPayoutMethod] = React.useState<
    "bkash" | "nagad" | "rocket" | "upay" | "bank"
  >("bkash");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [branchName, setBranchName] = React.useState("");
  const [routingNumber, setRoutingNumber] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get or Create Reseller/User Wallet
      const walletRes = await getOrCreateUserWalletAction();
      if (walletRes.success && walletRes.data) {
        const w = walletRes.data;
        setWallet(w);

        // 2. Fetch Wallet Balances
        const balRes = await getWalletBalanceAction({ walletId: w.id });
        if (balRes.success && balRes.data) {
          setBalances(balRes.data);
        }

        // 3. Fetch Ledger Entries
        const ledRes = await listLedgerEntriesAction({ walletId: w.id });
        if (ledRes.success && ledRes.data) {
          setLedger(Array.isArray(ledRes.data) ? ledRes.data : ledRes.data.items || []);
        }

        // 4. Fetch Withdrawals
        const witRes = await listWithdrawalsAction(w.id);
        if (witRes.success && witRes.data) {
          setWithdrawals(Array.isArray(witRes.data) ? witRes.data : witRes.data.items || []);
        }
      }

      // 5. Fetch Invoices
      const invRes = await listInvoicesAction();
      if (invRes.success && invRes.data) {
        setInvoices(invRes.data);
      }
    } catch (err) {
      toast.error("Failed to load wallet dashboard metadata");
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

    const amountCents = Math.floor(parseFloat(withdrawAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (amountCents > balances.withdrawableBalance) {
      toast.error("Requested amount exceeds available withdrawable balance limit");
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
        toast.success("Withdrawal request submitted successfully and locked in ledger");
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
      toast.error(err.message || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "cleared":
        return "success" as const;
      case "pending":
      case "under_review":
        return "warning" as const;
      case "rejected":
      case "cancelled":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Merchant E-Wallet</h1>
        <p className="text-sm text-slate-400">
          Track order earnings, profit payouts clearances, and withdrawals
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Withdrawable Cash
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(balances.withdrawableBalance)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Available: {formatCurrency(balances.availableBalance)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5" /> Locked / Requested
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">
              {formatCurrency(balances.lockedBalance)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" /> Pending Clearance
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-indigo-400">
              {formatCurrency(balances.pendingBalance)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> Lifetime Earnings
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-indigo-400">
              {formatCurrency(balances.lifetimeEarnings)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardContent className="p-2 flex gap-2">
              <button
                onClick={() => setActiveTab("ledger")}
                className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "ledger"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Ledger Statements
              </button>
              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "withdrawals"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Withdrawals History
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`flex items-center gap-2 px-4 h-9 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "invoices"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Generated Invoices
              </button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              {activeTab === "ledger" && (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Reference</TableHead>
                      <TableHead className="text-slate-400">Entry Type</TableHead>
                      <TableHead className="text-slate-400">Amount</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Holding Clears At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                          No ledger records registered
                        </TableCell>
                      </TableRow>
                    ) : (
                      ledger.map((l) => (
                        <TableRow key={l.id} className="border-slate-800">
                          <TableCell className="text-xs text-slate-400">
                            {new Date(l.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-indigo-300">
                            {l.referenceNumber || l.id.slice(-8)}
                          </TableCell>
                          <TableCell className="font-mono text-xs capitalize text-indigo-400">
                            {l.type.replace("_", " ")}
                          </TableCell>
                          <TableCell
                            className={`font-semibold ${l.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {l.amount >= 0 ? "+" : ""}
                            {formatCurrency(l.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(l.status)}>{l.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-slate-400">
                            {l.clearsAt ? new Date(l.clearsAt).toLocaleDateString() : "Immediate"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {activeTab === "withdrawals" && (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Request Ref</TableHead>
                      <TableHead className="text-slate-400">Method</TableHead>
                      <TableHead className="text-slate-400">Details</TableHead>
                      <TableHead className="text-slate-400">Amount</TableHead>
                      <TableHead className="text-slate-400 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                          No withdrawals requested
                        </TableCell>
                      </TableRow>
                    ) : (
                      withdrawals.map((w) => (
                        <TableRow key={w.id} className="border-slate-800">
                          <TableCell className="text-xs text-slate-400">
                            {new Date(w.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-indigo-300">
                            {w.referenceNumber || w.id.slice(-8)}
                          </TableCell>
                          <TableCell className="capitalize text-slate-200">{w.method}</TableCell>
                          <TableCell className="text-xs text-slate-300">
                            {w.payoutDetails?.accountNumber}
                            {w.payoutDetails?.bankName && ` (${w.payoutDetails.bankName})`}
                          </TableCell>
                          <TableCell className="font-semibold text-white">
                            {formatCurrency(w.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={getStatusVariant(w.status)}>{w.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {activeTab === "invoices" && (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Invoice Number</TableHead>
                      <TableHead className="text-slate-400">Order Number</TableHead>
                      <TableHead className="text-slate-400">Grand Total</TableHead>
                      <TableHead className="text-slate-400">Billing Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-500 text-xs">
                          No invoices generated
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((i) => (
                        <TableRow key={i.id} className="border-slate-800">
                          <TableCell className="font-semibold text-indigo-300 text-xs">
                            {i.invoiceNumber}
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">{i.orderNumber}</TableCell>
                          <TableCell className="font-semibold text-white">
                            {formatCurrency(i.grandTotal)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(i.status)}>{i.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-slate-500">
                            {new Date(i.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Send className="h-4 w-4" /> Request Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">
                    Withdraw Amount (BDT)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Available withdrawable: {formatCurrency(balances.withdrawableBalance)}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Payout Method</label>
                  <select
                    value={payoutMethod}
                    onChange={(e: any) => setPayoutMethod(e.target.value)}
                    className="w-full h-9 rounded border border-slate-800 bg-slate-950 px-2.5 text-xs text-white outline-none"
                  >
                    <option value="bkash">bKash (Mobile Wallet)</option>
                    <option value="nagad">Nagad (Mobile Wallet)</option>
                    <option value="rocket">Rocket (Mobile Wallet)</option>
                    <option value="upay">Upay (Mobile Wallet)</option>
                    <option value="bank">Traditional Bank Transfer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">
                    {payoutMethod === "bank" ? "Bank Account Number" : "Mobile Wallet Number"}
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. +8801700112233 or 1002931812"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Account Owner Name</label>
                  <Input
                    type="text"
                    required
                    placeholder="Full owner name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                {payoutMethod === "bank" && (
                  <div className="space-y-3 pt-2 border-t border-slate-850">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400">Bank Name</label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. Dutch Bangla Bank, BRAC Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400">Branch Name</label>
                      <Input
                        type="text"
                        required
                        placeholder="Branch city/area"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-400">Routing Number</label>
                      <Input
                        type="text"
                        placeholder="9-digit Routing code"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500"
                >
                  {submitting ? "Submitting Payout..." : "Request Payout"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
