"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WebsiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center bg-[hsl(0_0%_98%)] text-foreground py-16">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-red-600 shadow-sm mb-6">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
        সাময়িক গোলযোগ ঘটেছে (System Error)
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed font-medium">
        {error.message || "একটি অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Button
          onClick={reset}
          size="lg"
          className="h-11 px-6 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          পুনরায় চেষ্টা করুন
        </Button>
        <Link href="/">
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-6 text-xs font-extrabold border-border/80 text-foreground hover:bg-muted"
          >
            <Home className="h-4 w-4 mr-2" />
            হোম পেজে ফিরে যান
          </Button>
        </Link>
      </div>
    </div>
  );
}
