"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Wallet,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ApprovalItem {
  id: string;
  type: "reseller" | "withdrawal" | "review";
  applicantName: string;
  contact: string;
  details: string;
  amountOrRating?: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
}

const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: "APP-001",
    type: "reseller",
    applicantName: "আরিফ ট্রেডার্স (মোহাম্মদ আরিফ)",
    contact: "01711223344 • Dhaka",
    details: "রিসেলার অ্যাকাউন্ট নিবন্ধনের জন্য আবেদন করেছেন। শপ নাম: আরিফ অনলাইন শপ।",
    timestamp: "১৫ মিনিট আগে",
    status: "pending",
  },
  {
    id: "APP-002",
    type: "withdrawal",
    applicantName: "তানভীর আহমেদ (রিসেলার)",
    contact: "bKash: 01812345678",
    details: "ওয়ালেট কমিশন পে-আউট রিকোয়েস্ট।",
    amountOrRating: "৳৫,৪৫০",
    timestamp: "১ ঘণ্টা আগে",
    status: "pending",
  },
  {
    id: "APP-003",
    type: "review",
    applicantName: "সাইফুল ইসলাম (কাস্টমার)",
    contact: "Product: Prestige Electric Kettle",
    details: "প্রোডাক্টের কোয়ালিটি অনেক ভালো ছিল, ধন্যবাদ ড্রপশপ!",
    amountOrRating: "★ ★ ★ ★ ★",
    timestamp: "৩ ঘণ্টা আগে",
    status: "pending",
  },
];

export default function AdminApprovalCenterPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(MOCK_APPROVALS);
  const [activeFilter, setActiveFilter] = useState<"all" | "reseller" | "withdrawal" | "review">("all");

  const filtered = approvals.filter(
    (item) => activeFilter === "all" || item.type === activeFilter,
  );

  const handleAction = (id: string, action: "approve" | "reject") => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action === "approve" ? "approved" : "rejected" } : item)),
    );
    toast.success(action === "approve" ? "সফলভাবে অনুমোদন করা হয়েছে!" : "আবেদন বাতিল করা হয়েছে।");
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black flex items-center gap-2">
              অ্যাপ্রুভাল সেন্টার
              <Sparkles className="h-4 w-4 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              রিসেলার রেজিস্ট্রেশন, পে-আউট ও কাস্টমার রিভিউ অনুমোদন করুন
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 flex gap-1 shadow-xs overflow-x-auto">
        {[
          { id: "all", label: "সবগুলো" },
          { id: "reseller", label: "রিসেলার আবেদন" },
          { id: "withdrawal", label: "পে-আউট রিকোয়েস্ট" },
          { id: "review", label: "প্রোডাক্ট রিভিউ" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as any)}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-black transition-all touch-manipulation whitespace-nowrap ${
              activeFilter === tab.id
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-2">
            <ShieldAlert className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-500">কোনো পেন্ডিং অনুমোদন নেই</p>
          </div>
        ) : (
          filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold ${
                      item.type === "reseller"
                        ? "bg-blue-500/10 text-blue-600"
                        : item.type === "withdrawal"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {item.type === "reseller" ? (
                      <UserCheck className="h-5 w-5" />
                    ) : item.type === "withdrawal" ? (
                      <Wallet className="h-5 w-5" />
                    ) : (
                      <Star className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                      {item.applicantName}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.contact}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 shrink-0">
                  <Clock className="h-3 w-3" />
                  {item.timestamp}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-medium">{item.details}</p>
                {item.amountOrRating && (
                  <p className="font-black text-amber-600 dark:text-amber-400 mt-1">
                    {item.amountOrRating}
                  </p>
                )}
              </div>

              {item.status === "pending" ? (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() => handleAction(item.id, "approve")}
                    className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs gap-1.5 shadow-xs touch-manipulation active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>অনুমোদন করুন</span>
                  </Button>

                  <Button
                    onClick={() => handleAction(item.id, "reject")}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl border-rose-200 text-rose-600 dark:border-rose-900/60 dark:text-rose-400 font-bold text-xs gap-1.5 touch-manipulation active:scale-95 hover:bg-rose-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>বাতিল</span>
                  </Button>
                </div>
              ) : (
                <div className="pt-1 text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full ${
                      item.status === "approved"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {item.status === "approved" ? "অনুমোদিত" : "বাতিল করা হয়েছে"}
                  </span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
