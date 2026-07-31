"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneOrEmail = searchParams.get("target") || "017XXXXXXXX";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMsg("");

    // Auto advance focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(5, pastedData.length - 1)]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    toast.success("নতুন ভেরিফিকেশন কোড পাঠানো হয়েছে!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setErrorMsg("৬ ডিজিটের সম্পূর্ণ ভেরিফিকেশন কোড লিখুন।");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success("মোবাইল ভেরিফিকেশন সফল হয়েছে!");
      setTimeout(() => {
        router.push("/account");
      }, 1200);
    }, 1000);
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
          <CardHeader className="space-y-1 text-center pb-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black mb-1">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              OTP ভেরিফিকেশন
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">{phoneOrEmail}</span> এ পাঠানো ৬ ডিজিটের কোডটি লিখুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-bold text-red-700 dark:text-red-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>ভেরিফিকেশন সফল হয়েছে! ড্যাশবোর্ডে নেওয়া হচ্ছে...</span>
                </div>
              )}

              {/* 6-Digit OTP Inputs */}
              <div className="flex justify-between gap-2 pt-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="h-13 w-11 sm:w-12 text-center text-lg font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:outline-2 focus-visible:outline-amber-500 shadow-2xs"
                  />
                ))}
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2">
                <span>
                  {timer > 0 ? (
                    `পুনরায় পাঠানোর সময়: ${timer} সেকেন্ড`
                  ) : (
                    "কোড পাননি?"
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend}
                  className={`font-black flex items-center gap-1 transition-colors ${
                    canResend
                      ? "text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      : "text-slate-400 cursor-not-allowed opacity-50"
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>কোড পুনরায় পাঠান</span>
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className="w-full h-12 text-sm font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 rounded-xl shadow-md transition-all touch-manipulation flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? "যাচাই করা হচ্ছে..." : "কোড ভেরিফাই করুন"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
