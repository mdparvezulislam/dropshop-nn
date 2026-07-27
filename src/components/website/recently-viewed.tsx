"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PRODUCT_IMAGE_PLACEHOLDER, RECENTLY_VIEWED_LIMIT } from "@/config/site";

/**
 * Recently-viewed history.
 *
 * Snapshots of REAL products the visitor opened, kept per-browser in
 * localStorage — no auth, no fetching, no invented data. The list is
 * deduped by slug, ordered newest-first and capped at RECENTLY_VIEWED_LIMIT.
 */

export interface ViewedProduct {
  slug: string;
  name: string;
  image: string;
  /** BDT display price at view time; 0 = unpriced. */
  price: number;
  viewedAt: number;
}

export const RECENTLY_VIEWED_STORAGE_KEY = "dropshopnn.recently-viewed.v1";

function isViewedProduct(value: unknown): value is ViewedProduct {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<ViewedProduct>;
  return typeof item.slug === "string" && typeof item.name === "string";
}

/** Newest-first, deduped by slug, capped. Safe to call on the client only. */
export function readRecentlyViewed(): ViewedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalize(parsed.filter(isViewedProduct));
  } catch {
    return [];
  }
}

function normalize(items: ViewedProduct[]): ViewedProduct[] {
  const seen = new Set<string>();
  const ordered = [...items].sort((a, b) => (b.viewedAt ?? 0) - (a.viewedAt ?? 0));
  const unique: ViewedProduct[] = [];
  for (const item of ordered) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    unique.push({
      slug: item.slug,
      name: item.name,
      image: typeof item.image === "string" ? item.image : "",
      price: typeof item.price === "number" && item.price > 0 ? item.price : 0,
      viewedAt: typeof item.viewedAt === "number" ? item.viewedAt : 0,
    });
    if (unique.length >= RECENTLY_VIEWED_LIMIT) break;
  }
  return unique;
}

function writeRecentlyViewed(items: ViewedProduct[]): ViewedProduct[] {
  const next = normalize(items);
  try {
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable/full — the feature degrades to in-memory only.
  }
  return next;
}

export function clearRecentlyViewed(): void {
  try {
    window.localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
  } catch {
    // Nothing to do — there is no history to lose if storage is blocked.
  }
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function ClearHistoryButton({ onCleared }: { onCleared: () => void }): React.ReactElement {
  return (
    <button
      type="button"
      onClick={() => {
        clearRecentlyViewed();
        onCleared();
        toast.success("দেখার ইতিহাস মুছে ফেলা হয়েছে");
      }}
      className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-slate-300 bg-white text-[11px] font-black text-slate-700 transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
      ইতিহাস মুছুন
    </button>
  );
}

function ViewedCard({
  item,
  className,
  sizes,
}: {
  item: ViewedProduct;
  className?: string;
  sizes: string;
}): React.ReactElement {
  return (
    <Link
      href={`/product/${item.slug}`}
      className={`group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${className ?? ""}`}
    >
      <div className="relative aspect-square bg-slate-100">
        <Image
          src={item.image || PRODUCT_IMAGE_PLACEHOLDER}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes={sizes}
        />
      </div>
      <div className="p-2.5 space-y-1">
        <p className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-snug">
          {item.name}
        </p>
        {item.price > 0 && (
          <p className="text-xs font-black text-slate-900 tabular-nums">{formatBdt(item.price)}</p>
        )}
      </div>
    </Link>
  );
}

interface RecentlyViewedProps {
  /** The product being viewed now — recorded, excluded from display. */
  current: Omit<ViewedProduct, "viewedAt">;
}

/** Horizontal strip rendered under the PDP. Records the current product. */
export function RecentlyViewed({ current }: RecentlyViewedProps): React.ReactElement | null {
  const [items, setItems] = React.useState<ViewedProduct[]>([]);
  const { slug, name, image, price } = current;

  React.useEffect(() => {
    const stored = readRecentlyViewed();
    const others = stored.filter((item) => item.slug !== slug);
    setItems(others);
    writeRecentlyViewed([{ slug, name, image, price, viewedAt: Date.now() }, ...others]);
  }, [slug, name, image, price]);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed-heading" className="pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2
          id="recently-viewed-heading"
          className="flex items-center gap-2 text-lg font-black text-slate-900"
        >
          <History className="h-5 w-5 text-slate-400" aria-hidden />
          সম্প্রতি দেখা প্রোডাক্ট
        </h2>
        <ClearHistoryButton onCleared={() => setItems([])} />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-none">
        {items.map((item) => (
          <ViewedCard
            key={item.slug}
            item={item}
            className="shrink-0 snap-start w-36"
            sizes="144px"
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Full-page grid of the same local history — used by the account area.
 * Reads on mount only, so server render and first paint stay identical.
 */
export function RecentlyViewedGrid(): React.ReactElement {
  const [items, setItems] = React.useState<ViewedProduct[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setItems(readRecentlyViewed());
    setHydrated(true);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">সম্প্রতি দেখা প্রোডাক্ট</h1>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            এই ব্রাউজারে সর্বশেষ {RECENTLY_VIEWED_LIMIT} টি প্রোডাক্ট সংরক্ষিত থাকে।
          </p>
        </div>
        {hydrated && items.length > 0 && <ClearHistoryButton onCleared={() => setItems([])} />}
      </div>

      {!hydrated ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          aria-busy="true"
        >
          <span className="sr-only">ইতিহাস লোড হচ্ছে…</span>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="aspect-square bg-slate-200" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
          <History className="h-10 w-10 text-slate-300 mx-auto mb-3" aria-hidden />
          <p className="text-sm font-black text-slate-700 mb-1">কোনো ইতিহাস নেই</p>
          <p className="text-xs font-bold text-slate-500 mb-4">
            প্রোডাক্ট দেখা শুরু করলে সেগুলো এখানে জমা হবে।
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            প্রোডাক্ট দেখুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item) => (
            <ViewedCard
              key={item.slug}
              item={item}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}
