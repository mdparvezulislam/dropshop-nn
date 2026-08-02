"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Key,
  Lock,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const SYSTEM_ROLES = [
  {
    id: "super_admin",
    title: "Super Admin",
    description: "Unrestricted platform ownership, billing, security, and infrastructure management",
    permissionsCount: 48,
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  },
  {
    id: "admin",
    title: "Administrator",
    description: "Full management of products, orders, fulfillment, customers, and staff",
    permissionsCount: 42,
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  },
  {
    id: "manager",
    title: "Operations Manager",
    description: "Can manage inventory, orders, courier pickups, and reseller approvals",
    permissionsCount: 28,
    badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  },
  {
    id: "staff",
    title: "Support Staff",
    description: "View and process customer orders, issue returns, and print shipping labels",
    permissionsCount: 16,
    badgeColor: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  },
  {
    id: "reseller",
    title: "Reseller Partner",
    description: "Access private reseller catalog, wallet payouts, and reseller order placement",
    permissionsCount: 12,
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  },
  {
    id: "wholesaler",
    title: "Wholesale Partner",
    description: "Access B2B bulk tier pricing and wholesale ordering engine",
    permissionsCount: 10,
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  },
];

export default function SecurityRolesPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Security permissions updated!");
    }, 400);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground">
              Roles & Security Center
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold">
              SYSTEM SECURITY
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review system permission matrices, role definitions, and access policy controls.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          size="sm"
          variant="outline"
          disabled={loading}
          className="h-9 text-xs font-bold gap-1 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Policy
        </Button>
      </div>

      {/* System Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SYSTEM_ROLES.map((role) => (
          <Card key={role.id} className="rounded-3xl border-border bg-card p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <h3 className="font-extrabold text-foreground text-sm">{role.title}</h3>
              </div>
              <Badge variant="outline" className={`text-[10px] font-bold ${role.badgeColor}`}>
                {role.permissionsCount} Permissions
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">{role.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
              <span>Role ID: {role.id}</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Active Policy
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
