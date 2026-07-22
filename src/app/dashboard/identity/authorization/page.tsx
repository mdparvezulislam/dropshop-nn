"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  getPermissionRegistryAction,
  getRolesWithUserCountsAction,
} from "@/features/identity/actions/authorization-actions";
import { ArrowLeft, RefreshCw, ShieldCheck, Users, Key, Shield, ChevronRight, Lock } from "lucide-react";

interface RegistryData {
  modules: string[];
  totalCount: number;
}

interface RoleData {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

export default function AuthorizationPage(): React.ReactElement {
  const [registry, setRegistry] = React.useState<RegistryData | null>(null);
  const [roles, setRoles] = React.useState<RoleData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [regRes, rolesRes] = await Promise.all([
      getPermissionRegistryAction(),
      getRolesWithUserCountsAction(),
    ]);
    if (regRes.success && regRes.data) {
      setRegistry({ modules: regRes.data.modules, totalCount: regRes.data.totalCount });
    }
    if (rolesRes.success && rolesRes.data) {
      setRoles(rolesRes.data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);
  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

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
            <h1 className="text-2xl font-bold text-foreground">অনুমতি কাঠামো</h1>
            <p className="text-sm text-muted-foreground">Enterprise Authorization Framework</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{registry?.totalCount ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total Permissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{registry?.modules.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Modules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{roles.length}</p>
                    <p className="text-xs text-muted-foreground">Roles ({systemRoles.length} system, {customRoles.length} custom)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Assigned Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" /> Permission Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {registry?.modules.map((mod) => (
                  <div
                    key={mod}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] capitalize">{mod}</Badge>
                    </div>
                    <Link
                      href="/dashboard/identity/permissions"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      View <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Roles Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {roles.slice(0, 10).map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold truncate">{role.name}</span>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-[9px] shrink-0">
                          <Lock className="h-2.5 w-2.5 mr-0.5" /> System
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {role.permissions.includes("*") ? "All" : role.permissions.length} perms
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {role.userCount} users
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/identity/permissions">
              <Button size="sm">
                <Key className="h-4 w-4 mr-1" /> Permission Matrix
              </Button>
            </Link>
            <Link href="/dashboard/identity/roles">
              <Button size="sm" variant="outline">
                <Shield className="h-4 w-4 mr-1" /> Role Management
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
