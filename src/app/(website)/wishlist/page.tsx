import { redirect } from "next/navigation";

/**
 * Legacy public wishlist route. There is exactly ONE wishlist surface —
 * the account page backed by real saved items — so this path forwards there
 * instead of rendering a second, data-less copy.
 */
export default function WishlistRedirectPage(): never {
  redirect("/account/wishlist");
}
