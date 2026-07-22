"use client";

import * as React from "react";
import Link from "next/link";
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
import { FormField } from "@/shared/components/forms/form-field";
import { loginSchema } from "@/features/auth/types/validation";
import { ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const errorParam = searchParams.get("error");
  const prefillEmail = searchParams.get("email") || "";

  const [usernameOrEmail, setUsernameOrEmail] = React.useState<string>(prefillEmail);
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("Invalid username or password. Please verify your credentials.");
    } else if (errorParam) {
      setErrorMsg("Authentication session expired or invalid.");
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
        setErrorMsg("Invalid username, email or password.");
        setLoading(false);
      } else {
        let target = callbackUrl || "/dashboard";
        if (!callbackUrl) {
          try {
            const { getSession } = await import("next-auth/react");
            const session = await getSession();
            const role = (session?.user as { role?: string } | undefined)?.role ?? "";
            const r = role.toLowerCase();
            if (r.includes("reseller")) target = "/reseller";
            else if (r.includes("wholesale") || r === "wholesaler") target = "/wholesale";
            else if (r.includes("supplier")) target = "/supplier";
            else target = "/dashboard";
          } catch {
            target = "/dashboard";
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
          (err as { errors: { message?: string }[] }).errors[0].message || "Invalid input",
        );
      } else {
        setErrorMsg("Failed to sign in. Please verify your inputs.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 ws-grain">
      <div className="w-full max-w-md space-y-4">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-base shadow-glow group-hover:scale-105 transition-transform">
              D
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              Dropshop<span className="text-primary">NN</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">Enterprise Commerce OS for Bangladesh</p>
        </div>

        {/* Real Production Login Form */}
        <Card className="border-border/80 bg-card/95 backdrop-blur-md shadow-xl rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">Sign In</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <FormField label="Username or Email" required>
                <Input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="name@example.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </FormField>

              <FormField label="Password" required>
                <div className="space-y-1">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <div className="flex justify-end pt-1">
                    <Link
                      href="/auth/forgot-password"
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </FormField>

              <Button
                type="submit"
                loading={loading}
                className="w-full font-semibold shadow-sm"
              >
                Sign In
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border/60 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-semibold text-primary hover:underline">
                Create Account
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
        <div className="min-h-screen bg-background flex justify-center items-center text-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
