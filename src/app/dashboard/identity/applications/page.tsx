"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIdentityOpsOverviewAction } from "@/features/identity/actions/admin-identity-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Building2, CheckCircle, XCircle, Clock, Users } from "lucide-react";

export default function ApplicationsPage(): React.ReactElement {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await getIdentityOpsOverviewAction();
    if (res.success && res.data) setData(res.data);
    else toast.error("লোড ব্যর্থ");
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const applications = data?.recentApprovals ?? [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/identity" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">অ্যাপ্লিকেশন রিভিউ</h1>
            <p className="text-sm text-muted-foreground">Reseller & Wholesale Application Review</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-amber-400"><Clock className="h-4 w-4" /><span className="text-xs text-muted-foreground">Pending</span></div>
            <p className="text-xl font-bold">{data?.pendingApprovals ?? 0}</p></CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-emerald-400"><CheckCircle className="h-4 w-4" /><span className="text-xs text-muted-foreground">Active Users</span></div>
            <p className="text-xl font-bold text-emerald-400">{data?.activeUsers ?? 0}</p></CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-rose-400"><Users className="h-4 w-4" /><span className="text-xs text-muted-foreground">Suspended</span></div>
            <p className="text-xl font-bold text-rose-400">{data?.suspendedUsers ?? 0}</p></CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3"><div className="flex items-center gap-2 text-sky-400"><Building2 className="h-4 w-4" /><span className="text-xs text-muted-foreground">Active Sessions</span></div>
            <p className="text-xl font-bold text-sky-400">{data?.activeSessions ?? 0}</p></CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">ব্যবসার নাম</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">মালিক</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">রোল</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">স্ট্যাটাস</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">কোনো অ্যাপ্লিকেশন নেই</td></tr>
              ) : applications.map((app: any) => (
                <tr key={app.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3 text-sm font-medium">{app.businessName}</td>
                  <td className="p-3 text-sm">{app.ownerName}<br /><span className="text-xs text-muted-foreground">{app.email}</span></td>
                  <td className="p-3"><Badge variant="outline" className="capitalize">{app.role}</Badge></td>
                  <td className="p-3"><Badge variant="warning">{app.status}</Badge></td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" disabled><CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve</Button>
                      <Button size="sm" variant="destructive" disabled><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
