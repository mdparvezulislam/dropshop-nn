import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getMyWishlistAction } from "@/features/catalog/actions/wishlist-actions";
import { WishlistContent } from "./wishlist-content";

export const metadata: Metadata = {
  title: "আমার উইশলিস্ট",
  robots: { index: false },
};

export default async function AccountWishlistPage(): Promise<ReactElement> {
  const result = await getMyWishlistAction();

  return (
    <WishlistContent
      entries={result.success ? result.data : []}
      error={result.success ? undefined : result.error}
    />
  );
}
