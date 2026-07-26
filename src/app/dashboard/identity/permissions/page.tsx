"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getPermissionMatrixAction,
  grantAllPermissionsAction,
  removeAllPermissionsAction,
  copyPermissionsFromRoleAction,
  updateRoleWithValidationAction,
} from "@/features/identity/actions/authorization-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";

interface MatrixRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export default function PermissionsPage(): React.ReactElement {
  const [modules, setModules] = React.useState<string[]>([]);
  const [actions, setActions] = React.useState<string[]>([]);
  const [roles, setRoles] = React.useState<MatrixRole[]>([]);
  const [matrix, setMatrix] = React.useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set());
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  const [showCopyDialog, setShowCopyDialog] = React.useState(false);
  const [copyTarget, setCopyTarget] = React.useState<string>("");
  const [copySource, setCopySource] = React.useState<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await getPermissionMatrixAction();
    if (res.success && res.data) {
      setModules(res.data.modules);
      setActions(res.data.actions);
      setRoles(res.data.roles);
      setMatrix(res.data.matrix);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggleModule = (mod: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedModules(new Set(modules));
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  const getModulePermissions = (mod: string) => {
    const perms: string[] = [];
    for (const action of actions) {
      perms.push(`${mod}.${action}`);
    }
    return perms;
  };

  const isModuleExpanded = (mod: string) => {
    return expandedModules.has(mod);
  };

  const filteredModules = React.useMemo(() => {
    if (!search.trim()) return modules;
    const q = search.toLowerCase();
    return modules.filter((mod) => mod.includes(q));
  }, [modules, search]);

  const visibleActions = React.useMemo(() => {
    if (!search.trim()) return actions;
    const q = search.toLowerCase();
    return actions.filter((a) => a.includes(q));
  }, [actions, search]);

  const handleGrantAll = async (roleId: string) => {
    const res = await grantAllPermissionsAction(roleId);
    if (res.success) {
      toast.success("সব পারমিশন দেওয়া হয়েছে");
      load();
    } else {
      toast.error(res.error ?? "ব্যর্থ");
    }
  };

  const handleRemoveAll = async (roleId: string) => {
    if (!window.confirm("সব পারমিশন মুছে ফেলবেন?")) return;
    const res = await removeAllPermissionsAction(roleId);
    if (res.success) {
      toast.success("সব পারমিশন মুছে ফেলা হয়েছে");
      load();
    } else {
      toast.error(res.error ?? "ব্যর্থ");
    }
  };

  const handleCopyPermissions = async () => {
    if (!copySource || !copyTarget) {
      toast.error("উৎস এবং লক্ষ্য নির্বাচন করুন");
      return;
    }
    const res = await copyPermissionsFromRoleAction(copySource, copyTarget);
    if (res.success) {
      toast.success("পারমিশন কপি হয়েছে");
      setShowCopyDialog(false);
      load();
    } else {
      toast.error(res.error ?? "ব্যর্থ");
    }
  };

  const handleTogglePermission = async (roleId: string, permission: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role || role.isSystem) return;

    const newPerms = role.permissions.includes(permission)
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];

    const res = await updateRoleWithValidationAction(roleId, { permissions: newPerms });
    if (res.success) {
      load();
    } else {
      toast.error(res.error ?? "ব্যর্থ");
    }
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
            <h1 className="text-2xl font-bold text-foreground">পারমিশন ম্যাট্রিক্স</h1>
            <p className="text-sm text-muted-foreground">Permission Matrix — Role × Action Grid</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowCopyDialog(true)}>
            <Copy className="h-4 w-4 mr-1" /> Copy Permissions
          </Button>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="h-8 w-full rounded-lg border border-border bg-card pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={expandAll} className="h-8 text-xs">
          Expand All
        </Button>
        <Button size="sm" variant="ghost" onClick={collapseAll} className="h-8 text-xs">
          Collapse All
        </Button>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Filter className="h-3 w-3" />
          {filteredModules.length} modules, {roles.length} roles
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
      ) : (
        <Card className="border-border/50 bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="p-3 text-left font-semibold text-muted-foreground sticky left-0 bg-muted/30 min-w-[200px]">
                      Permission
                    </th>
                    {roles.map((role) => (
                      <th
                        key={role.id}
                        className={`p-2 text-center font-semibold min-w-[90px] cursor-pointer transition-colors ${
                          selectedRole === role.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/20"
                        }`}
                        onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="capitalize text-[11px]">
                            {role.name.split(" ").slice(-1)[0]}
                          </span>
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-[8px] px-1">
                              SYS
                            </Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.map((mod) => {
                    const expanded = isModuleExpanded(mod);
                    const modulePerms = getModulePermissions(mod);
                    const moduleCount = modulePerms.filter((p) =>
                      roles.some((r) => r.permissions.includes("*") || matrix[r.id]?.[p]),
                    ).length;

                    return (
                      <React.Fragment key={mod}>
                        <tr
                          className="border-b border-border/30 bg-muted/10 cursor-pointer hover:bg-muted/20"
                          onClick={() => toggleModule(mod)}
                        >
                          <td
                            className="p-3 font-semibold text-foreground sticky left-0 bg-muted/10"
                            colSpan={1}
                          >
                            <div className="flex items-center gap-2">
                              {expanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span className="capitalize">{mod}</span>
                              <Badge variant="secondary" className="text-[9px]">
                                {modulePerms.length}
                              </Badge>
                            </div>
                          </td>
                          {roles.map((role) => {
                            const allHave = modulePerms.every(
                              (p) => role.permissions.includes("*") || matrix[role.id]?.[p],
                            );
                            const someHave = modulePerms.some(
                              (p) => role.permissions.includes("*") || matrix[role.id]?.[p],
                            );
                            return (
                              <td key={role.id} className="p-2 text-center">
                                {allHave ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 inline" />
                                ) : someHave ? (
                                  <div className="h-3.5 w-3.5 rounded-full bg-amber-400/30 inline-flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                  </div>
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-muted-foreground/20 inline" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        {expanded &&
                          modulePerms
                            .filter((p) => {
                              if (!search.trim()) return true;
                              return p.toLowerCase().includes(search.toLowerCase());
                            })
                            .map((perm) => {
                              const action = perm.split(".").pop() || "";
                              return (
                                <tr
                                  key={perm}
                                  className="border-b border-border/20 hover:bg-muted/10"
                                >
                                  <td className="p-3 font-mono text-left sticky left-0 bg-card pl-8">
                                    <span className="text-muted-foreground">{mod}.</span>
                                    <span className="text-foreground">{action}</span>
                                  </td>
                                  {roles.map((role) => {
                                    const has =
                                      role.permissions.includes("*") || matrix[role.id]?.[perm];
                                    const isEditable = !role.isSystem;
                                    return (
                                      <td key={role.id} className="p-2 text-center">
                                        <button
                                          type="button"
                                          disabled={!isEditable}
                                          onClick={() => handleTogglePermission(role.id, perm)}
                                          className={`inline-flex items-center justify-center w-6 h-6 rounded transition-colors ${
                                            isEditable
                                              ? "hover:bg-muted/50 cursor-pointer"
                                              : "cursor-not-allowed opacity-50"
                                          }`}
                                        >
                                          {has ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                                          ) : (
                                            <X className="h-3.5 w-3.5 text-muted-foreground/30" />
                                          )}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedRole && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Selected: {roles.find((r) => r.id === selectedRole)?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {roles.find((r) => r.id === selectedRole)?.permissions.includes("*")
                    ? "All permissions"
                    : `${roles.find((r) => r.id === selectedRole)?.permissions.length ?? 0} permissions`}
                </p>
              </div>
              <div className="flex gap-2">
                {!roles.find((r) => r.id === selectedRole)?.isSystem && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGrantAll(selectedRole)}
                    >
                      Grant All
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveAll(selectedRole)}
                    >
                      Remove All
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => setSelectedRole(null)}>
                  Deselect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copy Permissions Between Roles</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Source Role
              </label>
              <select
                value={copySource}
                onChange={(e) => setCopySource(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
              >
                <option value="">Select source...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isSystem ? "(System)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Target Role
              </label>
              <select
                value={copyTarget}
                onChange={(e) => setCopyTarget(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs"
              >
                <option value="">Select target...</option>
                {roles
                  .filter((r) => !r.isSystem)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCopyDialog(false)}>
              বাতিল
            </Button>
            <Button size="sm" onClick={handleCopyPermissions}>
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
