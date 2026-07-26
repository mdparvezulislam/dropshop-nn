import type { ReactNode } from "react";

// Auth pages are session-driven client forms — never statically prerender
// them. (Static export of these pages also trips a flaky SSR race in the
// current Next canary; see docs/00-project.md.)
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}
