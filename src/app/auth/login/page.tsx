"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { Badge } from "@/shared/components/ui/badge";
import { loginSchema } from "@/features/auth/types/validation";
import { DEMO_ADMIN } from "@/shared/constants/demo-credentials";
import { Copy, Check, Shield, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [usernameOrEmail, setUsernameOrEmail] = React.useState<string>(DEMO_ADMIN.email);
  const [password, setPassword] = React.useState<string>(DEMO_ADMIN.password);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [copied, setCopied] = React.useState<"email" | "password" | null>(null);

  React.useEffect(() => {
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("Invalid username or password. Please try again.");
    } else if (errorParam) {
      setErrorMsg("An error occurred during authentication.");
    }
  }, [errorParam]);

  const fillDemoAdmin = () => {
    setUsernameOrEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setErrorMsg("");
  };

  const copyValue = async (value: string, key: "email" | "password") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard may be blocked
    }
  };

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
        callbackUrl,
      });

      if (result?.error) {
        setErrorMsg("Invalid username, email or password.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
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
          (err as { errors: { message?: string }[] }).errors[0].message || "Invalid input",
        );
      } else {
        setErrorMsg("Failed to sign in. Please verify your inputs.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="border-amber-800/40 bg-amber-950/20 backdrop-blur-xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-200">Demo Super Admin</span>
              </div>
              <Badge variant="warning">Full Control</Badge>
            </div>
            <p className="text-xs text-amber-200/70">
              Pre-filled for testing. Role:{" "}
              <span className="font-mono text-amber-100">{DEMO_ADMIN.role}</span> (all permissions).
              Works <span className="text-amber-100 font-medium">without MongoDB</span> while fake
              login is enabled — remove before production.
            </p>
            <div className="grid gap-2">
              <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Email</div>
                  <div className="text-sm font-mono text-white truncate">{DEMO_ADMIN.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(DEMO_ADMIN.email, "email")}
                  className="ml-2 shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Copy email"
                >
                  {copied === "email" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Password</div>
                  <div className="text-sm font-mono text-white truncate">{DEMO_ADMIN.password}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(DEMO_ADMIN.password, "password")}
                  className="ml-2 shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Copy password"
                >
                  {copied === "password" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={fillDemoAdmin}
              className="w-full border-amber-700/50 bg-transparent text-amber-200 hover:bg-amber-950/40 hover:text-amber-100 gap-2"
            >
              <KeyRound className="h-4 w-4" />
              Use demo admin credentials
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to log in to DropshopNN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="usernameOrEmail">
                  Username or Email
                </label>
                <Input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="name@example.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-200" htmlFor="password">
                    Password
                  </label>
                  <a
                    href="/auth/forgot-password"
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </a>
                </div>
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              >
                {loading ? <Spinner size="sm" className="mr-2" /> : "Sign In"}
              </Button>
            </form>
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
        <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
