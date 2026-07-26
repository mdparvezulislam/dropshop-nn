"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { History } from "lucide-react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";

/**
 * Recently-viewed strip (client-side placeholder for a future server-backed
 * history). Snapshots of REAL products the visitor opened are kept in
 * localStorage — no fetching, no invented data.
 */
interface ViewedProduct {
  slug: string;
  name: string;
  image: string;
  /** BDT display price at view time; 0 = unpriced. */
  price: number;
  viewedAt: number;
}

const STORAGE_KEY = "dropshopnn.recently-viewed.v1";
const MAX_ITEMS = 8;

interface RecentlyViewedProps {
  /** The product being viewed now — recorded, excluded from display. */
  current: Omit<ViewedProduct, "viewedAt">;
}

function readStorage(): ViewedProduct[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ViewedProduct =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ViewedProduct).slug === "string" &&
        typeof (item as ViewedProduct).name === "string",
    );
  } catch {
    return [];
  }
}

export function RecentlyViewed({ current }: RecentlyViewedProps) {
  const [items, setItems] = React.useState<ViewedProduct[]>([]);

  React.useEffect(() => {
    const stored = readStorage();
    setItems(stored.filter((item) => item.slug !== current.slug));

    const next = [
      { ...current, viewedAt: Date.now() },
      ...stored.filter((item) => item.slug !== current.slug),
    ].slice(0, MAX_ITEMS);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — feature silently disabled
    }
  }, [current]);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed-heading" className="pt-8 border-t border-slate-200">
      <h2
        id="recently-viewed-heading"
        className="flex items-center gap-2 text-lg font-black text-slate-900 mb-5"
      >
        <History className="h-5 w-5 text-slate-400" aria-hidden />
        সম্প্রতি দেখা প্রোডাক্ট
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-none">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/product/${item.slug}`}
            className="group shrink-0 snap-start w-36 rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <div className="relative aspect-square bg-slate-100">
              <Image
                src={item.image || PRODUCT_IMAGE_PLACEHOLDER}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="144px"
              />
            </div>
            <div className="p-2.5 space-y-1">
              <p className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-snug">
                {item.name}
              </p>
              {item.price > 0 && (
                <p className="text-xs font-black text-slate-900 tabular-nums">
                  ৳{item.price.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
