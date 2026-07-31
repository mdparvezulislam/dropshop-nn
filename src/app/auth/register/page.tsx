"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { registerUserAction } from "@/features/auth/actions/auth-actions";
import { UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, User, Phone, Mail } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [acceptTerms, setAcceptTerms] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!acceptTerms) {
      setErrorMsg("অ্যাকাউন্ট খুলতে শর্তাবলীতে সম্মতি প্রদান করুন।");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("পাসওয়ার্ড দুটি মিলছে না। সঠিক পাসওয়ার্ড দিন।");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUserAction({
        fullName: formData.fullName,
        username: formData.username || formData.phone,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (!res.success) {
        setErrorMsg(res.error || "নিবন্ধন সম্পন্ন করা যায়নি।");
        setLoading(false);
        return;
      }

      setSuccessMsg("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! সাইন ইন পেজে নেওয়া হচ্ছে...");
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(formData.email || formData.phone)}`);
      }, 1500);
    } catch {
      setErrorMsg("নিবন্ধন করার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setLoading(false);
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
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              নতুন অ্যাকাউন্ট খুলুন
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              অর্ডার ও কাস্টমার ফিচার ব্যবহারের জন্য নিবন্ধন করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-bold text-red-700 dark:text-red-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                  আপনার নাম <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="যেমন: মোহাম্মদ রহিম"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    disabled={loading}
                    required
                    className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={loading}
                    required
                    className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                  ইমেইল (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={loading}
                    className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                    পাসওয়ার্ড <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-9 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-manipulation"
                      title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                    পুনরায় পাসওয়ার্ড <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      disabled={loading}
                      required
                      className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500 shrink-0"
                  />
                  <span>আমি ব্যবহারের শর্তাবলী ও গোপনীয়তা নীতি মেনে নিচ্ছি</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-md transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>{loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট নিবন্ধন করুন"}</span>
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <Link href="/auth/login" className="font-black text-amber-600 dark:text-amber-400 hover:underline">
                সাইন ইন করুন
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
