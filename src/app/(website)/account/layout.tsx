import type { ReactNode } from "react";
import { AccountLayoutClient } from "./layout-client";

// Session-gated account area — rendered per-request, never statically
// exported. (Segment config must live in a server file to be honored.)
export const dynamic = "force-dynamic";

export default function AccountLayout({ children }: { children: ReactNode }): ReactNode {
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
