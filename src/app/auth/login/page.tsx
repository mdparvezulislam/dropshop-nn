"use client";

import * as React from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShieldCheck,
  RefreshCw,
  User,
  Mail,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/config/brand";
import { registerUserAction } from "@/features/auth/actions/auth-actions";

type AuthTab = "login" | "signup";

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const errorParam = searchParams.get("error");
  const prefillEmail = searchParams.get("email") || "";

  const [activeTab, setActiveTab] = React.useState<AuthTab>("login");

  // Sign In State
  const [usernameOrEmail, setUsernameOrEmail] = React.useState(prefillEmail);
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  // Sign Up State
  const [fullName, setFullName] = React.useState("");
  const [signupPhone, setSignupPhone] = React.useState("");
  const [signupEmail, setSignupEmail] = React.useState("");
  const [signupPassword, setSignupPassword] = React.useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState("");
  const [showSignupPassword, setShowSignupPassword] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const { data: session, status } = useSession();

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
      setErrorMsg("মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।");
    }
  }, [errorParam]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setErrorMsg("মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড প্রদান করুন");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const result = await signIn("credentials", {
        usernameOrEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg("মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");
        setLoading(false);
      } else {
        toast.success("সফলভাবে সাইন ইন হয়েছে!");
        router.push(callbackUrl || "/account");
        router.refresh();
      }
    } catch {
      setLoading(false);
      setErrorMsg("লগইন করতে সমস্যা হয়েছে। আপনার তথ্য যাচাই করুন।");
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !signupPhone.trim() || !signupEmail.trim() || !signupPassword) {
      setErrorMsg("সকল প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg("পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const cleanPhone = signupPhone.replace(/[\s-]/g, "");
      const res = await registerUserAction({
        fullName: fullName.trim(),
        username: cleanPhone,
        email: signupEmail.trim().toLowerCase(),
        phone: cleanPhone,
        password: signupPassword,
      });

      if (!res.success) {
        setLoading(false);
        setErrorMsg(res.error || "রেজিস্ট্রেশন সম্পন্ন করা যায়নি।");
        toast.error(res.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
        return;
      }

      toast.success("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! এখন সাইন ইন করুন।");
      setUsernameOrEmail(signupPhone);
      setPassword(signupPassword);
      setLoading(false);
      setActiveTab("login");
    } catch {
      setLoading(false);
      setErrorMsg("রেজিস্ট্রেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-5">
        {/* Branding Header */}
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
              N
            </div>
            <div className="text-left leading-none">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 block">
                NN <span className="text-amber-500">Enterprise</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mt-0.5">
                Commerce OS
              </span>
            </div>
          </Link>

          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5"
            >
              <ShieldCheck className="h-3 w-3 mr-1 text-amber-500" /> SECURE SSL AUTHENTICATION
            </Badge>
          </div>
        </div>

        {/* Auth Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200 dark:bg-slate-800/80 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === "login"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            সাইন ইন (Log In)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMsg("");
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === "signup"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            নতুন অ্যাকাউন্ট (Sign Up)
          </button>
        </div>

        {/* Auth Card */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-3xl p-5 sm:p-7 space-y-4">
          <CardHeader className="space-y-1 p-0 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {activeTab === "login" ? "অ্যাকাউন্টে সাইন ইন করুন" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {activeTab === "login"
                ? "আপনার নিবন্ধিত মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড দিয়ে সহজে সাইন ইন করুন"
                : "পণ্য অর্ডার করতে ও ট্র্যাক করতে ১ মিনিটে আপনার অ্যাকাউন্ট তৈরি করুন"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            {errorMsg && (
              <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-3.5 text-xs font-bold text-red-700 dark:text-red-300 flex items-start gap-2.5 mb-4 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ── 1. LOGIN FORM ───────────────────────────────────────────── */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Mobile/Email Input */}
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
                      placeholder="01XXXXXXXXX অথবা you@example.com"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                  </div>
                </div>

                {/* Password Input */}
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
                      className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-10 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 touch-manipulation"
                      title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-md transition-all touch-manipulation flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>সাইন ইন হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>সাইন ইন করুন</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* ── 2. SIGNUP FORM ──────────────────────────────────────────── */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                {/* Name Input */}
                <div className="space-y-1">
                  <label htmlFor="fullName" className="block text-xs font-black text-slate-800 dark:text-slate-200">
                    আপনার নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="যেমন: মোহাম্মদ রহিম"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                  </div>
                </div>

                {/* Mobile Phone Input */}
                <div className="space-y-1">
                  <label htmlFor="signupPhone" className="block text-xs font-black text-slate-800 dark:text-slate-200">
                    মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="signupPhone"
                      type="tel"
                      inputMode="tel"
                      placeholder="01XXXXXXXXX"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                  </div>
                </div>

                {/* Email Address Input */}
                <div className="space-y-1">
                  <label htmlFor="signupEmail" className="block text-xs font-black text-slate-800 dark:text-slate-200">
                    ইমেইল ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="signupEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label htmlFor="signupPassword" className="block text-xs font-black text-slate-800 dark:text-slate-200">
                    পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="signupPassword"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-10 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 touch-manipulation"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <label htmlFor="signupConfirmPassword" className="block text-xs font-black text-slate-800 dark:text-slate-200">
                    পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="signupConfirmPassword"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-md transition-all touch-manipulation flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>অ্যাকাউন্ট তৈরি করুন</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer Credit */}
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          © {new Date().getFullYear()} {BRAND.publicName} Commerce OS. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage(): React.ReactElement {
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
