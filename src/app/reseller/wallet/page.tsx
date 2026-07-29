"use client";

import * as React from "react";
import {
  Wallet,
  AlertCircle,
  Send,
  Edit3,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/workspace/status-chip";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export interface WithdrawalHistoryItem {
  serial: number;
  id: string;
  date: string;
  method: string;
  accountNumber: string;
  amountTaka: number;
  status: string;
  comment: string;
}

const PAYMENT_METHODS = [
  { id: "bKash", label: "বিকাশ (bKash)" },
  { id: "Nagad", label: "নগদ (Nagad)" },
  { id: "Rocket", label: "রকেট (Rocket)" },
  { id: "Bank", label: "ব্যাংক ট্রান্সফার (Bank Transfer)" },
];

export default function ResellerWalletPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [balanceTaka, setBalanceTaka] = React.useState(210);
  const [minWithdrawalTaka, setMinWithdrawalTaka] = React.useState(500);

  // Form states
  const [amountInput, setAmountInput] = React.useState("500");
  const [selectedMethod, setSelectedMethod] = React.useState("bKash");
  const [paymentNumber, setPaymentNumber] = React.useState("01700000000");
  const [editingNumber, setEditingNumber] = React.useState(false);

  // History state
  const [history, setHistory] = React.useState<WithdrawalHistoryItem[]>([
    {
      serial: 1,
      id: "wd-101",
      date: "২৬ জুন, ২০২৬ এ ৫:৩৯ AM",
      method: "বিকাশ",
      accountNumber: "01700000000",
      amountTaka: 1000,
      status: "paid",
      comment: "TRANSACTION ID DFN2MBC84U REF:1078007261741137",
    },
  ]);

  const loadWalletData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { getResellerWalletSummaryAction } = await import(
        "@/features/finance/actions/finance-actions"
      );
      const res = await getResellerWalletSummaryAction();
      if (res.success && res.data) {
        setBalanceTaka(res.data.balanceTaka);
        setMinWithdrawalTaka(res.data.minWithdrawalTaka || 500);
        if (res.data.savedPaymentNumber) {
          setPaymentNumber(res.data.savedPaymentNumber);
        }
        if (res.data.savedPaymentMethod) {
          setSelectedMethod(res.data.savedPaymentMethod);
        }
        if (res.data.history && res.data.history.length > 0) {
          setHistory(res.data.history);
        }
      }
    } catch {
      // Fallback stays in state
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleSavePaymentNumber = async () => {
    if (!paymentNumber.trim()) {
      toast.error("অনুগ্রহ করে সঠিক পেমেন্ট নম্বর প্রদান করুন।");
      return;
    }

    try {
      const { saveResellerPaymentNumberAction } = await import(
        "@/features/finance/actions/finance-actions"
      );
      const res = await saveResellerPaymentNumberAction({
        method: selectedMethod,
        accountNumber: paymentNumber.trim(),
      });

      if (res.success) {
        toast.success("পেমেন্ট নম্বর আপডেট ও সংরক্ষণ করা হয়েছে!");
        setEditingNumber(false);
      } else {
        toast.error("পেমেন্ট নম্বর আপডেট ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("একটি ত্রুটি ঘটেছে।");
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    const amt = parseFloat(amountInput) || 0;
    if (amt < minWithdrawalTaka) {
      toast.error(`উইথড্রয়াল পরিমাণ নূন্যতম ৳${minWithdrawalTaka} হতে হবে।`);
      return;
    }

    if (balanceTaka < amt) {
      toast.error("পর্যাপ্ত ব্যালেন্স নেই।");
      return;
    }

    if (!paymentNumber.trim()) {
      toast.error("পেমেন্ট নম্বর প্রদান করুন।");
      return;
    }

    setSubmitting(true);
    try {
      const { submitResellerWithdrawalAction } = await import(
        "@/features/finance/actions/finance-actions"
      );
      const res = await submitResellerWithdrawalAction({
        amountTaka: amt,
        method: selectedMethod,
        accountNumber: paymentNumber.trim(),
      });

      if (res.success) {
        toast.success("উইথড্রয়াল অনুরোধ সফলভাবে পাঠানো হয়েছে!");
        loadWalletData();
      } else {
        toast.error(res.error || "উইথড্রয়াল অনুরোধ পাঠানো ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("একটি ত্রুটি ঘটেছে।");
    } finally {
      setSubmitting(false);
    }
  };

  const isBalanceInsufficient = balanceTaka < minWithdrawalTaka;

  return (
    <ResellerStatusGuard status="active">
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Top Title */}
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            উত্তোলনের অনুরোধ
          </h1>
          <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
            আপনার বর্তমান ব্যালেন্স থেকে টাকা উত্তোলন করুন
          </p>
        </div>

        {/* Main Card Container */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Top Grid: Balance Cards + Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Stat Cards (5 cols) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                {/* Current Balance */}
                <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                    বর্তমান ব্যালেন্স
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                    {balanceTaka}৳
                  </p>
                </div>

                {/* Minimum Withdrawal */}
                <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                    সর্বনিম্ন উত্তোলন
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                    {minWithdrawalTaka}৳
                  </p>
                </div>
              </div>

              {/* Right Column: Alert + Request Form (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Insufficient Balance Alert (Matching Screenshot UI) */}
                {isBalanceInsufficient && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-black text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>পর্যাপ্ত ব্যালেন্স নেই</span>
                    </div>
                    <p className="text-[11px] font-bold text-rose-600/90 dark:text-rose-300 pl-5">
                      টাকা উত্তোলন করার জন্য আপনার অ্যাকাউন্টে কমপক্ষে {minWithdrawalTaka} টাকা থাকতে হবে।
                    </p>
                  </div>
                )}

                {/* Request Form */}
                <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Amount Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground block">
                        টাকার পরিমাণ
                      </label>
                      <input
                        type="number"
                        min={minWithdrawalTaka}
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="500"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card text-xs font-bold text-foreground outline-none focus:border-rose-500"
                      />
                    </div>

                    {/* Payment Method Select */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground block">
                        লেনদেনের মাধ্যম
                      </label>
                      <select
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card text-xs font-bold text-foreground outline-none focus:border-rose-500"
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Payment Number with Edit Option */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        পেমেন্ট নম্বর / অ্যাকাউন্ট
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditingNumber(!editingNumber)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {editingNumber ? "বাতিল" : "নম্বর পরিবর্তন"}
                      </button>
                    </div>

                    {editingNumber ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={paymentNumber}
                          onChange={(e) => setPaymentNumber(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="flex-1 h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-foreground outline-none focus:border-rose-500"
                        />
                        <Button
                          type="button"
                          onClick={handleSavePaymentNumber}
                          size="sm"
                          className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                        >
                          সেভ করুন
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-foreground bg-card p-2 rounded-xl border border-border/60">
                        <span>{paymentNumber || "নম্বর সেট করা নেই"}</span>
                        <span className="text-[10px] font-sans text-muted-foreground font-semibold">
                          ({selectedMethod})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button (Matching Screenshot Red Button) */}
                  <Button
                    type="submit"
                    disabled={isBalanceInsufficient || submitting}
                    className={cn(
                      "w-full h-11 rounded-xl text-white font-bold text-xs transition-all shadow-md",
                      isBalanceInsufficient
                        ? "bg-rose-300 dark:bg-rose-950 text-white/70 cursor-not-allowed"
                        : "bg-rose-600 hover:bg-rose-700",
                    )}
                  >
                    {submitting ? "প্রসেসিং হচ্ছে..." : "উত্তোলনের অনুরোধ পাঠান"}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section: Withdrawal History (উত্তোলনের ইতিহাস) */}
        <div className="space-y-3 pt-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground">
              উত্তোলনের ইতিহাস
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              আপনার পূর্ববর্তী সকল উত্তোলনের তালিকা
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-200/80 dark:bg-slate-800/80 text-foreground font-black border-b border-border">
                <tr>
                  <th className="py-3 px-3.5 text-center">ক্রমিক</th>
                  <th className="py-3 px-3.5">তারিখ</th>
                  <th className="py-3 px-3.5">মাধ্যম</th>
                  <th className="py-3 px-3.5 text-right">পরিমাণ</th>
                  <th className="py-3 px-3.5 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-3.5">কমেন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-semibold">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground font-bold">
                      আর কোনো তথ্য নেই
                    </td>
                  </tr>
                ) : (
                  history.map((h, idx) => (
                    <tr key={h.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-3.5 text-center text-muted-foreground font-mono font-bold">
                        {h.serial || idx + 1}
                      </td>
                      <td className="py-3.5 px-3.5 text-foreground whitespace-nowrap">
                        {h.date}
                      </td>
                      <td className="py-3.5 px-3.5 font-bold text-foreground">
                        {h.method} ({h.accountNumber})
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono font-black text-foreground">
                        {h.amountTaka.toLocaleString()}৳
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block",
                            h.status === "paid" || h.status === "approved" || h.status === "সম্পন্ন"
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : h.status === "rejected"
                              ? "bg-rose-500 text-white border-rose-600"
                              : "bg-amber-500 text-white border-amber-600",
                          )}
                        >
                          {h.status === "paid" || h.status === "approved"
                            ? "সম্পন্ন"
                            : h.status === "rejected"
                            ? "বাতিল"
                            : "পেন্ডিং"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-[10px] text-muted-foreground max-w-xs truncate">
                        {h.comment || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {history.length > 0 && (
            <div className="text-center pt-2">
              <span className="text-xs font-semibold text-rose-500">
                আর কোনো তথ্য নেই
              </span>
            </div>
          )}
        </div>
      </div>
    </ResellerStatusGuard>
  );
}
