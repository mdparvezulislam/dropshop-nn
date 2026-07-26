import type { Metadata } from "next";
import { getWishlistAction } from "@/features/identity/actions/account-actions";
import { WishlistPageContent } from "./wishlist-content";

export const metadata: Metadata = {
  title: "Wishlist - DropshopNN",
  robots: { index: false },
};

export default async function WishlistPage() {
  const result = await getWishlistAction();
  return <WishlistPageContent initialItems={result.success ? (result.data ?? []) : []} />;
}
