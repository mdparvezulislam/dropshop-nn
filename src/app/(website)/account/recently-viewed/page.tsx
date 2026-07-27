import type { Metadata } from "next";
import type { ReactElement } from "react";
import { RecentlyViewedGrid } from "@/components/website/recently-viewed";

export const metadata: Metadata = {
  title: "সম্প্রতি দেখা প্রোডাক্ট",
  robots: { index: false },
};

/**
 * Browsing history lives in the visitor's own browser (localStorage), so this
 * page is a thin server shell around the client grid — no session read, no
 * server state to leak between accounts on a shared device.
 */
export default function AccountRecentlyViewedPage(): ReactElement {
  return <RecentlyViewedGrid />;
}
