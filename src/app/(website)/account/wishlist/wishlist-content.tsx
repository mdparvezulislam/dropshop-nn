"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import { useWishlist } from "@/components/website/wishlist/wishlist-provider";
import { useLocalCart } from "@/features/checkout/store/local-cart";
import type { WishlistEntry } from "@/features/catalog/actions/wishlist-actions";

/**
 * The single wishlist surface. Products come straight from the catalog
 * service (real BDT prices, real stock), so nothing here is a snapshot that
 * can drift. Removals and "move to cart" both go through the shared wishlist
 * provider, which keeps the header counter and every heart on the site in
 * step without a refetch.
 */

interface WishlistContentProps {
  entries: WishlistEntry[];
  error?: string;
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function WishlistContent({ entries, error }: WishlistContentProps): React.ReactElement {
  const { sync, remove } = useWishlist();
  const cart = useLocalCart();
  const router = useRouter();
  const [items, setItems] = React.useState<WishlistEntry[]>(entries);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // Server data arrives with the page — seed the shared set from it rather
  // than letting the provider issue a second request for the same ids.
  // `seedKey` is the stable identity of `entries`; the ref guard keeps a new
  // array reference on every render from re-seeding (and looping) forever.
  const seedKey = entries.map((entry) => entry.product.id).join(",");
  const seededKey = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (seededKey.current === seedKey) return;
    seededKey.current = seedKey;
    setItems(entries);
    sync(seedKey ? seedKey.split(",") : []);
  }, [seedKey, entries, sync]);

  const dropLocally = React.useCallback((productId: string): void => {
    setItems((prev) => prev.filter((entry) => entry.product.id !== productId));
  }, []);

  const handleRemove = React.useCallback(
    async (entry: WishlistEntry): Promise<void> => {
      const { id, name } = entry.product;
      setBusyId(id);
      const snapshot = items;
      dropLocally(id);

      const result = await remove(id);
      setBusyId(null);

      if (!result.ok) {
        setItems(snapshot);
        toast.error(result.error ?? "উইশলিস্ট আপডেট করা যায়নি");
        return;
      }
      toast.success(`উইশলিস্ট থেকে সরানো হয়েছে — ${name}`);
    },
    [items, dropLocally, remove],
  );

  const handleMoveToCart = React.useCallback(
    async (entry: WishlistEntry): Promise<void> => {
      const product = entry.product;

      if (product.price <= 0) {
        toast.error("এই প্রোডাক্টের মূল্য এখনো নির্ধারিত হয়নি। অর্ডারের জন্য যোগাযোগ করুন।");
        return;
      }

      setBusyId(product.id);
      cart.addItem(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image || PRODUCT_IMAGE_PLACEHOLDER,
          unitPrice: product.price,
        },
        1,
      );

      const snapshot = items;
      dropLocally(product.id);
      const result = await remove(product.id);
      setBusyId(null);

      if (!result.ok) {
        // The cart line stands; only the wishlist row comes back.
        setItems(snapshot);
        toast.warning(`কার্টে যোগ হয়েছে — ${product.name}`, {
          description: "তবে উইশলিস্ট থেকে সরানো যায়নি।",
        });
        return;
      }

      toast.success(`কার্টে সরানো হয়েছে — ${product.name}`, {
        description: "উইশলিস্ট থেকে সরিয়ে দেওয়া হয়েছে।",
        action: { label: "কার্ট দেখুন", onClick: () => router.push("/cart") },
      });
    },
    [cart, items, dropLocally, remove, router],
  );

  if (error) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-black text-slate-900">আমার উইশলিস্ট</h1>
        <div
          role="alert"
          className="p-6 rounded-2xl bg-red-50 border border-red-200 text-sm font-bold text-red-800"
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-slate-900">আমার উইশলিস্ট</h1>
        <p className="text-xs font-bold text-slate-500 mt-0.5">
          {items.length > 0 ? `${items.length} টি প্রোডাক্ট সেভ করা আছে` : "কোনো প্রোডাক্ট সেভ নেই"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
          <Heart className="h-10 w-10 text-slate-300 mx-auto mb-3" aria-hidden />
          <p className="text-sm font-black text-slate-700 mb-1">উইশলিস্ট এখনো খালি</p>
          <p className="text-xs font-bold text-slate-500 mb-4">
            পছন্দের প্রোডাক্টে হার্ট আইকনে ট্যাপ করলে সেটি এখানে জমা থাকবে।
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            প্রোডাক্ট দেখুন
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((entry) => {
            const product = entry.product;
            const busy = busyId === product.id;
            const outOfStock = product.stockStatus === "out_of_stock";

            return (
              <li
                key={entry.wishlistId}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden transition-shadow hover:shadow-md hover:border-amber-400"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-500"
                >
                  <span className="relative block aspect-square bg-slate-100">
                    <Image
                      src={product.image || PRODUCT_IMAGE_PLACEHOLDER}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => void handleRemove(entry)}
                  disabled={busy}
                  aria-label={`উইশলিস্ট থেকে সরান: ${product.name}`}
                  className="absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs transition-colors hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden />
                  )}
                </button>

                <div className="flex flex-1 flex-col gap-2 p-3">
                  {product.brandName && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                      {product.brandName}
                    </span>
                  )}

                  <Link
                    href={`/product/${product.slug}`}
                    className="focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
                  >
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h2>
                  </Link>

                  {product.price > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-900 tabular-nums">
                        {formatBdt(product.price)}
                      </span>
                      {product.comparePrice !== undefined && (
                        <span className="text-[11px] font-bold line-through text-slate-400 tabular-nums">
                          {formatBdt(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500">
                      দামের জন্য যোগাযোগ করুন
                    </span>
                  )}

                  {outOfStock && (
                    <span className="w-fit text-[11px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      স্টক শেষ
                    </span>
                  )}

                  <div className="mt-auto pt-1">
                    {outOfStock ? (
                      <Link
                        href={`/product/${product.slug}`}
                        className="flex items-center justify-center gap-1.5 w-full h-10 rounded-xl border border-slate-300 text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                      >
                        বিস্তারিত দেখুন
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleMoveToCart(entry)}
                        disabled={busy}
                        aria-label={`কার্টে সরান: ${product.name}`}
                        className={cn(
                          "flex items-center justify-center gap-1.5 w-full h-10 rounded-xl text-[11px] font-black transition-all",
                          "bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-600 active:scale-[0.98] disabled:opacity-60",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600",
                        )}
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
                        )}
                        কার্টে সরান
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default WishlistContent;
