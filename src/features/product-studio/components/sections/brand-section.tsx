"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { listBrandsAction } from "@/features/catalog/actions/classification-actions";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BrandSectionProps {
  brandId: string;
  onBrandChange: (id: string, name?: string) => void;
}

export function BrandSection({ brandId, onBrandChange }: BrandSectionProps): React.ReactElement {
  const [brands, setBrands] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const res = await listBrandsAction();
        if (res.success && Array.isArray(res.data)) {
          setBrands(res.data);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
  }, [brands, query]);

  const selectedBrand = brands.find((b) => b.id === brandId);

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
        <div className="ws-scroll max-h-48 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {loading ? (
            <p className="col-span-full text-xs text-muted-foreground text-center py-4">
              Loading brands…
            </p>
          ) : filtered.length === 0 ? (
            <p className="col-span-full text-xs text-muted-foreground text-center py-4">
              No matching brands found
            </p>
          ) : (
            filtered.map((brand) => {
              const isSelected = brand.id === brandId;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => onBrandChange(brand.id, brand.name)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                    isSelected
                      ? "border-primary bg-accent text-foreground font-bold shadow-2xs"
                      : "border-border bg-card text-foreground/80 hover:border-border/80 hover:bg-muted/40",
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 font-bold text-xs text-primary overflow-hidden">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="text-xs truncate font-semibold flex-1">{brand.name}</span>
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
