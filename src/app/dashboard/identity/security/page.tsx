"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSecurityDashboardStatsAction,
  getUserSecurityOverviewAction,
  getRecentFailedLoginsAction,
  getSecurityEventsAction,
} from "@/features/identity/actions/security-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Shield,
  Users,
  Lock,
  AlertTriangle,
  Clock,
  Key,
  Smartphone,
  BarChart3,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "primary" | "emerald" | "rose" | "amber" | "sky";
}

function StatCard({ title, value, icon, color = "primary" }: StatCardProps): React.ReactElement {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-400",
    rose: "bg-rose-500/10 text-rose-400",
    amber: "bg-amber-500/10 text-amber-400",
    sky: "bg-sky-500/10 text-sky-400",
  };

  return (
    <Card className="border-border/50 bg-card">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SecurityPage(): React.ReactElement {
  const [stats, setStats] = React.useState<any>(null);
  const [failedLogins, setFailedLogins] = React.useState<any[]>([]);
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [statsRes, failedRes, eventsRes] = await Promise.all([
      getSecurityDashboardStatsAction(),
      getRecentFailedLoginsAction(20),
      getSecurityEventsAction(),
    ]);
    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (failedRes.success && failedRes.data) setFailedLogins(failedRes.data);
    if (eventsRes.success && eventsRes.data) setEvents(eventsRes.data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-foreground">সিকিউরিটি সেন্টার</h1>
            <p className="text-sm text-muted-foreground">Enterprise Identity Lifecycle & Security Center</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Users" value={stats?.activeUsers ?? 0} icon={<Users className="h-5 w-5" />} color="primary" />
        <StatCard title="Logged-in Users" value={stats?.loggedInUsers ?? 0} icon={<Users className="h-5 w-5" />} color="sky" />
        <StatCard title="Failed Logins" value={stats?.failedLoginAttempts ?? 0} icon={<AlertTriangle className="h-5 w-5" />} color="rose" />
        <StatCard title="Locked Accounts" value={stats?.lockedAccounts ?? 0} icon={<Lock className="h-5 w-5" />} color="rose" />
        <StatCard title="Suspended Users" value={stats?.suspendedUsers ?? 0} icon={<Lock className="h-5 w-5" />} color="amber" />
        <StatCard title="Blocked Users" value={stats?.blockedUsers ?? 0} icon={<Lock className="h-5 w-5" />} color="rose" />
        <StatCard title="Pending Verifications" value={stats?.pendingVerifications ?? 0} icon={<Clock className="h-5 w-5" />} color="amber" />
        <StatCard title="Password Resets" value={stats?.passwordResetRequests ?? 0} icon={<Key className="h-5 w-5" />} color="primary" />
        <StatCard title="Active Sessions" value={stats?.activeSessions ?? 0} icon={<Smartphone className="h-5 w-5" />} color="sky" />
        <StatCard title="Trusted Devices" value={stats?.trustedDevices ?? 0} icon={<Smartphone className="h-5 w-5" />} color="emerald" />
        <StatCard title="New Devices Today" value={stats?.newDevicesToday ?? 0} icon={<Smartphone className="h-5 w-5" />} color="primary" />
        <StatCard title="Security Events" value={stats?.securityEvents?.total ?? 0} icon={<Shield className="h-5 w-5" />} color="primary" />
      </div>

      {/* Security Events Summary */}
      {stats?.securityEvents && (
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" /> Security Events Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.securityEvents.unresolved}</p>
                <p className="text-xs text-muted-foreground">Unresolved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-rose-400">{stats.securityEvents.bySeverity?.critical ?? 0}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{stats.securityEvents.bySeverity?.high ?? 0}</p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-400">{stats.securityEvents.bySeverity?.medium ?? 0}</p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent Security Events */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Recent Security Events
              </div>
              <Link href="/dashboard/identity/security-events">
                <Button size="sm" variant="ghost" className="h-6 text-xs">
                  View All <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.slice(0, 8).map((event) => (
              <div key={event.id} className="p-2.5 rounded-lg border border-border/30 bg-muted/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant={
                        event.severity === "critical" ? "destructive" :
                        event.severity === "high" ? "warning" :
                        event.severity === "medium" ? "secondary" : "muted"
                      }
                      className="text-[9px] shrink-0"
                    >
                      {event.severity}
                    </Badge>
                    <span className="text-xs font-medium truncate">{event.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {event.description && (
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{event.description}</p>
                )}
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">কোনো সিকিউরিটি ইভেন্ট নেই</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Failed Logins */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Recent Failed Logins
              </div>
              <Link href="/dashboard/identity/failed-logins">
                <Button size="sm" variant="ghost" className="h-6 text-xs">
                  View All <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {failedLogins.slice(0, 8).map((f) => (
              <div key={f.id} className="p-2.5 rounded-lg border border-border/30 bg-muted/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="destructive" className="text-[9px] shrink-0">
                      {f.reason?.replace("_", " ")}
                    </Badge>
                    <span className="text-xs font-mono truncate">{f.ipAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-[9px]">
                      {f.attemptCount}x
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(f.lastAttemptAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {failedLogins.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">কোনো ফেইল্ড লগইন নেই</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Quick Security Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/identity/sessions">
              <Button size="sm" variant="outline">
                <Smartphone className="h-4 w-4 mr-1" /> Session Management
              </Button>
            </Link>
            <Link href="/dashboard/identity/devices">
              <Button size="sm" variant="outline">
                <Smartphone className="h-4 w-4 mr-1" /> Device Management
              </Button>
            </Link>
            <Link href="/dashboard/identity/users">
              <Button size="sm" variant="outline">
                <Users className="h-4 w-4 mr-1" /> User Management
              </Button>
            </Link>
            <Link href="/dashboard/identity/audit">
              <Button size="sm" variant="outline">
                <Shield className="h-4 w-4 mr-1" /> Audit Logs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
