"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WebsiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/10 text-destructive shadow-xs mb-6">
        <AlertCircle className="h-10 w-10" />
        <div className="absolute inset-0 rounded-3xl bg-destructive/10 blur-xl -z-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
        {error.message || "An unexpected system error occurred. Please try again or return to the homepage."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Button onClick={reset} size="lg" className="gap-2 shadow-sm">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg" className="gap-2 border-border/80">
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
