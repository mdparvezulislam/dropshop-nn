"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { listUsersAdminAction, updateUserStatusAdminAction } from "@/features/identity/actions/admin-identity-actions";
import { forceLogoutUserAction } from "@/features/identity/actions/session-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Mail, Phone, Calendar, Monitor, Ban, CheckCircle, Shield, KeyRound } from "lucide-react";

export default function UserProfilePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listUsersAdminAction({ page: 1, limit: 500, search: userId });
    if (res.success && res.data) {
      const found = res.data.items.find((u: any) => u.id === userId);
      if (found) setUser(found);
      else { toast.error("ব্যবহারকারী পাওয়া যায়নি"); router.push("/dashboard/identity/users"); }
    } else { toast.error("লোড ব্যর্থ"); }
    setLoading(false);
  }, [userId, router]);

  React.useEffect(() => { load(); }, [load]);

  const handleStatus = async (status: "active" | "suspended") => {
    const res = await updateUserStatusAdminAction({ userId, status });
    if (res.success) { toast.success(`স্ট্যাটাস আপডেট: ${status}`); load(); }
    else toast.error(res.error ?? "ব্যর্থ");
  };

  const handleForceLogout = async () => {
    const res = await forceLogoutUserAction(userId);
    if (res.success) toast.success("সেশন বাতিল করা হয়েছে");
    else toast.error("ব্যর্থ");
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground">লোড হচ্ছে...</span></div>;
  }

  const statusVariant = (s: string) => s === "active" ? "success" as const : s === "suspended" ? "destructive" as const : "warning" as const;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/identity/users" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.fullName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm">প্রোফাইল তথ্য</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">পূর্ণ নাম</p><p className="text-sm font-medium">{user.fullName}</p></div>
              <div><p className="text-xs text-muted-foreground">ইমেইল</p><p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</p></div>
              <div><p className="text-xs text-muted-foreground">ফোন</p><p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" /> {user.phone}</p></div>
              <div><p className="text-xs text-muted-foreground">ইউজারনেম</p><p className="text-sm font-mono">@{user.username}</p></div>
              <div><p className="text-xs text-muted-foreground">রোল</p><Badge variant="outline" className="capitalize">{user.role}</Badge></div>
              <div><p className="text-xs text-muted-foreground">স্ট্যাটাস</p><Badge variant={statusVariant(user.status)}>{user.status}</Badge></div>
              <div><p className="text-xs text-muted-foreground">রেজিস্ট্রেশন</p><p className="text-sm flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(user.createdAt).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-muted-foreground">শেষ লগইন</p><p className="text-sm">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}</p></div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm">লগইন হিস্ট্রি</CardTitle></CardHeader>
            <CardContent>
              {user.loginHistory?.length > 0 ? (
                <div className="space-y-2">
                  {user.loginHistory.slice(0, 10).map((entry: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-muted/20 text-xs">
                      <div>
                        <p className="font-mono">{entry.ipAddress}</p>
                        <p className="text-muted-foreground">{entry.userAgent?.substring(0, 60)}...</p>
                      </div>
                      <span className="text-muted-foreground">{new Date(entry.loggedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-4">কোনো লগইন হিস্ট্রি নেই</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm">অ্যাকাউন্ট অ্যাকশন</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {user.status !== "active" && (
                <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => handleStatus("active")}>
                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" /> অ্যাক্টিভেট
                </Button>
              )}
              {user.status !== "suspended" && (
                <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => handleStatus("suspended")}>
                  <Ban className="h-4 w-4 mr-2 text-rose-400" /> সাসপেন্ড
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline" size="sm" onClick={handleForceLogout}>
                <Monitor className="h-4 w-4 mr-2" /> ফোর্স লগআউট
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" disabled>
                <KeyRound className="h-4 w-4 mr-2" /> পাসওয়ার্ড রিসেট (প্রস্তুত)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="text-sm">রোল ও পারমিশন</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">বর্তমান রোল</span>
                <Badge variant="outline" className="capitalize">{user.role}</Badge>
              </div>
              <Button className="w-full" variant="outline" size="sm" disabled>
                <Shield className="h-4 w-4 mr-2" /> রোল পরিবর্তন (প্রস্তুত)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
