"use client";

import { useState } from "react";
import { X, SlidersHorizontal, Star } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import type { ProductListingFilters } from "./product-listing-content";

interface ProductFilterSidebarProps {
  filters: ProductListingFilters;
  onFilterChange: (filters: ProductListingFilters) => void;
  brands?: { id: string; name: string }[];
}

function StarRatingFilter({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Minimum Rating</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = value !== undefined && star <= value;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(value === star ? undefined : star)}
              className={`p-0.5 rounded-sm transition-colors hover:text-amber-400 ${
                active ? "text-amber-400" : "text-muted-foreground/40"
              }`}
            >
              <Star className="h-4 w-4" fill={active ? "currentColor" : "none"} />
            </button>
          );
        })}
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground"
          >
            & up
          </button>
        )}
      </div>
    </div>
  );
}

function FilterPanel({
  filters,
  onFilterChange,
  brands,
}: ProductFilterSidebarProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-8 text-xs"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-8 text-xs"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock ?? false}
            onCheckedChange={(checked) =>
              onFilterChange({
                ...filters,
                inStock: checked ? true : undefined,
              })
            }
          />
          <Label htmlFor="in-stock" className="text-sm cursor-pointer font-normal">
            In Stock Only
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="on-sale"
            checked={filters.onSale ?? false}
            onCheckedChange={(checked) =>
              onFilterChange({
                ...filters,
                onSale: checked ? true : undefined,
              })
            }
          />
          <Label htmlFor="on-sale" className="text-sm cursor-pointer font-normal">
            On Sale
          </Label>
        </div>
      </div>

      <Separator />

      <StarRatingFilter
        value={filters.minRating}
        onChange={(v) => onFilterChange({ ...filters, minRating: v })}
      />

      {brands && brands.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-3">Brand</h3>
            <div className="space-y-2">
              {brands.map((b) => {
                const active = filters.brand === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        brand: active ? undefined : b.id,
                      })
                    }
                    className={`block w-full text-left text-sm px-2 py-1 rounded transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ProductFilterSidebar(props: ProductFilterSidebarProps) {
  const [open, setOpen] = useState(false);
  const { filters } = props;
  const activeCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.brand ? 1 : 0);

  return (
    <>
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-24 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </h2>
            {activeCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                {activeCount}
              </span>
            )}
          </div>
          <FilterPanel {...props} />
        </div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium ml-0.5">
                {activeCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-sm flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 py-4 overflow-y-auto h-[calc(100%-60px)]">
            <FilterPanel {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
