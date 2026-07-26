"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Loader2, RefreshCw, Shield, UserCheck, Users, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getIdentityOpsOverviewAction } from "../actions/admin-identity-actions";

interface OverviewData {
  pendingApprovals: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  activeSessions: number;
  recentApprovals: {
    id: string;
    businessName: string;
    role: string;
    status: string;
    ownerName: string;
    email: string;
    createdAt: Date;
  }[];
}

export function IdentityOverview(): React.ReactElement {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getIdentityOpsOverviewAction();
    if (!res.success) {
      setError(res.error ?? "Failed to load");
      setData(null);
    } else {
      setData(res.data as OverviewData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    {
      label: "Pending approvals",
      value: data?.pendingApprovals ?? 0,
      icon: Building2,
      href: "/dashboard/identity/approvals",
      tone: "text-amber-500",
    },
    {
      label: "Active users",
      value: data?.activeUsers ?? 0,
      icon: Users,
      href: "/dashboard/identity/users",
      tone: "text-emerald-500",
    },
    {
      label: "Suspended",
      value: data?.suspendedUsers ?? 0,
      icon: UserCheck,
      href: "/dashboard/identity/users",
      tone: "text-rose-500",
    },
    {
      label: "Active sessions",
      value: data?.activeSessions ?? 0,
      icon: Monitor,
      href: "/dashboard/identity/sessions",
      tone: "text-sky-500",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Identity Control</h1>
          <p className="text-sm text-muted-foreground">
            Users, business approvals, sessions, and roles — powered by the Identity Engine.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
          <Link href="/dashboard/identity/approvals">
            <Button size="sm" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Review queue
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link href={c.href}>
              <Card className="transition-colors hover:border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <c.icon className={`h-3.5 w-3.5 ${c.tone}`} />
                    {c.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tabular-nums">
                    {loading && !data ? "—" : c.value}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Pending business applications</CardTitle>
            <Link
              href="/dashboard/identity/approvals"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {!data?.recentApprovals?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No pending applications.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {data.recentApprovals.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.ownerName} · {p.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize shrink-0">
                      {p.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/dashboard/identity/users", label: "Manage users" },
              { href: "/dashboard/identity/roles", label: "Roles & permissions" },
              { href: "/dashboard/identity/sessions", label: "Active sessions" },
              { href: "/dashboard/audit", label: "Audit center" },
              { href: "/dashboard/settings", label: "Platform settings" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-lg border border-border/50 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                {l.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
