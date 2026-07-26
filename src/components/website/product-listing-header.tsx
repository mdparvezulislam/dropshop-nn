import type { ReactElement } from "react";
import { Breadcrumb } from "@/components/website/breadcrumb";
import type { PublicBreadcrumb } from "@/features/catalog/domain/public-catalog-types";

interface ProductListingHeaderProps {
  title: string;
  /** Real entity description only — omit the prop instead of inventing copy. */
  description?: string;
  /** Full trail including "হোম" (the display component renders home as an icon). */
  breadcrumbs: PublicBreadcrumb[];
  totalCount: number;
}

export function ProductListingHeader({
  title,
  description,
  breadcrumbs,
  totalCount,
}: ProductListingHeaderProps): ReactElement {
  // The Breadcrumb component already renders a leading home icon link, so
  // drop the "হোম" entry from the data trail to avoid duplicating it.
  const trail = breadcrumbs[0]?.href === "/" ? breadcrumbs.slice(1) : breadcrumbs;

  return (
    <div className="space-y-3">
      <Breadcrumb items={trail.map((crumb) => ({ label: crumb.name, href: crumb.href }))} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-xs font-bold text-slate-600 sm:text-sm">
              {description}
            </p>
          )}
        </div>
        <p className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-slate-700 tabular-nums">
          মোট {totalCount} টি প্রোডাক্ট
        </p>
      </div>
    </div>
  );
}
