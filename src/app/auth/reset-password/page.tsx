"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { changePasswordSchema } from "@/features/auth/types/validation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (!token) {
        throw new Error("Invalid or expired password reset token.");
      }

      changePasswordSchema.parse({
        currentPassword: "dummy",
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (err.errors && err.errors[0]) {
        setErrorMsg(err.errors[0].message);
      } else {
        setErrorMsg(err.message || "Failed to reset password. The link may have expired.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Choose New Password
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your new account password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                  Invalid reset link. The link is missing a token or is malformed.
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  Request New Link
                </Link>
              </div>
            ) : success ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  Password has been successfully updated! You may now sign in using your new
                  password.
                </div>
                <Link
                  href="/auth/login"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="password">
                    New Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="border-slate-800 bg-slate-950 text-white focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="border-slate-800 bg-slate-950 text-white focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  >
                    {loading ? <Spinner size="sm" className="mr-2" /> : "Update Password"}
                  </Button>
                  <Link
                    href="/auth/login"
                    className="flex h-10 w-full items-center justify-center rounded-md border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">
          <Spinner size="lg" />
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
