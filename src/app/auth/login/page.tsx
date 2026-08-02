"use client";

import * as React from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loginSchema } from "@/features/auth/types/validation";
import { ArrowRight, AlertCircle, Eye, EyeOff, Lock, User, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function LoginForm(): React.ReactElement {
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
      setErrorMsg("আপনার সেসনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।");
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
        toast.success("সফলভাবে লগইন হয়েছে!");
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
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Premium Branding Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              NN
            </div>
            <div className="text-left leading-tight">
              <span className="text-2xl font-black tracking-tight text-foreground font-heading block">
                NN Enterprise
              </span>
              <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                COMMERCE OS PLATFORM
              </span>
            </div>
          </Link>

          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5">
              <ShieldCheck className="h-3 w-3 mr-1 text-amber-500" /> SECURE 256-BIT SSL
            </Badge>
          </div>
        </div>

        {/* Premium Auth Card Container */}
        <Card className="border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl rounded-3xl p-5 sm:p-7 space-y-5">
          <CardHeader className="space-y-1.5 p-0 border-b border-border/60 pb-4">
            <CardTitle className="text-xl font-black tracking-tight text-foreground">
              অ্যাকাউন্টে সাইন ইন করুন
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-muted-foreground">
              আপনার নিবন্ধিত মোবাইল নম্বর বা ইমেইল দিয়ে লগইন করুন
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Username/Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="usernameOrEmail" className="block text-xs font-black text-foreground">
                  মোবাইল নম্বর / ইমেইল <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="usernameOrEmail"
                    type="text"
                    autoComplete="username"
                    placeholder="017XXXXXXXX বা admin@nnenterprise.com"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full h-12 rounded-2xl border border-border bg-background/80 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-black text-foreground">
                  পাসওয়ার্ড <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full h-12 rounded-2xl border border-border bg-background/80 pl-10 pr-10 text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground touch-manipulation"
                    title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-muted-foreground hover:text-foreground">
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
                className="w-full h-12 text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20 transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>লগইন হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>সাইন ইন করুন</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/60 text-center text-xs font-semibold text-muted-foreground">
              নতুন ব্যবহারকারী?{" "}
              <Link href="/auth/register" className="font-black text-amber-600 dark:text-amber-400 hover:underline">
                নতুন অ্যাকাউন্ট তৈরি করুন
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Credit */}
        <p className="text-center text-[11px] text-muted-foreground font-medium">
          © {new Date().getFullYear()} NN Enterprise Commerce OS. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage(): React.ReactElement {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
