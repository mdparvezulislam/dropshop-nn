"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** Real taxonomy from the server layout; empty when the fetch failed. */
  categories?: PublicCategoryInfo[];
  /** DOM id so the trigger can reference the panel via aria-controls. */
  id?: string;
}

/**
 * Category mega menu built from the REAL category taxonomy. Links go to
 * /category/[slug] only — no invented nested URLs. Keyboard support (Escape,
 * focus handling) lives on the trigger wrapper in SiteHeader; this panel
 * closes itself on mouse-leave and on Escape while focus is inside it.
 */
export function MegaMenu({
  isOpen,
  onClose,
  categories = [],
  id,
}: MegaMenuProps): React.ReactElement | null {
  if (!isOpen) return null;

  const topLevel = categories.filter((c) => c.parentCategoryId === null).slice(0, 8);
  const childrenOf = (parentId: string): PublicCategoryInfo[] =>
    categories.filter((c) => c.parentCategoryId === parentId).slice(0, 6);

  return (
    <div
      id={id}
      className="absolute left-0 top-full mt-1 w-[600px] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50"
      onMouseLeave={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      {topLevel.length === 0 ? (
        <p className="p-6 text-sm font-bold text-slate-600 text-center">
          কোনো ক্যাটাগরি পাওয়া যায়নি।
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-slate-100">
          {topLevel.map((cat) => {
            const children = childrenOf(cat.id);
            return (
              <div key={cat.id} className="p-5 bg-white hover:bg-slate-50 transition-colors">
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between group mb-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
                >
                  <span className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                    {cat.name}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 transition-all group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                {children.length > 0 && (
                  <ul className="space-y-1.5">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/category/${child.slug}`}
                          className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:pl-0.5 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="p-4 bg-amber-50/60 border-t border-slate-200">
        <Link
          href="/categories"
          className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-amber-700 hover:text-amber-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
        >
          সব ক্যাটাগরি দেখুন
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export default MegaMenu;
