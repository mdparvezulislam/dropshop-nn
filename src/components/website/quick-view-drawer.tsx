"use client";

import { useEffect, useId, useRef, useState, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

export interface QuickViewDrawerProps {
  product: PublicProductCard | null;
  onClose: () => void;
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function StockChip({ status }: { status: PublicProductCard["stockStatus"] }): ReactElement {
  if (status === "out_of_stock") {
    return (
      <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-extrabold text-red-700">
        স্টক শেষ
      </span>
    );
  }
  if (status === "low_stock") {
    return (
      <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-extrabold text-orange-700">
        সীমিত স্টক
      </span>
    );
  }
  return (
    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
      স্টকে আছে
    </span>
  );
}

export function QuickViewDrawer({ product, onClose }: QuickViewDrawerProps): ReactElement | null {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [product, onClose]);

  if (!product) return null;

  const imageSrc = imageError || !product.image ? PRODUCT_IMAGE_PLACEHOLDER : product.image;
  const productUrl = `/product/${product.slug}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 p-2 backdrop-blur-xs sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
            কুইক ভিউ
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="কুইক ভিউ বন্ধ করুন"
            className="rounded-full p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                onError={() => setImageError(true)}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 400px"
              />
              {product.discountPercent !== undefined && (
                <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow-2xs">
                  -{product.discountPercent}%
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {product.brandName && (
                  <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-700">
                    {product.brandName}
                  </span>
                )}
                <StockChip status={product.stockStatus} />
              </div>

              <h2 id={titleId} className="text-lg font-black leading-snug text-slate-900">
                {product.name}
              </h2>

              {product.categoryName && (
                <p className="text-xs font-bold text-slate-600">{product.categoryName}</p>
              )}

              {product.price > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 tabular-nums">
                    {formatBdt(product.price)}
                  </span>
                  {product.comparePrice !== undefined && (
                    <span className="text-sm font-bold text-slate-400 line-through tabular-nums">
                      {formatBdt(product.comparePrice)}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm font-bold text-slate-500">দামের জন্য যোগাযোগ করুন</p>
              )}

              {product.badges.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="প্রোডাক্ট ব্যাজ">
                  {product.badges.map((badge) => (
                    <li
                      key={badge}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-700"
                    >
                      {badge}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 bg-white p-4">
          <Link
            href={productUrl}
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 text-xs font-extrabold text-slate-950 shadow-xs transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            বিস্তারিত দেখুন ও অর্ডার করুন
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default QuickViewDrawer;
