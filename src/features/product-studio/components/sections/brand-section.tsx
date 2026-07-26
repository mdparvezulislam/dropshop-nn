"use client";

import * as React from "react";
import Link from "next/link";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { useTaxonomy } from "@/features/catalog/hooks/use-taxonomy";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Check, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BrandSectionProps {
  brandId: string;
  onBrandChange: (id: string, name?: string) => void;
}

export function BrandSection({ brandId, onBrandChange }: BrandSectionProps): React.ReactElement {
  // Shared, cached taxonomy — already sorted featured-first by the service.
  const { brands, loading } = useTaxonomy();
  const [query, setQuery] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return brands;
    return brands.filter(
      (b) => b.name.toLowerCase().includes(needle) || b.slug.toLowerCase().includes(needle),
    );
  }, [brands, query]);

  const selectedBrand = brands.find((b) => b.id === brandId);

  /** Roving arrow-key navigation across the brand grid. */
  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const options = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("button[role=option]") ?? [],
    );
    if (options.length === 0) return;
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "ArrowDown"
        ? Math.min(current + 1, options.length - 1)
        : Math.max(current - 1, 0);
    options[current === -1 ? 0 : next]?.focus();
  };

  return (
    <StudioCollapsibleSection
      id="brand"
      title="Brand & Manufacturer *"
      description="Assign brand manufacturer and display official brand logo badge"
      defaultExpanded={true}
      badge={
        selectedBrand ? (
          <Badge variant="secondary" size="xs" className="font-bold">
            {selectedBrand.name}
          </Badge>
        ) : null
      }
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands (e.g. Apple, Samsung, Nike)…"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Brand Grid Select */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Product brand"
          onKeyDown={handleListKeyDown}
          className="ws-scroll max-h-48 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2 grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {loading ? (
            <p className="col-span-full text-xs text-muted-foreground text-center py-4">
              Loading brands…
            </p>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">No matching brands found</p>
              <Link
                href="/dashboard/catalog/brands"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Create a brand
              </Link>
            </div>
          ) : (
            filtered.map((brand) => {
              const isSelected = brand.id === brandId;
              return (
                <button
                  key={brand.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onBrandChange(brand.id, brand.name)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-primary bg-accent text-foreground font-bold shadow-2xs"
                      : "border-border bg-card text-foreground/80 hover:border-border/80 hover:bg-muted/40",
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 font-bold text-xs text-primary overflow-hidden">
                    {brand.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- CDN brand logo
                      <img
                        src={brand.logo}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="text-xs truncate font-semibold flex-1">{brand.name}</span>
                  {brand.isFeatured && !isSelected ? (
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                  ) : null}
                  {isSelected ? <Check className="h-3.5 w-3.5 text-primary shrink-0" /> : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </StudioCollapsibleSection>
  );
}
