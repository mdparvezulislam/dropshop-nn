import { Breadcrumb } from "@/components/website/breadcrumb";
import type { Category } from "@/features/catalog/domain/classification-entity";

interface ProductListingHeaderProps {
  category: Category;
  totalCount: number;
}

export function ProductListingHeader({ category, totalCount }: ProductListingHeaderProps) {
  return (
    <div className="space-y-3">
      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          { label: "ক্যাটাগরি", href: "/categories" },
          { label: category.name },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{category.name}</h1>
          {category.description && (
            <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1 max-w-2xl">{category.description}</p>
          )}
        </div>
        <p className="text-xs font-black text-slate-700 shrink-0 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
          মোট {totalCount} টি প্রোডাক্ট
        </p>
      </div>
    </div>
  );
}
