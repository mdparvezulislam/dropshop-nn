import type { ReactNode } from "react";
import { ResellerLayoutClient } from "./layout-client";

// Role-gated workspace — always rendered per-request, never statically
// exported. (Segment config must live in a server file to be honored.)
export const dynamic = "force-dynamic";

export default function ResellerLayout({ children }: { children: ReactNode }): ReactNode {
  return <ResellerLayoutClient>{children}</ResellerLayoutClient>;
}
