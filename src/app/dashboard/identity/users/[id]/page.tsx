"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getUserByIdAdminAction,
  updateUserStatusAdminAction,
  updateUserProfileAdminAction,
  softDeleteUserAdminAction,
  checkUserDependenciesAdminAction,
  permanentlyDeleteUserAdminAction,
} from "@/features/identity/actions/admin-identity-actions";
import { forceLogoutUserAction } from "@/features/identity/actions/session-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Monitor,
  Ban,
  CheckCircle,
  Shield,
  UserCog,
  Trash2,
  Edit,
  Store,
  Building2,
  X,
  Check,
  AlertTriangle,
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

export default function UserProfilePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Edit Modal State
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    status: "active" as "active" | "pending" | "suspended" | "blocked",
    roles: [] as string[],
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Delete Modal State
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteMode, setDeleteMode] = React.useState<"soft" | "permanent">("soft");
  const [confirmText, setConfirmText] = React.useState("");
  const [dependencies, setDependencies] = React.useState<{
    orderCount: number;
    walletBalanceBdt: number;
    hasResellerProfile: boolean;
  } | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await getUserByIdAdminAction(userId);
    if (res.success && res.data) {
      const u = res.data;
      setUser(u);
      const roles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role || "customer"];
      setEditForm({
        fullName: u.fullName || "",
        email: u.email || "",
        phone: u.phone || "",
        status: (u.status as any) || "active",
        roles,
      });
    } else {
      toast.error(res.error ?? "ব্যবহারকারী পাওয়া যায়নি");
      router.push("/dashboard/identity/users");
    }
    setLoading(false);
  }, [userId, router]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (status: "active" | "suspended") => {
    const res = await updateUserStatusAdminAction({ userId, status });
    if (res.success) {
      toast.success(`স্ট্যাটাস আপডেট: ${status}`);
      load();
    } else toast.error(res.error ?? "ব্যর্থ");
  };

  const handleForceLogout = async () => {
    const res = await forceLogoutUserAction(userId);
    if (res.success) toast.success("সেশন বাতিল করা হয়েছে");
    else toast.error("ব্যর্থ");
  };

  const toggleRoleSelection = (roleId: string) => {
    if (roleId === "customer" && editForm.roles.includes("customer") && editForm.roles.length === 1) {
      toast.error("অন্তত ১টি রোল থাকা আবশ্যক");
      return;
    }
    if (editForm.roles.includes(roleId)) {
      setEditForm({ ...editForm, roles: editForm.roles.filter((r) => r !== roleId) });
    } else {
      setEditForm({ ...editForm, roles: [...editForm.roles, roleId] });
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await updateUserProfileAdminAction({
        userId,
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        status: editForm.status,
        roles: editForm.roles.length > 0 ? editForm.roles : ["customer"],
      });
      if (res.success) {
        toast.success("প্রোফাইল ও রোলস সফলভাবে আপডেট হয়েছে!");
        setIsEditing(false);
        load();
      } else {
        toast.error(res.error || "আপডেট করা যায়নি");
      }
    } catch {
      toast.error("অপারেশন ব্যর্থ");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteDialog = async () => {
    setIsDeleting(true);
    setDeleteMode("soft");
    setConfirmText("");
    setDependencies(null);
    const depRes = await checkUserDependenciesAdminAction(userId);
    if (depRes.success && depRes.data) {
      setDependencies(depRes.data);
    }
  };

  const executeDelete = async () => {
    setIsSubmittingDelete(true);
    try {
      if (deleteMode === "soft") {
        const res = await softDeleteUserAdminAction(userId);
        if (res.success) {
          toast.success("ইউজার সফট ডিলিট করা হয়েছে");
          router.push("/dashboard/identity/users");
        } else {
          toast.error(res.error || "ডিলিট ব্যর্থ");
        }
      } else {
        if (confirmText !== "DELETE") {
          toast.error('স্থায়ী মোছার নিশ্চায়ন নিশ্চিত করতে "DELETE" টাইপ করুন');
          setIsSubmittingDelete(false);
          return;
        }
        const res = await permanentlyDeleteUserAdminAction({ userId, confirmText });
        if (res.success) {
          toast.success("ইউজার স্থায়ীভাবে মুছে ফেলা হয়েছে");
          router.push("/dashboard/identity/users");
        } else {
          toast.error(res.error || "স্থায়ী ডিলিট ব্যর্থ");
        }
      }
    } catch {
      toast.error("অপারেশন ব্যর্থ");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">ইউজার তথ্য লোড হচ্ছে...</span>
      </div>
    );
  }

  const userRolesList: string[] =
    Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role || "customer"];

  const statusVariant = (s: string) =>
    s === "active"
      ? ("success" as const)
      : s === "suspended" || s === "blocked"
        ? ("destructive" as const)
        : ("warning" as const);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/identity/users"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{user.fullName}</h1>
              <Badge variant={statusVariant(user.status)} className="capitalize text-xs">
                {user.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email} · {user.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5 font-bold">
            <Edit className="h-4 w-4" /> প্রোফাইল ও রোল এডিট
          </Button>
          <Button variant="ghost" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Overview Card */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold">প্রোফাইল ও একাউন্ট বিস্তারিত</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit className="h-3.5 w-3.5 mr-1" /> এডিট
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">পূর্ণ নাম</p>
                <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ইমেইল</p>
                <p className="text-sm flex items-center gap-1 font-semibold text-slate-800">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {user.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">মোবাইল ফোন</p>
                <p className="text-sm flex items-center gap-1 font-semibold text-slate-800">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {user.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ইউজারনেম</p>
                <p className="text-sm font-mono text-slate-800">@{user.username}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">সক্রিয় রোলস (Multi-Role)</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userRolesList.map((r: string) => {
                    const conf = AVAILABLE_ROLES.find((item) => item.id === r);
                    return (
                      <span
                        key={r}
                        className={`px-2 py-0.5 rounded-md text-xs font-black border ${
                          conf?.color || "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                      >
                        {conf?.label || r}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">মেম্বারশিপ টাইপ</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(user.memberships || ["customer"]).map((m: string) => (
                    <Badge key={m} variant="secondary" className="capitalize text-xs font-extrabold">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">রেজিস্ট্রেশন তারিখ</p>
                <p className="text-sm flex items-center gap-1 text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">শেষ লগইন</p>
                <p className="text-sm text-slate-700">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Connected Profiles Card */}
          {user.resellerProfile && (
            <Card className="border-amber-200 bg-amber-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Store className="h-4 w-4 text-amber-600" /> রিসেলার প্রোফাইল সংযুক্ত রয়েছে
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-amber-900">{user.resellerProfile.businessName}</p>
                  <p className="text-xs text-amber-700 font-mono">কোড: {user.resellerProfile.code}</p>
                </div>
                <Link href={`/dashboard/resellers/${user.resellerProfile.id}`}>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                    রিসেলার ড্যাশবোর্ড দেখুন
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Login History */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm">লগইন হিস্ট্রি</CardTitle>
            </CardHeader>
            <CardContent>
              {user.loginHistory?.length > 0 ? (
                <div className="space-y-2">
                  {user.loginHistory.slice(0, 10).map((entry: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 rounded-lg bg-muted/20 text-xs"
                    >
                      <div>
                        <p className="font-mono font-bold text-slate-900">{entry.ip || entry.ipAddress || "127.0.0.1"}</p>
                        <p className="text-muted-foreground truncate max-w-xs">
                          {entry.userAgent || "unknown"}
                        </p>
                      </div>
                      <span className="text-muted-foreground shrink-0">
                        {new Date(entry.loggedAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  কোনো সেশন রেকর্ড পাওয়া যায়নি
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Controls */}
        <div className="space-y-5">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm">অ্যাকাউন্ট কন্ট্রোল ও সিকিউরিটি</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start font-bold"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <UserCog className="h-4 w-4 mr-2 text-amber-600" /> প্রোফাইল ও রোল এডিট
              </Button>

              {user.status !== "active" && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatus("active")}
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" /> অ্যাকাউন্ট সক্রিয় করুন
                </Button>
              )}
              {user.status !== "suspended" && (
                <Button
                  className="w-full justify-start text-rose-600 hover:text-rose-700"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatus("suspended")}
                >
                  <Ban className="h-4 w-4 mr-2" /> অ্যাকাউন্ট স্থগিত (Suspend)
                </Button>
              )}
              <Button
                className="w-full justify-start"
                variant="outline"
                size="sm"
                onClick={handleForceLogout}
              >
                <Monitor className="h-4 w-4 mr-2" /> সক্রিয় সেশন ফোর্স লগআউট
              </Button>
              <Button
                className="w-full justify-start text-red-600 hover:bg-red-50"
                variant="outline"
                size="sm"
                onClick={openDeleteDialog}
              >
                <Trash2 className="h-4 w-4 mr-2" /> অ্যাকাউন্ট ডিলিট করুন
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile & Roles Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black">প্রোফাইল ও রোল এডিটর</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">পূর্ণ নাম</label>
                  <Input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">ইমেইল ঠিকানা</label>
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">মোবাইল ফোন</label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">স্ট্যাটাস</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">অনুমোদিত রোলস (মাল্টি-রোল নির্বাচন):</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {AVAILABLE_ROLES.map((r) => {
                    const active = editForm.roles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRoleSelection(r.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-extrabold transition-all ${
                          active
                            ? `${r.color} shadow-xs ring-1 ring-amber-500/50`
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span>{r.label}</span>
                        {active && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                বাতিল
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                {isSaving ? "সেভ হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-lg font-black">ইউজার ডিলিট করুন</h3>
              </div>
              <button onClick={() => setIsDeleting(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-700">
                <strong>{user.fullName}</strong> ({user.email}) ডিলিট করার নিয়ম নির্বাচন করুন:
              </p>

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
              <Button variant="outline" onClick={() => setIsDeleting(false)}>
                বাতিল
              </Button>
              <Button
                variant="destructive"
                onClick={executeDelete}
                disabled={isSubmittingDelete || (deleteMode === "permanent" && confirmText !== "DELETE")}
              >
                {isSubmittingDelete ? "মুছে ফেলা হচ্ছে..." : deleteMode === "soft" ? "Soft Delete করুন" : "স্থায়ীভাবে মুছুন"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
