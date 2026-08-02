"use client";

import * as React from "react";
import {
  Wallet,
  Send,
  Edit3,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  CreditCard,
  Loader2,
  RefreshCw,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  getResellerWalletSummaryAction,
  submitResellerWithdrawalAction,
  saveResellerPaymentNumberAction,
} from "@/features/finance/actions/finance-actions";

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
  { id: "bKash", label: "bKash (বিকাশ)", color: "bg-pink-500/10 text-pink-600 border-pink-200" },
  { id: "Nagad", label: "Nagad (নগদ)", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  { id: "Rocket", label: "Rocket (রকেট)", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  { id: "Bank", label: "Bank (ব্যাংক)", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function ResellerWalletPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [balanceTaka, setBalanceTaka] = React.useState(0);
  const [totalEarningsTaka, setTotalEarningsTaka] = React.useState(0);
  const [pendingWithdrawalTaka, setPendingWithdrawalTaka] = React.useState(0);
  const [minWithdrawalTaka, setMinWithdrawalTaka] = React.useState(500);

  // Form states
  const [amountInput, setAmountInput] = React.useState("500");
  const [selectedMethod, setSelectedMethod] = React.useState("bKash");
  const [paymentNumber, setPaymentNumber] = React.useState("01700000000");
  const [editingNumber, setEditingNumber] = React.useState(false);

  // History state
  const [history, setHistory] = React.useState<WithdrawalHistoryItem[]>([]);

  const loadWalletData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResellerWalletSummaryAction();
      if (res.success && res.data) {
        setBalanceTaka(res.data.balanceTaka);
        setTotalEarningsTaka(res.data.totalEarningsTaka);
        setPendingWithdrawalTaka(res.data.pendingWithdrawalTaka);
        setMinWithdrawalTaka(res.data.minWithdrawalTaka || 500);
        if (res.data.savedPaymentNumber) {
          setPaymentNumber(res.data.savedPaymentNumber);
        }
        if (res.data.savedPaymentMethod) {
          setSelectedMethod(res.data.savedPaymentMethod);
        }
        setHistory(res.data.history || []);
      } else {
        toast.error(res.error || "ওয়ালেট ব্যালেন্স লোড করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভার সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleSavePaymentNumber = async () => {
    if (!paymentNumber.trim()) {
      toast.error("সঠিক পেমেন্ট নম্বর প্রদান করুন।");
      return;
    }

    try {
      const res = await saveResellerPaymentNumberAction({
        method: selectedMethod,
        accountNumber: paymentNumber.trim(),
      });
      if (res.success) {
        toast.success("পেমেন্ট নম্বর সেভ করা হয়েছে!");
        setEditingNumber(false);
      } else {
        toast.error(res.error || "সেভ করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("পেমেন্ট নম্বর সেভ করা যায়নি");
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt < minWithdrawalTaka) {
      toast.error(`অন্তত ৳${minWithdrawalTaka} উইথড্র করতে হবে।`);
      return;
    }

    if (amt > balanceTaka) {
      toast.error(`পর্যাপ্ত ব্যালেন্স নেই! আপনার বর্তমান ব্যালেন্স ৳${balanceTaka.toLocaleString("bn-BD")}`);
      return;
    }

    if (!paymentNumber.trim()) {
      toast.error("পেমেন্ট নম্বর দেওয়া আবশ্যক!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitResellerWithdrawalAction({
        amountTaka: amt,
        method: selectedMethod,
        accountNumber: paymentNumber.trim(),
      });

      if (res.success) {
        toast.success(`৳${amt.toLocaleString("bn-BD")} টাকা উইথড্র রিকোয়েস্ট পাঠানো হয়েছে!`);
        loadWalletData();
      } else {
        toast.error(res.error || "আবেদন জমা দিতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResellerStatusGuard>
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto p-3 sm:p-6 pb-20 sm:pb-8">
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black font-heading text-foreground">
                মাই ওয়ালেট (My Wallet)
              </h1>
              <p className="text-[11px] font-semibold text-muted-foreground">
                লাভের টাকা সরাসরি বিকাশ/নগদে উত্তোলন করুন
              </p>
            </div>
          </div>

          <Button
            onClick={loadWalletData}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-8 sm:h-9 px-2.5 text-xs font-bold gap-1 rounded-xl"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </Button>
        </div>

        {/* Streamlined App Hero Balance Card */}
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-5 sm:p-7 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-950/80 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> উত্তোলনযোগ্য ব্যালেন্স
              </span>
              <span className="text-[10px] font-extrabold bg-slate-950/20 text-slate-950 px-2.5 py-0.5 rounded-full border border-slate-950/20">
                ২৪ঘণ্টা পে-আউট
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-slate-950">
                ৳ {balanceTaka.toLocaleString("bn-BD")}
              </span>
            </div>

            {/* Badges Bar */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <div className="bg-slate-950/15 border border-slate-950/20 rounded-xl px-3 py-1 text-[11px] font-extrabold flex items-center gap-1.5 text-slate-950">
                <TrendingUp className="h-3.5 w-3.5 text-slate-950" />
                মোট লাভ: ৳{totalEarningsTaka.toLocaleString("bn-BD")}
              </div>

              {pendingWithdrawalTaka > 0 && (
                <div className="bg-slate-950 text-amber-400 font-extrabold rounded-xl px-3 py-1 text-[11px] flex items-center gap-1.5 shadow-xs">
                  <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                  পেন্ডিং উইথড্র: ৳{pendingWithdrawalTaka.toLocaleString("bn-BD")}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Withdrawal Form Card */}
        <Card className="rounded-3xl border border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Send className="h-4 w-4 text-amber-500" />
              টাকা তুলুন (Withdraw Funds)
            </h2>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
              {/* Payment Method selector buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground block">
                  পেমেন্ট মেথড সিলেক্ট করুন
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={cn(
                        "h-10 px-3 rounded-2xl text-xs font-black transition-all border text-center cursor-pointer flex items-center justify-center gap-1.5",
                        selectedMethod === m.id
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted border-border/80",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input with Quick Selection Chips */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground block">
                  উইথড্র করার পরিমাণ (টাকা)
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-sm text-muted-foreground">
                    ৳
                  </span>
                  <input
                    type="number"
                    required
                    min={minWithdrawalTaka}
                    max={balanceTaka}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="500"
                    className="w-full h-11 pl-8 pr-3 rounded-2xl border border-border bg-background text-sm font-black font-mono text-foreground outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountInput(String(amt))}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-muted/60 hover:bg-amber-500/20 hover:text-amber-600 text-muted-foreground border border-border shrink-0 transition-colors"
                    >
                      + ৳{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmountInput(String(balanceTaka))}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0"
                  >
                    সব ব্যালেন্স
                  </button>
                </div>
              </div>

              {/* Number Field */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-foreground flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                    {selectedMethod} নম্বর:
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingNumber((prev) => !prev)}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="h-3 w-3" />
                    {editingNumber ? "সম্পন্ন" : "পরিবর্তন"}
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    disabled={!editingNumber}
                    value={paymentNumber}
                    onChange={(e) => setPaymentNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="flex-1 h-9 px-3 rounded-xl border border-border bg-background text-xs font-black font-mono text-foreground outline-none focus:border-amber-500 disabled:opacity-80"
                  />
                  {editingNumber && (
                    <Button
                      type="button"
                      onClick={handleSavePaymentNumber}
                      className="h-9 px-3 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl"
                    >
                      সেভ
                    </Button>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={submitting || balanceTaka < minWithdrawalTaka}
                className="w-full h-11 text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> উইথড্র প্রসেস হচ্ছে...
                  </span>
                ) : (
                  <span>উইথড্র রিকোয়েস্ট পাঠান (Request Payout)</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Withdrawal History Card */}
        <Card className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border/80 flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              উইথড্রয়াল হিস্ট্রি ({history.length})
            </h2>
          </div>

          <CardContent className="p-3 sm:p-4">
            {history.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-muted-foreground">
                এখনো কোনো উইথড্রয়াল রিকোয়েস্ট করা হয়নি।
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => {
                  const st = item.status.toLowerCase();
                  const isPending = st === "pending";
                  const isPaid = ["paid", "completed", "approved"].includes(st);
                  const isRejected = st === "rejected";

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-foreground">{item.method}</span>
                          <span className="font-mono font-bold text-muted-foreground">({item.accountNumber})</span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-black border uppercase",
                              isPending && "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300",
                              isPaid && "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300",
                              isRejected && "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300",
                            )}
                          >
                            {isPending && "পেন্ডিং"}
                            {isPaid && "পেইড"}
                            {isRejected && "বাতিল"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{item.date}</p>
                        {item.comment && (
                          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {item.comment}
                          </p>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                          ৳ {item.amountTaka.toLocaleString("bn-BD")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResellerStatusGuard>
  );
}
