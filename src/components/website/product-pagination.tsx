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
    "flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-xs font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600";

  return (
    <nav aria-label="পেজ নেভিগেশন" className={cn("flex justify-center py-8", className)}>
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link
              href={pageHref(basePath, searchParams, page - 1)}
              aria-label="আগের পেজ"
              className={cn(
                linkBase,
                "border-slate-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50",
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span
              aria-hidden
              className={cn(
                linkBase,
                "cursor-not-allowed border-slate-200 bg-white text-slate-300",
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </span>
          )}
        </li>

        {items.map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden>
              <span className="flex h-9 min-w-9 items-center justify-center text-xs font-extrabold text-slate-400">
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span
                  aria-current="page"
                  className={cn(linkBase, "border-amber-500 bg-amber-500 text-slate-950")}
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={pageHref(basePath, searchParams, item)}
                  aria-label={`পেজ ${item}`}
                  className={cn(
                    linkBase,
                    "border-slate-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50",
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
                "border-slate-300 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50",
              )}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span
              aria-hidden
              className={cn(
                linkBase,
                "cursor-not-allowed border-slate-200 bg-white text-slate-300",
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
