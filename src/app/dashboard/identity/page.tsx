"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIdentityCenterStatsAction } from "@/features/identity/actions/identity-center-actions";
import { getIdentityOpsOverviewAction } from "@/features/identity/actions/admin-identity-actions";
import { toast } from "sonner";
import {
  ArrowLeft, RefreshCw, Users, UserCheck, Building2, ShieldCheck,
  Monitor, AlertTriangle, UserX, UserPlus, Crown, Shield,
} from "lucide-react";

export default function IdentityDashboardPage(): React.ReactElement {
  const [stats, setStats] = React.useState<any>(null);
  const [overview, setOverview] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, overviewRes] = await Promise.all([
        getIdentityCenterStatsAction(),
        getIdentityOpsOverviewAction(),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
    } catch { toast.error("লোড করতে সমস্যা হয়েছে"); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const STAT_CARDS = [
    { key: "totalUsers", label: "মোট ব্যবহারকারী", labelEn: "Total Users", icon: Users, color: "text-blue-400" },
    { key: "customers", label: "কাস্টমার", labelEn: "Customers", icon: UserCheck, color: "text-emerald-400" },
    { key: "resellers", label: "রিসেলার", labelEn: "Resellers", icon: Building2, color: "text-violet-400" },
    { key: "wholesalers", label: "হোলসেলার", labelEn: "Wholesalers", icon: Crown, color: "text-amber-400" },
    { key: "admins", label: "অ্যাডমিন", labelEn: "Admins", icon: Shield, color: "text-rose-400" },
    { key: "pendingApprovals", label: "অনুমোদন বাকি", labelEn: "Pending Approval", icon: AlertTriangle, color: "text-amber-500" },
    { key: "activeSessions", label: "সক্রিয় সেশন", labelEn: "Active Sessions", icon: Monitor, color: "text-sky-400" },
    { key: "suspended", label: "স্থগিত", labelEn: "Suspended", icon: UserX, color: "text-red-400" },
  ];

  const getStatValue = (key: string): number => {
    if (!stats) return 0;
    if (key === "totalUsers") return stats.totalUsers ?? 0;
    if (key === "pendingApprovals") return stats.pendingApprovals ?? 0;
    if (key === "activeSessions") return stats.activeSessions ?? 0;
    if (key === "suspended") return stats.byStatus?.suspended ?? 0;
    if (key === "customers") return stats.byRole?.customer ?? 0;
    if (key === "resellers") return stats.byRole?.reseller ?? 0;
    if (key === "wholesalers") return stats.byRole?.wholesaler ?? 0;
    if (key === "admins") return (stats.byRole?.admin ?? 0) + (stats.byRole?.super_admin ?? 0);
    return 0;
  };

  const QUICK_LINKS = [
    { href: "/dashboard/identity/users", label: "ব্যবহারকারী ডিরেক্টরি", labelEn: "User Directory", icon: Users },
    { href: "/dashboard/identity/applications", label: "অ্যাপ্লিকেশন রিভিউ", labelEn: "Application Review", icon: Building2 },
    { href: "/dashboard/identity/roles", label: "রোল ম্যানেজমেন্ট", labelEn: "Role Management", icon: Shield },
    { href: "/dashboard/identity/permissions", label: "পারমিশন ম্যাট্রিক্স", labelEn: "Permission Matrix", icon: ShieldCheck },
    { href: "/dashboard/identity/staff", label: "স্টাফ ম্যানেজমেন্ট", labelEn: "Staff Management", icon: UserCheck },
    { href: "/dashboard/identity/sessions", label: "সেশন ম্যানেজমেন্ট", labelEn: "Session Management", icon: Monitor },
    { href: "/dashboard/identity/activity", label: "অ্যাক্টিভিটি লগ", labelEn: "Activity Log", icon: AlertTriangle },
    { href: "/dashboard/identity/import", label: "ইম্পোর্ট/এক্সপোর্ট", labelEn: "Import/Export", icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">আইডেন্টিটি সেন্টার</h1>
            <p className="text-sm text-muted-foreground">Enterprise Identity & Access Management</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className="border-border/50 bg-card/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`h-4 w-4 ${card.color}`} />
                  <span className="text-lg font-bold text-foreground">{getStatValue(card.key)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">{card.label}</p>
                <p className="text-[9px] text-muted-foreground/60">{card.labelEn}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-border/50 bg-card lg:col-span-2">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">সাম্প্রতিক রেজিস্ট্রেশন / Recent Registrations</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">লোড হচ্ছে...</p>
            ) : stats?.recentUsers?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">কোনো ব্যবহারকারী নেই</p>
            ) : (
              <div className="space-y-2">
                {stats?.recentUsers?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {(u.fullName ?? "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{u.role}</Badge>
                      <Badge variant={u.status === "active" ? "success" : "warning"} className="text-[10px]">{u.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">রোল ডিস্ট্রিবিউশন / Role Distribution</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">লোড হচ্ছে...</p>
            ) : (
              <div className="space-y-2">
                {stats?.roleDistribution?.map((r: any) => (
                  <div key={r.role} className="flex justify-between items-center text-sm">
                    <span className="capitalize text-muted-foreground">{r.role}</span>
                    <span className="font-bold">{r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3">কুইক লিংকস / Quick Links</h3>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-accent transition-all flex flex-col items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-semibold text-center">{link.label}</span>
                    <span className="text-[9px] text-muted-foreground">{link.labelEn}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
