"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  ChevronRight,
  User,
  Shield,
  Bell,
  Truck,
  Headphones,
  Sparkles,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OverviewData {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    profileImage?: string;
  };
  orderCount: number;
  wishlistCount: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
  }[];
}

const QUICK_ACTIONS = [
  { label: "অর্ডার ট্র্যাক", href: "/account/orders", icon: Truck, color: "text-amber-500 bg-amber-500/10" },
  { label: "আমার অর্ডার", href: "/account/orders", icon: Package, color: "text-emerald-500 bg-emerald-500/10" },
  { label: "ঠিকানাসমূহ", href: "/account/addresses", icon: MapPin, color: "text-blue-500 bg-blue-500/10" },
  { label: "সাপোর্ট", href: "/contact", icon: Headphones, color: "text-violet-500 bg-violet-500/10" },
  { label: "প্রোফাইল", href: "/account/profile", icon: User, color: "text-rose-500 bg-rose-500/10" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "পেন্ডিং", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  confirmed: { label: "কনফার্মড", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  processing: { label: "প্রসেসিং", color: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300" },
  shipped: { label: "ডেলিভারিতে আছে", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300" },
  delivered: { label: "ডেলিভার্ড", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  cancelled: { label: "বাতিল", color: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function AccountOverviewContent({ data }: { data: OverviewData }) {
  const latestOrder = data.recentOrders[0];
  const activeOrdersCount = data.recentOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  ).length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
      {/* Welcome Card */}
      <div className="bg-linear-to-br from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-amber-500 text-slate-950 ring-2 ring-amber-500/40 shrink-0 flex items-center justify-center font-black text-xl shadow-xs">
              {data.user.profileImage ? (
                <Image src={data.user.profileImage} alt="" fill className="object-cover" />
              ) : (
                data.user.fullName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black truncate">
                  স্বাগতম, {data.user.fullName.split(" ")[0]}!
                </h1>
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
              </div>
              <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                {data.user.phone || data.user.email}
              </p>
            </div>
          </div>

          <Link
            href="/account/profile"
            className="text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/15 px-3 py-1.5 rounded-xl transition-all active:scale-95 touch-manipulation shrink-0"
          >
            প্রোফাইল
          </Link>
        </div>

        {/* Order Counters Bar */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 relative z-10 text-center">
          <div className="bg-white/5 rounded-xl p-2">
            <span className="block text-lg font-black text-amber-400 tabular-nums">{data.orderCount}</span>
            <span className="text-[10px] font-bold text-slate-300">মোট অর্ডার</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="block text-lg font-black text-emerald-400 tabular-nums">{activeOrdersCount}</span>
            <span className="text-[10px] font-bold text-slate-300">চলতি অর্ডার</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="block text-lg font-black text-rose-400 tabular-nums">{data.wishlistCount}</span>
            <span className="text-[10px] font-bold text-slate-300">উইশলিস্ট</span>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="space-y-2">
        <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider px-1">
          কুইক অ্যাকশন
        </h2>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-amber-300 transition-all active:scale-95 touch-manipulation"
              >
                <div className={`p-2 rounded-xl ${action.color} mb-1`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Latest Active Order Banner */}
      {latestOrder && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-slate-100">
              <Clock className="h-4 w-4 text-amber-500" aria-hidden />
              <span>সাম্প্রতিক অর্ডার</span>
            </span>
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                STATUS_MAP[latestOrder.status]?.color ?? "bg-slate-100 text-slate-800"
              }`}
            >
              {STATUS_MAP[latestOrder.status]?.label ?? latestOrder.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <p className="font-black text-slate-900 dark:text-slate-100">{latestOrder.orderNumber}</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {formatDate(latestOrder.createdAt)}
              </p>
            </div>

            <div className="text-right">
              <p className="font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {formatBdt(latestOrder.total)}
              </p>
              <Link
                href={`/account/orders/${latestOrder.id}`}
                className="inline-flex items-center text-[11px] font-black text-slate-700 dark:text-slate-300 hover:text-amber-600 mt-0.5"
              >
                ডিটেইলস <ChevronRight className="h-3 w-3 ml-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
            অর্ডার হিস্টোরি
          </h2>
          <Link
            href="/account/orders"
            className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
          >
            সব দেখুন <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <ShoppingBag className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-500">এখনো কোনো অর্ডার করেননি</p>
            <Link
              href="/products"
              className="inline-block text-xs font-black bg-amber-500 text-slate-950 px-4 py-2 rounded-xl transition-all active:scale-95 mt-1 shadow-xs"
            >
              কেনাকাটা শুরু করুন
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentOrders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] ?? {
                label: order.status,
                color: "bg-slate-100 text-slate-800",
              };
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors active:bg-slate-100 touch-manipulation"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatBdt(order.total)}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AccountOverviewContent;
