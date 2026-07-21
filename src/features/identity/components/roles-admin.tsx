"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { listRolesAdminAction } from "../actions/admin-identity-actions";

interface RoleView {
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export function RolesAdmin(): React.ReactElement {
  const [systemRoles, setSystemRoles] = useState<RoleView[]>([]);
  const [dbRoles, setDbRoles] = useState<(RoleView & { id: string })[]>([]);
  const [selected, setSelected] = useState<RoleView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listRolesAdminAction();
    if (res.success && res.data) {
      setSystemRoles(res.data.systemRoles || []);
      setDbRoles((res.data.dbRoles || []) as (RoleView & { id: string })[]);
      setSelected((prev) => prev ?? res.data?.systemRoles?.[0] ?? null);
    } else toast.error(res.error ?? "Failed to load roles");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">
            System role matrix from Identity Engine · read-only ops view
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {systemRoles.map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => setSelected(r)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected?.name === r.name
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/60"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <Shield className="h-3.5 w-3.5" />
                  {r.name}
                </span>
                {r.isSystem && (
                  <Badge variant="outline" className="text-[10px]">
                    system
                  </Badge>
                )}
              </button>
            ))}
            {dbRoles.length > 0 && (
              <>
                <p className="px-2 pt-3 text-[10px] font-semibold uppercase text-muted-foreground">
                  Database roles
                </p>
                {dbRoles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r)}
                    className={`flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/60 ${
                      selected?.name === r.name ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{selected?.name ?? "Select a role"}</CardTitle>
            {selected && (
              <p className="text-xs text-muted-foreground">{selected.description}</p>
            )}
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-muted-foreground">Choose a role to inspect permissions.</p>
            ) : selected.permissions.includes("*") ? (
              <Badge className="bg-primary/15 text-primary">Full access (*)</Badge>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selected.permissions.map((p) => (
                  <Badge key={p} variant="outline" className="font-mono text-[10px]">
                    {p}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
