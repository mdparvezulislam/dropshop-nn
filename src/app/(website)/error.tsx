"use client";

import Link from "next/link";

export default function WebsiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl font-extrabold text-destructive/20 select-none">!</div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 text-sm text-foreground/50 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground font-medium px-6 hover:bg-primary/90 transition-all"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 rounded-xl border border-border/60 text-foreground/70 font-medium px-6 hover:bg-muted/60 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
