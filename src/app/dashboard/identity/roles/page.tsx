"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getRolesWithUserCountsAction,
  createRoleWithValidationAction,
  updateRoleWithValidationAction,
  deleteRoleAction,
  cloneRoleAction,
  grantAllPermissionsAction,
  removeAllPermissionsAction,
} from "@/features/identity/actions/authorization-actions";
import { getPermissionRegistryAction } from "@/features/identity/actions/authorization-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Copy,
  Users,
  Key,
  Check,
  X,
  Search,
} from "lucide-react";

interface RoleData {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

interface PermissionItem {
  module: string;
  resource: string;
  action: string;
  fullPermission: string;
}

export default function RolesPage(): React.ReactElement {
  const [roles, setRoles] = React.useState<RoleData[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [editRole, setEditRole] = React.useState<RoleData | null>(null);
  const [cloneSource, setCloneSource] = React.useState<RoleData | null>(null);
  const [newName, setNewName] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(new Set());
  const [permSearch, setPermSearch] = React.useState("");
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [rolesRes, permRes] = await Promise.all([
      getRolesWithUserCountsAction(),
      getPermissionRegistryAction(),
    ]);
    if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data);
    if (permRes.success && permRes.data) setPermissions(permRes.data.permissions);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const modules = React.useMemo(() => {
    const map = new Map<string, PermissionItem[]>();
    for (const p of permissions) {
      if (!map.has(p.module)) map.set(p.module, []);
      map.get(p.module)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissions]);

  const filteredModules = React.useMemo(() => {
    if (!permSearch.trim()) return modules;
    const q = permSearch.toLowerCase();
    return modules
      .map(
        ([mod, perms]) =>
          [
            mod,
            perms.filter(
              (p) => p.fullPermission.includes(q) || p.action.includes(q) || p.resource.includes(q),
            ),
          ] as const,
      )
      .filter(([, perms]) => perms.length > 0);
  }, [modules, permSearch]);

  const toggleModule = (mod: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  };

  const togglePerm = (perm: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const selectModule = (mod: string, perms: PermissionItem[]) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      const allSelected = perms.every((p) => next.has(p.fullPermission));
      for (const p of perms) {
        if (allSelected) next.delete(p.fullPermission);
        else next.add(p.fullPermission);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPermissions(new Set(permissions.map((p) => p.fullPermission)));
  };

  const clearAll = () => {
    setSelectedPermissions(new Set());
  };

  const openCreate = () => {
    setNewName("");
    setNewDesc("");
    setSelectedPermissions(new Set());
    setShowCreate(true);
    setEditRole(null);
    setCloneSource(null);
  };

  const openEdit = (role: RoleData) => {
    setNewName(role.name);
    setNewDesc(role.description);
    setSelectedPermissions(new Set(role.permissions));
    setEditRole(role);
    setShowCreate(true);
    setCloneSource(null);
  };

  const openClone = (role: RoleData) => {
    setNewName(`${role.name} (Copy)`);
    setNewDesc(`Cloned from ${role.name}`);
    setSelectedPermissions(new Set(role.permissions));
    setCloneSource(role);
    setShowCreate(true);
    setEditRole(null);
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error("নাম দিন");
      return;
    }
    setSaving(true);
    try {
      const perms = Array.from(selectedPermissions);
      if (editRole) {
        const res = await updateRoleWithValidationAction(editRole.id, {
          name: newName,
          description: newDesc,
          permissions: perms,
        });
        if (res.success) {
          toast.success("রোল আপডেট হয়েছে");
          setShowCreate(false);
          load();
        } else {
          toast.error(res.error ?? "ব্যর্থ");
        }
      } else if (cloneSource) {
        const res = await cloneRoleAction({
          sourceRoleId: cloneSource.id,
          newName: newName,
        });
        if (res.success) {
          toast.success("রোল ক্লোন হয়েছে");
          setShowCreate(false);
          load();
        } else {
          toast.error(res.error ?? "ব্যর্থ");
        }
      } else {
        const res = await createRoleWithValidationAction({
          name: newName,
          description: newDesc,
          permissions: perms,
        });
        if (res.success) {
          toast.success("রোল তৈরি হয়েছে");
          setShowCreate(false);
          load();
        } else {
          toast.error(res.error ?? "ব্যর্থ");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" রোল মুছে ফেলবেন?`)) return;
    const res = await deleteRoleAction(id);
    if (res.success) {
      toast.success("মুছে ফেলা হয়েছে");
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
            <h1 className="text-2xl font-bold text-foreground">রোল ম্যানেজমেন্ট</h1>
            <p className="text-sm text-muted-foreground">Role Management & Permissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> নতুন রোল
          </Button>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" /> সিস্টেম রোল
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">লোড হচ্ছে...</p>
            ) : (
              roles
                .filter((r) => r.isSystem)
                .map((role) => (
                  <div key={role.id} className="p-3 rounded-lg border border-border/50 bg-muted/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold capitalize">{role.name}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-[10px]">
                          <Lock className="h-2.5 w-2.5 mr-0.5" /> System
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openClone(role)}
                          title="Clone role"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{role.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 6).map((p) => (
                        <Badge key={p} variant="outline" className="text-[9px]">
                          {p}
                        </Badge>
                      ))}
                      {role.permissions.length > 6 && (
                        <Badge variant="outline" className="text-[9px]">
                          +{role.permissions.length - 6} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {role.userCount} users
                      </span>
                      <span className="flex items-center gap-1">
                        <Key className="h-3 w-3" />{" "}
                        {role.permissions.includes("*") ? "All" : role.permissions.length} perms
                      </span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Edit2 className="h-4 w-4" /> কাস্টম রোল
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">লোড হচ্ছে...</p>
            ) : roles.filter((r) => !r.isSystem).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">কোনো কাস্টম রোল নেই</p>
            ) : (
              roles
                .filter((r) => !r.isSystem)
                .map((role) => (
                  <div key={role.id} className="p-3 rounded-lg border border-border/50 bg-muted/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{role.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openEdit(role)}
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openClone(role)}
                          title="Clone"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-rose-400 hover:text-rose-500"
                          onClick={() => handleDelete(role.id, role.name)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description || "—"}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {role.userCount} users
                      </span>
                      <span className="flex items-center gap-1">
                        <Key className="h-3 w-3" /> {role.permissions.length} perms
                      </span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editRole ? "রোল সম্পাদনা" : cloneSource ? "রোল ক্লোন" : "নতুন রোল তৈরি"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                রোলের নাম *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Role name"
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                বর্ণনা
              </label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description"
                className="h-9"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  পারমিশন ({selectedPermissions.size} selected)
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={selectAll} className="h-7 text-[10px]">
                    Select All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearAll} className="h-7 text-[10px]">
                    Clear All
                  </Button>
                </div>
              </div>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="Search permissions..."
                  className="h-8 w-full rounded-lg border border-border bg-muted/30 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                {filteredModules.map(([mod, perms]) => {
                  const allSelected = perms.every((p) => selectedPermissions.has(p.fullPermission));
                  const someSelected = perms.some((p) => selectedPermissions.has(p.fullPermission));
                  const expanded = expandedModules.has(mod) || !!permSearch.trim();
                  return (
                    <div key={mod} className="border-b border-border/30 last:border-0">
                      <div
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleModule(mod)}
                      >
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected && !allSelected;
                          }}
                          onChange={() => selectModule(mod, perms)}
                          className="rounded border-border"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs font-semibold capitalize flex-1">{mod}</span>
                        <Badge variant="secondary" className="text-[9px]">
                          {perms.length}
                        </Badge>
                      </div>
                      {expanded && (
                        <div className="pl-8 pb-1">
                          {perms.map((p) => (
                            <label
                              key={p.fullPermission}
                              className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-muted/20 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.has(p.fullPermission)}
                                onChange={() => togglePerm(p.fullPermission)}
                                className="rounded border-border"
                              />
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {p.resource}.{p.action}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>
              বাতিল
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              {editRole ? "আপডেট" : cloneSource ? "ক্লোন করুন" : "সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
