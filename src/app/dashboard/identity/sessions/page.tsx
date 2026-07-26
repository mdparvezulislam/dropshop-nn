"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listAllActiveSessionsAdminAction } from "@/features/identity/actions/admin-identity-actions";
import { forceLogoutUserAction } from "@/features/identity/actions/session-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Search, Monitor, Smartphone, LogOut, Globe } from "lucide-react";

export default function SessionsPage(): React.ReactElement {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listAllActiveSessionsAdminAction();
    if (res.success && res.data) setSessions(res.data);
    else {
      setSessions([]);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleForceLogout = async (userId: string) => {
    const res = await forceLogoutUserAction(userId);
    if (res.success) {
      toast.success("সেশন বাতিল করা হয়েছে");
      load();
    } else toast.error("ব্যর্থ");
  };

  const filtered = sessions.filter(
    (s) =>
      !search ||
      s.userId?.includes(search) ||
      s.ipAddress?.includes(search) ||
      s.userAgent?.toLowerCase().includes(search.toLowerCase()),
  );

  const parseDevice = (ua: string) => {
    if (!ua) return { type: "Unknown", icon: Monitor };
    if (/mobile|android|iphone/i.test(ua)) return { type: "Mobile", icon: Smartphone };
    return { type: "Desktop", icon: Monitor };
  };

  const parseBrowser = (ua: string) => {
    if (!ua) return "Unknown";
    if (/chrome/i.test(ua)) return "Chrome";
    if (/firefox/i.test(ua)) return "Firefox";
    if (/safari/i.test(ua)) return "Safari";
    if (/edge/i.test(ua)) return "Edge";
    return "Other";
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/identity"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">সেশন ম্যানেজমেন্ট</h1>
            <p className="text-sm text-muted-foreground">{sessions.length} সক্রিয় সেশন</p>
          </div>
        </div>
        <Button variant="ghost" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="IP বা ইউজার আইডি খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  ইউজার আইডি
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  ডিভাইস
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  ব্রাউজার
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  IP অ্যাড্রেস
                </th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">
                  শেষ অ্যাক্টিভিটি
                </th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    কোনো সক্রিয় সেশন নেই
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const device = parseDevice(s.userAgent);
                  const browser = parseBrowser(s.userAgent);
                  return (
                    <tr key={s.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-3 text-sm font-mono">{s.userId?.substring(0, 12)}...</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm">
                          <device.icon className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                          {device.type}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{browser}</td>
                      <td className="p-3 text-sm font-mono flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" /> {s.ipAddress}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {s.lastActivity ? new Date(s.lastActivity).toLocaleString() : "—"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleForceLogout(s.userId)}
                          className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
