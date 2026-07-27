"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { resetPasswordAction, validateResetTokenAction } from "@/features/identity/actions/security-actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [tokenValid, setTokenValid] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenValid(false);
        return;
      }
      const res = await validateResetTokenAction(token);
      setTokenValid(res.success && res.data?.valid ? true : false);
      if (!res.success || !res.data?.valid) {
        setErrorMsg("এই লিংকটি মেয়াদোত্তীর্ণ বা invalid। দয়া করে আবার রিকভারি লিংক রিকোয়েস্ট করুন।");
      }
    }
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (!token) {
        throw new Error("Invalid or expired password reset token.");
      }

      if (password !== confirmPassword) {
        throw new Error("পাসওয়ার্ড মিলছে না।");
      }

      if (password.length < 8) {
        throw new Error("পাসওয়ার্ড কমপক্ষে ৮ ক্যারেক্টর হতে হবে।");
      }

      const res = await resetPasswordAction(token, password);

      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || "পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে। লিংকটি মেয়াদোত্তীর্ণ হতে পারে।");
      }
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে। লিংকটি মেয়াদোত্তীর্ণ হতে পারে।");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              নতুন পাসওয়ার্ড দিন
            </CardTitle>
            <CardDescription className="text-slate-400">
              আপনার নতুন পাসওয়ার্ড নিচে লিখুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token || tokenValid === false ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                  {!token
                    ? "রিসেট লিংকটি ভুল। টোকেন অনুপস্থিত বা ত্রুটিপূর্ণ।"
                    : "এই লিংকটি মেয়াদোত্তীর্ণ বা invalid।"}
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  নতুন রিকভারি লিংক নিন
                </Link>
              </div>
            ) : success ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  আপনার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।
                </div>
                <Link
                  href="/auth/login"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  সাইন ইন করুন
                </Link>
              </div>
            ) : tokenValid === null ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
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
                    নতুন পাসওয়ার্ড
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
                    পাসওয়ার্ড নিশ্চিত করুন
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
                    {loading ? <Spinner size="sm" className="mr-2" /> : "পাসওয়ার্ড আপডেট করুন"}
                  </Button>
                  <Link
                    href="/auth/login"
                    className="flex h-10 w-full items-center justify-center rounded-md border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
                  >
                    বাতিল
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
