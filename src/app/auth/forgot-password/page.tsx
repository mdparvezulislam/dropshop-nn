"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { emailSchema } from "@/lib/utils/validation";
import { requestPasswordResetAction } from "@/features/identity/actions/security-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      emailSchema.parse(email);

      const res = await requestPasswordResetAction(email);

      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || "পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (err.errors && err.errors[0]) {
        setErrorMsg(err.errors[0].message);
      } else {
        setErrorMsg("পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে। দয়া করে একটি বৈধ ইমেইল ঠিকানা দিন।");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              পাসওয়ার্ড রিসেট
            </CardTitle>
            <CardDescription className="text-slate-400">
              আপনার ইমেইল ঠিকানা দিন। একটি রিকভারি লিংক পাঠানো হবে।
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন।
                </div>
                <Link
                  href="/auth/login"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  সাইন ইন করুন
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
                  <label className="text-sm font-medium text-slate-200" htmlFor="email">
                    ইমেইল ঠিকানা
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  >
                    {loading ? <Spinner size="sm" className="mr-2" /> : "রিকভারি লিংক পাঠান"}
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
