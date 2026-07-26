"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFollowUpStatsAction } from "@/features/order/actions/follow-up-actions";
import { getCallLogStatsAction } from "@/features/order/actions/call-log-actions";
import { getComplaintStatsAction } from "@/features/order/actions/complaint-actions";
import { getFailedDeliveryStatsAction } from "@/features/order/actions/failed-delivery-actions";
import { getReturnStatsAction } from "@/features/order/actions/return-actions";
import { getWarrantyStatsAction } from "@/features/order/actions/warranty-actions";
import { getExchangeStatsAction } from "@/features/order/actions/exchange-actions";
import { toast } from "sonner";
import {
  RefreshCw,
  Phone,
  MessageSquare,
  AlertTriangle,
  PackageX,
  ThumbsUp,
  ShieldCheck,
  Repeat,
  Clock,
  Users,
} from "lucide-react";

export default function CustomerOperationsPage(): React.ReactElement {
  const [stats, setStats] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [fu, cl, comp, fd, ret, war, exc] = await Promise.all([
        getFollowUpStatsAction(),
        getCallLogStatsAction(),
        getComplaintStatsAction(),
        getFailedDeliveryStatsAction(),
        getReturnStatsAction(),
        getWarrantyStatsAction(),
        getExchangeStatsAction(),
      ]);

      setStats({
        pendingFollowUps: fu.success ? Object.values(fu.data ?? {}).reduce((a, b) => a + b, 0) : 0,
        todayCalls: cl.success ? Object.values(cl.data ?? {}).reduce((a, b) => a + b, 0) : 0,
        failedDeliveries: fd.success ? Object.values(fd.data ?? {}).reduce((a, b) => a + b, 0) : 0,
        openComplaints: comp.success
          ? Object.values(comp.data ?? {}).reduce((a, b) => a + b, 0)
          : 0,
        resolvedCases: 0,
        warrantyRequests: war.success
          ? Object.values(war.data ?? {}).reduce((a, b) => a + b, 0)
          : 0,
        exchangeRequests: exc.success
          ? Object.values(exc.data ?? {}).reduce((a, b) => a + b, 0)
          : 0,
        pendingResponses: 0,
      });
    } catch {
      toast.error("স্ট্যাটাস লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const STAT_CARDS = [
    {
      key: "pendingFollowUps",
      label: "পেন্ডিং ফলো-আপ",
      labelEn: "Pending Follow-ups",
      color: "text-amber-400",
      icon: Clock,
    },
    {
      key: "todayCalls",
      label: "আজকের কল",
      labelEn: "Today's Calls",
      color: "text-blue-400",
      icon: Phone,
    },
    {
      key: "failedDeliveries",
      label: "ফেলড ডেলিভারি",
      labelEn: "Failed Deliveries",
      color: "text-rose-400",
      icon: PackageX,
    },
    {
      key: "openComplaints",
      label: "গ্রাহক কমপ্লেইন্ট",
      labelEn: "Customer Complaints",
      color: "text-red-400",
      icon: AlertTriangle,
    },
    {
      key: "resolvedCases",
      label: "রিজলভড কেস",
      labelEn: "Resolved Cases",
      color: "text-emerald-400",
      icon: ThumbsUp,
    },
    {
      key: "warrantyRequests",
      label: "ওয়ারেন্টি রিকোয়েস্ট",
      labelEn: "Warranty Requests",
      color: "text-violet-400",
      icon: ShieldCheck,
    },
    {
      key: "exchangeRequests",
      label: "এক্সচেঞ্জ রিকোয়েস্ট",
      labelEn: "Exchange Requests",
      color: "text-indigo-400",
      icon: Repeat,
    },
    {
      key: "pendingResponses",
      label: "পেন্ডিং রেসপন্স",
      labelEn: "Pending Responses",
      color: "text-orange-400",
      icon: MessageSquare,
    },
  ];

  const QUICK_LINKS = [
    {
      href: "/dashboard/orders/follow-ups",
      label: "ফলো-আপস",
      labelEn: "Follow-ups",
      icon: Clock,
      color: "text-amber-400",
    },
    {
      href: "/dashboard/orders/complaints",
      label: "কমপ্লেইন্টস",
      labelEn: "Complaints",
      icon: AlertTriangle,
      color: "text-red-400",
    },
    {
      href: "/dashboard/orders/call-log",
      label: "কল লগ",
      labelEn: "Call Log",
      icon: Phone,
      color: "text-blue-400",
    },
    {
      href: "/dashboard/orders/failed-deliveries",
      label: "ফেলড ডেলিভারি",
      labelEn: "Failed Deliveries",
      icon: PackageX,
      color: "text-rose-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              গ্রাহক অপারেশনস{" "}
              <span className="text-muted-foreground text-lg font-normal">Customer Operations</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              গ্রাহক সেবা, ফলো-আপ এবং কমপ্লেইন্ট ম্যানেজমেন্ট
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="flex flex-wrap gap-2">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Icon className={`h-4 w-4 ${link.color}`} />
                <span>{link.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${card.color}`} />
                  <span className="text-2xl font-bold text-foreground">
                    {loading ? "—" : (stats[card.key] ?? 0)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                <p className="text-[10px] text-muted-foreground/60">{card.labelEn}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            দ্রুত অপশন <span className="text-muted-foreground font-normal">Quick Actions</span>
          </h3>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {[
              {
                href: "/dashboard/orders/customers",
                label: "গ্রাহক প্রোফাইল",
                labelEn: "Customer Profiles",
                icon: Users,
              },
              {
                href: "/dashboard/orders/follow-ups",
                label: "ফলো-আপ",
                labelEn: "Follow-ups",
                icon: Clock,
              },
              {
                href: "/dashboard/orders/complaints",
                label: "কমপ্লেইন্ট",
                labelEn: "Complaints",
                icon: AlertTriangle,
              },
              {
                href: "/dashboard/orders",
                label: "অর্ডার প্যানেল",
                labelEn: "Orders Panel",
                icon: RefreshCw,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant="outline" className="w-full h-auto flex-col gap-1.5 py-4">
                    <Icon className="h-5 w-5" />
                    <div className="text-xs leading-tight">
                      <div>{item.label}</div>
                      <div className="text-muted-foreground">{item.labelEn}</div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
