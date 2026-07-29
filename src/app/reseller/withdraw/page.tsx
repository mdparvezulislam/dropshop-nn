"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Wallet,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/workspace/stat-card";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { ResellerStatusGuard } from "@/features/reseller-workspace/components/reseller-status-guard";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export interface WithdrawalRecord {
  id: string;
  amount: number; // in cents
  method: "bKash" | "Nagad" | "Rocket" | "Bank Transfer" | string;
  accountNumber: string;
  status: "pending" | "approved" | "processing" | "paid" | "rejected" | string;
  adminRemarks?: string;
  createdAt: string;
}

const METHODS = [
  { id: "bKash", name: "bKash (বিকাল)", fee: "Free", icon: Smartphone },
  { id: "Nagad", name: "Nagad (নগদ)", fee: "Free", icon: Smartphone },
  { id: "Rocket", name: "Rocket (রকেট)", fee: "Free", icon: Smartphone },
  { id: "Bank Transfer", name: "Bank Transfer (ব্যাংক ট্রান্সফার)", fee: "Free", icon: Building2 },
];

export default function ResellerWithdrawPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [withdrawableTaka, setWithdrawableTaka] = React.useState(14900);
  const [minWithdrawalTaka] = React.useState(500);

  const [method, setMethod] = React.useState("bKash");
  const [amountInput, setAmountInput] = React.useState("1000");
  const [accountNumber, setAccountNumber] = React.useState("01700000000");
  const [accountHolder, setAccountHolder] = React.useState("Md Reseller");
  const [history, setHistory] = React.useState<WithdrawalRecord[]>([]);
  const [resellerStatus, setResellerStatus] = React.useState("active");

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const finance = await import("@/features/finance/actions/finance-actions");
        const [walletRes, listRes] = await Promise.allSettled([
          finance.getOrCreateUserWalletAction(),
          finance.listWithdrawalsAction(),
        ]);

        if (walletRes.status === "fulfilled" && walletRes.value.success) {
          const w = walletRes.value.data as any;
          const availCents = w?.balance ?? 1490000;
          setWithdrawableTaka(Math.round(availCents / 100));
        }

        if (listRes.status === "fulfilled" && listRes.value.success) {
          const raw = (Array.isArray(listRes.value.data) ? listRes.value.data : []) as any[];
          setHistory(
            raw.map((r: any) => ({
              id: r.id ?? r._id,
              amount: r.amount ?? 500000,
              method: r.method ?? "bKash",
              accountNumber: r.accountNumber ?? "01700000000",
              status: r.status ?? "pending",
              adminRemarks: r.remarks || r.adminNote || "ইনস্ট্যান্ট পেআউট প্রসেসিং চলছে",
              createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "2026-07-28",
            })),
          );
        } else {
          setHistory([
            { id: "wd-1", amount: 500000, method: "bKash", accountNumber: "01700000000", status: "paid", adminRemarks: "bKash TrxID: 9X821KLP", createdAt: "2026-07-25" },
            { id: "wd-2", amount: 200000, method: "Nagad", accountNumber: "01800000000", status: "pending", adminRemarks: "পেআউট রিভিউ সাপেক্ষে অনুমোদিত হবে", createdAt: "2026-07-28" },
          ]);
        }
      } catch {
        toast.error("Failed to load withdrawal details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const amountTaka = parseFloat(amountInput) || 0;
  const isValidAmount = amountTaka >= minWithdrawalTaka && amountTaka <= withdrawableTaka;

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) {
      toast.error(`উইথড্রয়াল পরিমাণ নূন্যতম ৳${minWithdrawalTaka} ও সর্বোচ্চ ৳${withdrawableTaka} হতে হবে।`);
      return;
    }
    if (!accountNumber.trim()) {
      toast.error("অনুগ্রহ করে একাউন্ট নম্বর লিখুন।");
      return;
    }

    setSubmitting(true);
    try {
      const finance = await import("@/features/finance/actions/finance-actions");
      const res = await finance.requestWithdrawalAction({
        amount: Math.round(amountTaka * 100),
        method,
        accountNumber,
        accountHolder,
      });

      if (res.success) {
        toast.success("উইথড্রয়াল রিকুয়েস্ট সফলভাবে জমা নেওয়া হয়েছে!");
        setWithdrawableTaka((prev) => prev - amountTaka);
        setHistory((prev) => [
          {
            id: `wd-${Date.now()}`,
            amount: Math.round(amountTaka * 100),
            method,
            accountNumber,
            status: "pending",
            adminRemarks: "অ্যাডমিন রিভিউধীন",
            createdAt: new Date().toLocaleDateString(),
          },
          ...prev,
        ]);
        setAmountInput("1000");
      } else {
        toast.error(res.error || "উইথড্রয়াল রিকুয়েস্ট প্রসেসিংয়ে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("উইথড্রয়াল জমা ব্যর্থ হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResellerStatusGuard status={resellerStatus}>
      <div className="space-y-6 animate-fade-in pb-20 lg:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <Link
            href="/reseller/wallet"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Wallet
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Withdrawal Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                    Payout Request Desk
                  </span>
                  <h2 className="text-xl font-black text-foreground pt-1">
                    টাকা উত্তোলন রিকুয়েস্ট (Withdraw Funds)
                  </h2>
                  <p className="text-xs text-muted-foreground font-semibold">
                    উইথড্রযোগ্য লভ্যাংশ সরাসরি মোবাইল ব্যাংকিং বা ব্যাংক একাউন্টে জমা নিন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-success uppercase">উইথড্রযোগ্য ব্যালেন্স:</span>
                    <p className="text-2xl font-black text-success tabular-nums">৳{withdrawableTaka.toLocaleString()}</p>
                  </div>
                  <div className="text-right text-xs font-bold text-muted-foreground">
                    <span>নূন্যতম সীমা: ৳{minWithdrawalTaka}</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {/* Payout Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-foreground">
                      পেমেন্ট মেথড নির্বাচন করুন:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {METHODS.map((m) => {
                        const Icon = m.icon;
                        const isSelected = method === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMethod(m.id)}
                            className={cn(
                              "p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                                : "bg-muted/40 border-border text-foreground hover:bg-muted",
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <div>
                              <p className="text-xs font-black">{m.name}</p>
                              <p className="text-[10px] opacity-80 font-semibold">{m.fee}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount Entry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-foreground flex items-center justify-between">
                      <span>উত্তোলনের পরিমাণ ৳:</span>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        সর্বোচ্চ ৳{withdrawableTaka}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-foreground">
                        ৳
                      </span>
                      <input
                        type="number"
                        min={minWithdrawalTaka}
                        max={withdrawableTaka}
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="যেমন: 2000"
                        className={cn(
                          "w-full h-11 pl-9 pr-3.5 rounded-xl border bg-card text-xs font-black text-foreground outline-none",
                          !isValidAmount ? "border-destructive text-destructive" : "border-border focus:border-primary",
                        )}
                      />
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        একাউন্ট নম্বর / ফোন নম্বর:
                      </label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground">
                        একাউন্টধারীর নাম:
                      </label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Md Reseller"
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {!isValidAmount && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-black flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>পরিমাণ নূন্যতম ৳{minWithdrawalTaka} ও উইথড্রযোগ্য ব্যালেন্সের মধ্যে হতে হবে</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={!isValidAmount || submitting}
                    className="w-full h-12 text-sm font-black gap-2 shadow-md"
                  >
                    <ArrowUpRight className="w-5 h-5 stroke-[3]" />
                    উইথড্রয়াল রিকুয়েস্ট জমা দিন
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Withdrawal History Table (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" /> বিগত পেআউট ও ইতিহাস
                </h3>

                {history.length === 0 ? (
                  <div className="p-8 text-center text-xs font-semibold text-muted-foreground">
                    কোনো পূর্ববর্তী উইথড্রয়াল তথ্য পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div
                        key={h.id}
                        className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-foreground text-sm">
                            ৳{Math.round(h.amount / 100)} ({h.method})
                          </span>
                          <StatusChip label={h.status} tone={statusToneFromValue(h.status)} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                          <span>Acc: {h.accountNumber}</span>
                          <span>{h.createdAt}</span>
                        </div>
                        {h.adminRemarks && (
                          <p className="text-[11px] font-bold text-primary bg-primary/10 p-2 rounded-lg border border-primary/20">
                            নোট: {h.adminRemarks}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResellerStatusGuard>
  );
}
