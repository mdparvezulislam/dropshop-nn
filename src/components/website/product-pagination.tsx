import type { ReactElement } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Route the page links point at, e.g. "/products" or "/search". */
  basePath: string;
  /** Current query params to preserve across page links; `page` is overwritten. */
  searchParams?: Record<string, string | undefined>;
  className?: string;
}

function pageHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && key !== "page") sp.set(key, value);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** 1 … (current-1) current (current+1) … total, with gaps collapsed. */
function pageWindow(current: number, total: number): Array<number | "gap"> {
  const wanted = new Set<number>([1, total, current - 1, current, current + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  let prev = 0;
  for (const p of pages) {
    if (prev !== 0 && p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

/**
 * Server-rendered numbered pagination. Every page is a real link driven by
 * the `?page=N` URL param — no client-side fetching.
 */
export function ProductPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
  className,
}: ProductPaginationProps): ReactElement | null {
  if (totalPages <= 1) return null;

  const page = Math.min(Math.max(currentPage, 1), totalPages);
  const items = pageWindow(page, totalPages);

  const linkBase =
    "flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 active:scale-95";

  return (
    <nav aria-label="পেজ নেভিগেশন" className={cn("flex flex-col items-center gap-6 py-6", className)}>
      {/* Intuitive Bangladeshi E-Commerce "আরও দেখুন" (Load More) Button */}
      {page < totalPages && (
        <Link
          href={pageHref(basePath, searchParams, page + 1)}
          className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 touch-manipulation border border-amber-400"
        >
          <span>আরও প্রোডাক্ট দেখুন</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}

      {/* Numbered Pagination */}
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link
              href={pageHref(basePath, searchParams, page - 1)}
              aria-label="আগের পেজ"
              className={cn(
                linkBase,
                "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40",
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span
              aria-hidden
              className={cn(
                linkBase,
                "cursor-not-allowed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-700",
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </span>
          )}
        </li>

        {items.map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden>
              <span className="flex h-9 min-w-9 items-center justify-center text-xs font-bold text-slate-400">
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span
                  aria-current="page"
                  className={cn(linkBase, "border-amber-500 bg-amber-500 text-slate-950 font-black")}
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={pageHref(basePath, searchParams, item)}
                  aria-label={`পেজ ${item}`}
                  className={cn(
                    linkBase,
                    "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40",
                  )}
                >
                  {item}
                </Link>
              )}
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <Link
              href={pageHref(basePath, searchParams, page + 1)}
              aria-label="পরের পেজ"
              className={cn(
                linkBase,
                "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40",
              )}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span
              aria-hidden
              className={cn(
                linkBase,
                "cursor-not-allowed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-700",
              )}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default ProductPagination;
