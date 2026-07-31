"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { emailSchema } from "@/lib/utils/validation";
import { requestPasswordResetAction } from "@/features/identity/actions/security-actions";
import { KeyRound, Mail, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";

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
        setErrorMsg("পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে। একটি সঠিক ইমেইল প্রদান করুন।");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-4">
        {/* Branding Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              NN
            </div>
            <div className="text-left leading-none">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                Dropshop<span className="text-amber-500">NN</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                Commerce OS
              </span>
            </div>
          </Link>
        </div>

        {/* Card Container */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl rounded-3xl p-2 sm:p-4">
          <CardHeader className="space-y-1 pb-3 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black mb-1">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              পাসওয়ার্ড রিসেট
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              আপনার ইমেইল ঠিকানা দিন। রিসেট করার রিকভারি লিংক পাঠানো হবে।
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-sm">রিকভারি লিংক পাঠানো হয়েছে!</p>
                    <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">
                      আপনার ইমেইল ইনবক্স চেক করুন এবং নির্দেশিকা অনুসরণ করুন।
                    </p>
                  </div>
                </div>

                <Link
                  href="/auth/login"
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-md touch-manipulation"
                >
                  সাইন ইন পেজে ফিরুন
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-bold text-red-700 dark:text-red-300 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-black text-slate-800 dark:text-slate-200">
                    ইমেইল ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-md transition-all touch-manipulation flex items-center justify-center gap-2"
                >
                  <span>{loading ? "পাঠানো হচ্ছে..." : "রিকভারি লিংক পাঠান"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-1 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pt-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>সাইন ইন পেজে ফিরুন</span>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
