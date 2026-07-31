"use client";

import * as React from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { loginSchema } from "@/features/auth/types/validation";
import { ArrowRight, AlertCircle, Eye, EyeOff, Lock, User, Check } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const errorParam = searchParams.get("error");
  const prefillEmail = searchParams.get("email") || "";

  const [usernameOrEmail, setUsernameOrEmail] = React.useState<string>(prefillEmail);
  const [password, setPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const { data: session, status } = useSession();

  // Automatic session restore & role redirect
  React.useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = ((session.user as { role?: string }).role || "").toLowerCase();
      if (role.includes("admin") || role.includes("super")) {
        router.replace(callbackUrl || "/dashboard");
      } else if (role.includes("reseller")) {
        router.replace(callbackUrl || "/reseller");
      } else {
        router.replace(callbackUrl || "/account");
      }
    }
  }, [status, session, router, callbackUrl]);

  React.useEffect(() => {
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। দয়া করে আবার চেষ্টা করুন।");
    } else if (errorParam) {
      setErrorMsg("অ্যালার্ট: আপনার সেসনটির মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।");
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      loginSchema.parse({ usernameOrEmail, password });

      const result = await signIn("credentials", {
        usernameOrEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg("মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");
        setLoading(false);
      } else {
        let target = callbackUrl;
        if (!target) {
          try {
            const { getSession } = await import("next-auth/react");
            const sess = await getSession();
            const role = (sess?.user as { role?: string } | undefined)?.role?.toLowerCase() ?? "";
            if (role.includes("admin") || role.includes("super")) target = "/dashboard";
            else if (role.includes("reseller")) target = "/reseller";
            else target = "/account";
          } catch {
            target = "/account";
          }
        }
        router.push(target);
        router.refresh();
      }
    } catch (err: unknown) {
      setLoading(false);
      if (
        err &&
        typeof err === "object" &&
        "errors" in err &&
        Array.isArray((err as { errors: { message?: string }[] }).errors) &&
        (err as { errors: { message?: string }[] }).errors[0]?.message
      ) {
        setErrorMsg(
          (err as { errors: { message?: string }[] }).errors[0].message || "ভুল ইনপুট দিয়েছেন",
        );
      } else {
        setErrorMsg("লগইন করতে সমস্যা হয়েছে। আপনার তথ্য যাচাই করুন।");
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

        {/* Auth Card Container */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl rounded-3xl p-2 sm:p-4">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              অ্যাকাউন্টে সাইন ইন করুন
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              আপনার নিবন্ধিত মোবাইল নম্বর বা ইমেইল দিয়ে লগইন করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-bold text-red-700 dark:text-red-300 flex items-start gap-2.5 animate-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Username/Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="usernameOrEmail" className="block text-xs font-black text-slate-800 dark:text-slate-200">
                  মোবাইল নম্বর / ইমেইল <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="usernameOrEmail"
                    type="text"
                    autoComplete="username"
                    placeholder="017XXXXXXXX বা you@example.com"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-black text-slate-800 dark:text-slate-200">
                  পাসওয়ার্ড <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-10 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-manipulation"
                    title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                  <span>মনে রাখুন</span>
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="font-black text-amber-600 dark:text-amber-400 hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-md transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <span>{loading ? "লগইন হচ্ছে..." : "সাইন ইন করুন"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              নতুন ব্যবহারকারী?{" "}
              <Link href="/auth/register" className="font-black text-amber-600 dark:text-amber-400 hover:underline">
                নতুন অ্যাকাউন্ট তৈরি করুন
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
