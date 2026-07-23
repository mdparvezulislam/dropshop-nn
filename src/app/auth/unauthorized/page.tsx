"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl text-center">
          <CardHeader className="flex flex-col items-center justify-center space-y-2 p-6 pb-2">
            <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-2">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Access Denied
            </CardTitle>
            <CardDescription className="text-slate-400">
              You do not have the required permissions to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <p className="text-sm text-slate-400">
              Please verify your account holds the proper role mapping matrix authorization scopes.
              If you believe this is an error, contact your administrator.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/dashboard"
                className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/auth/login"
                className="flex h-10 w-full items-center justify-center rounded-md border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
