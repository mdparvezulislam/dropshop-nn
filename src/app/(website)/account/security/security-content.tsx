"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Monitor, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { changeAccountPasswordAction } from "@/features/identity/actions/account-actions";
import { revokeOtherSessionsAction } from "@/features/identity/actions/session-actions";

interface Session {
  ip: string;
  userAgent: string;
  loggedAt: Date;
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SecurityPageContent({ sessions }: { sessions: Session[] }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [revokeMessage, setRevokeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRevokeOthers = async () => {
    setRevokeLoading(true);
    setRevokeMessage(null);
    try {
      const result = await revokeOtherSessionsAction();
      if (result.success) {
        setRevokeMessage({
          type: "success",
          text: `Signed out of ${result.data?.revokedCount ?? 0} other device(s).`,
        });
      }
    } catch {
      setRevokeMessage({ type: "error", text: "Could not revoke other sessions." });
    } finally {
      setRevokeLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await changeAccountPasswordAction({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (result.success) {
      setMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } else {
      setMessage({ type: "error", text: result.error || "Failed to change password." });
    }
    setLoading(false);
  };

  const deviceName = (ua: string): string => {
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return ua.slice(0, 30);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Security</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your password and account security.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Change Password</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Use a strong password that you don&apos;t use on other sites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Changing..." : "Change Password"}
            </Button>
            {message && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  message.type === "success" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {message.text}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Active Sessions</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeOthers}
              disabled={revokeLoading}
            >
              {revokeLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Log out other devices
            </Button>
          </div>
          <CardDescription className="text-xs">
            Recent login activity. Two-factor authentication is ready for a future release.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revokeMessage && (
            <p
              className={`mb-3 text-sm flex items-center gap-1.5 ${
                revokeMessage.type === "success" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {revokeMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {revokeMessage.text}
            </p>
          )}
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No session data available.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{deviceName(s.userAgent)}</p>
                      <p className="text-xs text-muted-foreground">{s.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{formatDate(s.loggedAt)}</p>
                    {i === 0 && (
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-200">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
