import * as React from "react";

export function SkipNavLink(): React.ReactElement {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:inline-flex focus:items-center focus:gap-2 focus:rounded-lg focus:bg-amber-500 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-slate-950 focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-amber-600"
    >
      মূল কন্টেন্টে যান
    </a>
  );
}
