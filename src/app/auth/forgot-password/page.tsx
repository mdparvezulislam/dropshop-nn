"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { emailSchema } from "@/lib/utils/validation";

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

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (err.errors && err.errors[0]) {
        setErrorMsg(err.errors[0].message);
      } else {
        setErrorMsg("Failed to process request. Please enter a valid email address.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Reset Password
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email address to receive a temporary recovery link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  Password reset link has been dispatched to your email address! Please check your
                  inbox.
                </div>
                <Link
                  href="/auth/login"
                  className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  Return to Sign In
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
                    Email Address
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
                    {loading ? <Spinner size="sm" className="mr-2" /> : "Send Recovery Link"}
                  </Button>
                  <Link
                    href="/auth/login"
                    className="flex h-10 w-full items-center justify-center rounded-md border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
                  >
                    Cancel
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
