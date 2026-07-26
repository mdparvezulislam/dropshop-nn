"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight, X } from "lucide-react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

export interface CompareDrawerProps {
  products: PublicProductCard[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

/**
 * Non-modal selection tray pinned to the bottom of the viewport. It is a
 * landmark region (not a dialog) because it never traps focus or blocks the
 * page behind it.
 */
export function CompareDrawer({
  products,
  onRemove,
  onClear,
}: CompareDrawerProps): ReactElement | null {
  if (products.length === 0) return null;

  const compareHref = `/compare?items=${products.map((p) => encodeURIComponent(p.slug)).join(",")}`;

  return (
    <section
      role="region"
      aria-label="তুলনার জন্য নির্বাচিত প্রোডাক্ট"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-4 shadow-2xl"
    >
      <div className="mx-auto flex max-w-(--content-max) flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <ArrowLeftRight className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              প্রোডাক্ট তুলনা ({products.length}/4)
            </h4>
            <p className="text-[11px] text-slate-600">
              নির্বাচিত প্রোডাক্টগুলো পাশাপাশি তুলনা করুন
            </p>
          </div>
        </div>

        <ul
          className="flex items-center gap-3 overflow-x-auto py-1"
          aria-label="নির্বাচিত প্রোডাক্ট"
        >
          {products.map((p) => (
            <li
              key={p.id}
              className="relative flex w-44 shrink-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image
                  src={p.image || PRODUCT_IMAGE_PLACEHOLDER}
                  alt=""
                  aria-hidden
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <Link
                  href={`/product/${p.slug}`}
                  className="block truncate rounded text-xs font-bold text-slate-900 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-amber-600"
                >
                  {p.name}
                </Link>
                <p className="text-[10px] font-extrabold text-amber-700 tabular-nums">
                  {p.price > 0 ? formatBdt(p.price) : "দামের জন্য যোগাযোগ"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label={`তুলনা থেকে সরান: ${p.name}`}
                className="rounded p-1 text-slate-500 transition-colors hover:text-red-600 focus-visible:outline-2 focus-visible:outline-amber-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={compareHref}
            className="flex h-9 items-center rounded-xl bg-amber-500 px-4 text-xs font-extrabold text-slate-950 shadow-xs transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            তুলনা দেখুন
          </Link>
          <button
            type="button"
            onClick={onClear}
            aria-label="তুলনার তালিকা খালি করুন"
            className="rounded p-2 text-xs font-semibold text-slate-600 transition-colors hover:text-red-600 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            মুছে ফেলুন
          </button>
        </div>
      </div>
    </section>
  );
}

export default CompareDrawer;
