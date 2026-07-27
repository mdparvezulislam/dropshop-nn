"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { useWishlist } from "./wishlist-provider";

export interface WishlistButtonProps {
  productId: string;
  /** Used in the accessible label so screen readers know WHICH product. */
  productName?: string;
  /** "pill" = labelled bar button (PDP); "icon" = round icon-only (cards). */
  variant?: "pill" | "icon";
  className?: string;
  /** Fired after the server confirms a change. */
  onChange?: (inWishlist: boolean) => void;
}

/**
 * Heart toggle backed by the real wishlist. Membership comes from the shared
 * provider (no per-button fetch); the toggle itself is optimistic and rolls
 * back when the server rejects it. Guests get a login prompt instead of a
 * silent no-op — a local-only "wishlist" would be lost on sign-in.
 */
export function WishlistButton({
  productId,
  productName,
  variant = "pill",
  className,
  onChange,
}: WishlistButtonProps): React.ReactElement {
  const { has, toggle, hydrated } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = React.useState(false);

  const saved = has(productId);
  const suffix = productName ? `: ${productName}` : "";
  const label = saved ? `উইশলিস্ট থেকে সরান${suffix}` : `উইশলিস্টে যোগ করুন${suffix}`;

  const handleClick = React.useCallback(async (): Promise<void> => {
    if (pending) return;
    setPending(true);
    try {
      const result = await toggle(productId);

      if (result.status === "unauthenticated") {
        toast.error(result.error, {
          description: "লগইন করলে আপনার পছন্দের প্রোডাক্ট সব ডিভাইসে সেভ থাকবে।",
          action: {
            label: "লগইন",
            onClick: () =>
              router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`),
          },
        });
        return;
      }

      if (result.status === "error") {
        toast.error(result.error);
        return;
      }

      if (result.status === "added") {
        toast.success("উইশলিস্টে যোগ হয়েছে", {
          action: { label: "দেখুন", onClick: () => router.push("/account/wishlist") },
        });
        onChange?.(true);
        return;
      }

      toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
      onChange?.(false);
    } finally {
      setPending(false);
    }
  }, [pending, toggle, productId, router, pathname, onChange]);

  const Icon = pending ? Loader2 : Heart;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!hydrated || pending}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border shadow-xs backdrop-blur-xs transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
          saved
            ? "bg-red-50 border-red-200 text-red-600"
            : "bg-white/90 border-slate-300 text-slate-800 hover:text-red-600 hover:bg-white",
          className,
        )}
      >
        <Icon
          className={cn("h-4 w-4", pending && "animate-spin", !pending && saved && "fill-red-600")}
          aria-hidden
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hydrated || pending}
      aria-pressed={saved}
      aria-label={label}
      className={cn(
        "h-11 min-h-11 flex items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
        saved
          ? "bg-red-50 border-red-200 text-red-600"
          : "border-slate-300 text-slate-700 hover:bg-slate-50",
        className,
      )}
    >
      <Icon
        className={cn("h-4 w-4", pending && "animate-spin", !pending && saved && "fill-red-600")}
        aria-hidden
      />
      {saved ? "সেভ করা আছে" : "উইশলিস্ট"}
    </button>
  );
}

export default WishlistButton;
