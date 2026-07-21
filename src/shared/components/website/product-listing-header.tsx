import { Breadcrumb } from "@/shared/components/website/breadcrumb";
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
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-1 max-w-2xl">{category.description}</p>
          )}
        </div>
        <p className="text-sm text-muted-foreground shrink-0">
          {totalCount} product{totalCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
