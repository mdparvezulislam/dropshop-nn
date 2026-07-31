"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  listUsersAdminAction,
  updateUserStatusAdminAction,
  updateUserRolesAdminAction,
  softDeleteUserAdminAction,
  checkUserDependenciesAdminAction,
  permanentlyDeleteUserAdminAction,
} from "@/features/identity/actions/admin-identity-actions";
import { bulkUpdateUserStatusAction } from "@/features/identity/actions/identity-center-actions";
import { forceLogoutUserAction } from "@/features/identity/actions/session-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Eye,
  Ban,
  CheckCircle,
  Monitor,
  Download,
  Shield,
  Trash2,
  AlertTriangle,
  UserCog,
  X,
  Check,
} from "lucide-react";

const AVAILABLE_ROLES = [
  { id: "customer", label: "Customer", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { id: "reseller", label: "Reseller", color: "bg-amber-100 text-amber-900 border-amber-300" },
  { id: "wholesaler", label: "Wholesaler", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { id: "dealer", label: "Dealer", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { id: "supplier", label: "Supplier", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { id: "staff", label: "Staff", color: "bg-slate-100 text-slate-800 border-slate-300" },
  { id: "manager", label: "Manager", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { id: "support", label: "Support", color: "bg-teal-100 text-teal-800 border-teal-300" },
  { id: "admin", label: "Admin", color: "bg-rose-100 text-rose-800 border-rose-300" },
  { id: "super_admin", label: "Super Admin", color: "bg-rose-200 text-rose-900 border-rose-400" },
];

export default function UserDirectoryPage(): React.ReactElement {
  const [users, setUsers] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Role Editor state
  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [isSavingRoles, setIsSavingRoles] = React.useState(false);

  // Deletion Dialog state
  const [deletingUser, setDeletingUser] = React.useState<any | null>(null);
  const [deleteMode, setDeleteMode] = React.useState<"soft" | "permanent">("soft");
  const [confirmText, setConfirmText] = React.useState("");
  const [dependencies, setDependencies] = React.useState<{
    orderCount: number;
    walletBalanceBdt: number;
    hasResellerProfile: boolean;
  } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listUsersAdminAction({
      page,
      limit: 25,
      search: search || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
    });
    if (res.success && res.data) {
      setUsers(res.data.items as any[]);
      setTotal(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } else {
      toast.error(res.error ?? "Failed to load users");
    }
    setLoading(false);
  }, [search, roleFilter, statusFilter, page]);

  React.useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const handleStatus = async (userId: string, status: "active" | "pending" | "suspended") => {
    const res = await updateUserStatusAdminAction({ userId, status });
    if (res.success) {
      toast.success(`ব্যবহারকারী ${status} হয়েছে`);
      load();
    } else toast.error(res.error ?? "আপডেট ব্যর্থ");
  };

  const handleForceLogout = async (userId: string) => {
    const res = await forceLogoutUserAction(userId);
    if (res.success) {
      toast.success(`সেশন বাতিল করা হয়েছে`);
      load();
    } else toast.error("ব্যর্থ");
  };

  const handleBulkAction = async (status: "active" | "suspended") => {
    if (selectedIds.size === 0) {
      toast.error("অন্তত একজন নির্বাচন করুন");
      return;
    }
    const res = await bulkUpdateUserStatusAction(Array.from(selectedIds), status);
    if (res.success) {
      toast.success(`${res.data?.processed} জন আপডেট হয়েছে`);
      setSelectedIds(new Set());
      load();
    } else toast.error(res.error ?? "ব্যর্থ");
  };

  const openRoleEditor = (user: any) => {
    setEditingUser(user);
    const roles = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role || "customer"];
    setSelectedRoles(roles);
  };

  const toggleRoleSelection = (roleId: string) => {
    if (roleId === "customer" && selectedRoles.includes("customer") && selectedRoles.length === 1) {
      toast.error("প্রতিটি ইউজারের অন্তত ১টি রোল থাকা আবশ্যক");
      return;
    }
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const saveRoles = async () => {
    if (!editingUser) return;
    setIsSavingRoles(true);
    try {
      const res = await updateUserRolesAdminAction({
        userId: editingUser.id,
        roles: selectedRoles.length > 0 ? selectedRoles : ["customer"],
      });
      if (res.success) {
        toast.success("ব্যবহারকারীর রোলস ও পারমিশন আপডেট সম্পন্ন!");
        setEditingUser(null);
        load();
      } else {
        toast.error(res.error || "রোল আপডেট ব্যর্থ");
      }
    } catch {
      toast.error("রোলস আপডেট করা যায়নি");
    } finally {
      setIsSavingRoles(false);
    }
  };

  const openDeleteDialog = async (user: any) => {
    setDeletingUser(user);
    setDeleteMode("soft");
    setConfirmText("");
    setDependencies(null);

    const depRes = await checkUserDependenciesAdminAction(user.id);
    if (depRes.success && depRes.data) {
      setDependencies(depRes.data);
    }
  };

  const executeDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      if (deleteMode === "soft") {
        const res = await softDeleteUserAdminAction(deletingUser.id);
        if (res.success) {
          toast.success("ইউজার সফট ডিলিট করা হয়েছে");
          setDeletingUser(null);
          load();
        } else {
          toast.error(res.error || "ডিলিট ব্যর্থ");
        }
      } else {
        if (confirmText !== "DELETE") {
          toast.error('স্থায়ী মোছার নিশ্চায়ন নিশ্চিত করতে "DELETE" টাইপ করুন');
          setIsDeleting(false);
          return;
        }
        const res = await permanentlyDeleteUserAdminAction({
          userId: deletingUser.id,
          confirmText,
        });
        if (res.success) {
          toast.success("ইউজার স্থায়ীভাবে মুছে ফেলা হয়েছে");
          setDeletingUser(null);
          load();
        } else {
          toast.error(res.error || "স্থায়ী ডিলিট ব্যর্থ");
        }
      }
    } catch {
      toast.error("অপারেশন ব্যর্থ");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    const { exportUsersCsvAction } =
      await import("@/features/identity/actions/identity-center-actions");
    const res = await exportUsersCsvAction(roleFilter || undefined);
    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("এক্সপোর্ট সম্পন্ন");
    } else toast.error(res.error ?? "এক্সপোর্ট ব্যর্থ");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map((u) => u.id)));
  };

  const statusVariant = (s: string) => {
    if (s === "active") return "success" as const;
    if (s === "suspended" || s === "blocked") return "destructive" as const;
    return "warning" as const;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-6 space-y-4">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/identity"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 touch-manipulation"
            aria-label="পিছনে যান"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate">
              ব্যবহারকারী ডিরেক্টরি <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">(Unified Identity)</span>
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {total} জন ব্যবহারকারী · মাল্টি-রোল ও পারমিশন সিস্টেম
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 text-xs font-bold gap-1 rounded-xl">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="ghost" size="sm" onClick={load} className="h-9 w-9 p-0 rounded-xl">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="নাম, ইমেইল, ফোন খুঁজুন..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-11 text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-slate-900 dark:text-slate-100"
          >
            <option value="">সব রোল</option>
            {AVAILABLE_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-slate-900 dark:text-slate-100"
          >
            <option value="">সব স্ট্যাটাস</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/10 rounded-2xl">
          <CardContent className="p-3 flex items-center gap-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{selectedIds.size} জন নির্বাচিত</span>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("active")} className="h-8 text-xs font-bold rounded-lg">
              <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Activate
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("suspended")} className="h-8 text-xs font-bold rounded-lg">
              <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Users Table Container with Scroll Wrapper */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-700 accent-amber-500"
                    />
                  </th>
                  <th className="p-3.5 text-xs font-black text-slate-700 dark:text-slate-300">নাম ও যোগাযোগ</th>
                  <th className="p-3.5 text-xs font-black text-slate-700 dark:text-slate-300">রোলস (Multi-Role)</th>
                  <th className="p-3.5 text-xs font-black text-slate-700 dark:text-slate-300">স্ট্যাটাস</th>
                  <th className="p-3.5 text-xs font-black text-slate-700 dark:text-slate-300">শেষ লগইন</th>
                  <th className="p-3.5 text-right text-xs font-black text-slate-700 dark:text-slate-300">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-400">
                      লোড হচ্ছে...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-400">
                      কোনো ব্যবহারকারী পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const rawRolesList: string[] =
                      Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role || "customer"];
                    const rolesList = Array.from(new Set(rawRolesList));

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(u.id)}
                            onChange={() => toggleSelect(u.id)}
                            className="rounded border-slate-300 dark:border-slate-700 accent-amber-500"
                          />
                        </td>
                        <td className="p-3.5">
                          <Link
                            href={`/dashboard/identity/users/${u.id}`}
                            className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                          >
                            {u.fullName}
                          </Link>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            {u.email || "ইমেইল নেই"} · {u.phone || "ফোন নেই"}
                          </p>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 items-center">
                            {rolesList.map((r: string) => {
                              const config = AVAILABLE_ROLES.find((item) => item.id === r);
                              return (
                                <span
                                  key={r}
                                  onClick={() => openRoleEditor(u)}
                                  className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                    config?.color || "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                                  } hover:opacity-80 transition-opacity touch-manipulation`}
                                  title="রোলস এডিট করতে ক্লিক করুন"
                                >
                                  {config?.label || r}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <Badge variant={statusVariant(u.status)} className="text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                            {u.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openRoleEditor(u)}
                              className="p-1.5 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors touch-manipulation"
                              title="রোলস ম্যানেজ করুন"
                            >
                              <UserCog className="h-4 w-4" />
                            </button>
                            <Link href={`/dashboard/identity/users/${u.id}`}>
                              <button className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation" title="প্রোফাইল দেখুন">
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                            {u.status !== "active" && (
                              <button
                                onClick={() => handleStatus(u.id, "active")}
                                className="p-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors touch-manipulation"
                                title="সক্রিয় করুন"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {u.status !== "suspended" && (
                            <button
                              onClick={() => handleStatus(u.id, "suspended")}
                              className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50"
                              title="স্থগিত করুন"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openDeleteDialog(u)}
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                            title="ইউজার ডিলিট করুন"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

      {/* Role Editor Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">মাল্টি-রোল ম্যানেজমেন্ট</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{editingUser.fullName} ({editingUser.email || editingUser.phone})</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">অনুমোদিত রোলস নির্বাচন করুন (একটি একাউন্টে একাধিক রোল প্রযোজ্য):</p>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_ROLES.map((r) => {
                  const active = selectedRoles.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRoleSelection(r.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-black transition-all ${
                        active
                          ? `${r.color} shadow-xs ring-1 ring-amber-500/50`
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span>{r.label}</span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <Button variant="outline" onClick={() => setEditingUser(null)} className="rounded-xl font-bold text-xs">
                বাতিল
              </Button>
              <Button onClick={saveRoles} disabled={isSavingRoles} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md">
                {isSavingRoles ? "সেভ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-lg font-black">ইউজার ডিলিট করুন</h3>
              </div>
              <button onClick={() => setDeletingUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-700">
                <strong>{deletingUser.fullName}</strong> ({deletingUser.email}) ডিলিট করার নিয়ম নির্বাচন করুন:
              </p>

              {/* Dependency Warning */}
              {dependencies && (dependencies.orderCount > 0 || dependencies.walletBalanceBdt > 0 || dependencies.hasResellerProfile) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> ডিপেন্ডেন্সি সতর্কতা:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {dependencies.orderCount > 0 && <li>{dependencies.orderCount} টি অর্ডার যুক্ত আছে</li>}
                    {dependencies.walletBalanceBdt > 0 && <li>৳{dependencies.walletBalanceBdt} ওয়ালেট ব্যালেন্স রয়েছে</li>}
                    {dependencies.hasResellerProfile && <li>রিসেলার প্রোফাইল সক্রিয় আছে</li>}
                  </ul>
                  <p className="text-[10px] font-bold text-amber-800 mt-1">হিসাব ও ইতিহাসের সুবিধার্থে Soft Delete ব্যবহার করুন।</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteMode("soft")}
                  className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
                    deleteMode === "soft"
                      ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-500"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="font-black text-slate-900">Soft Delete (পছন্দনীয়)</p>
                  <p className="text-[11px] text-slate-500">ডাটাবেজে রেকর্ড থাকবে, অ্যাকাউন্ট স্থগিত হবে</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteMode("permanent")}
                  className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
                    deleteMode === "permanent"
                      ? "border-rose-500 bg-rose-50/60 ring-1 ring-rose-500"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="font-black text-rose-700">Permanent Delete</p>
                  <p className="text-[11px] text-slate-500">ডাটাবেজ থেকে সম্পূর্ণ মুছে যাবে</p>
                </button>
              </div>

              {deleteMode === "permanent" && (
                <div className="space-y-1 pt-2">
                  <p className="text-[11px] font-bold text-rose-700">
                    নিশ্চিত করতে "DELETE" টাইপ করুন:
                  </p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="h-9 border-rose-300 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setDeletingUser(null)}>
                বাতিল
              </Button>
              <Button
                variant="destructive"
                onClick={executeDelete}
                disabled={isDeleting || (deleteMode === "permanent" && confirmText !== "DELETE")}
              >
                {isDeleting ? "মুছে ফেলা হচ্ছে..." : deleteMode === "soft" ? "Soft Delete করুন" : "স্থায়ীভাবে মুছুন"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            পৃষ্ঠা {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              পূর্ববর্তী
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              পরবর্তী
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
