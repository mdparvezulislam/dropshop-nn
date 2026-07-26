import type { ReactNode } from "react";
import { WholesaleLayoutClient } from "./layout-client";

// Role-gated workspace — always rendered per-request, never statically
// exported. (Segment config must live in a server file to be honored.)
export const dynamic = "force-dynamic";

export default function WholesaleLayout({ children }: { children: ReactNode }): ReactNode {
  return <WholesaleLayoutClient>{children}</WholesaleLayoutClient>;
}
