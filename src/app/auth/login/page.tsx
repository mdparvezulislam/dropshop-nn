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
import { loginSchema } from "@/features/auth/types/validation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [usernameOrEmail, setUsernameOrEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("Invalid username or password. Please try again.");
    } else if (errorParam) {
      setErrorMsg("An error occurred during authentication.");
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
        callbackUrl,
      });

      if (result?.error) {
        setErrorMsg("Invalid username, email or password.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setLoading(false);
      if (err.errors && err.errors[0]) {
        setErrorMsg(err.errors[0].message);
      } else {
        setErrorMsg("Failed to sign in. Please verify your inputs.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
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
