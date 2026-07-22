"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { listCategoriesAction } from "@/features/catalog/actions/classification-actions";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Search, FolderTree, Star, Clock, Sparkles } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface CategorySectionProps {
  categoryId: string;
  onCategoryChange: (id: string, name?: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function CategorySection({
  categoryId,
  onCategoryChange,
  tags,
  onTagsChange,
}: CategorySectionProps): React.ReactElement {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const res = await listCategoriesAction();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
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
    if (!query.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [categories, query]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <StudioCollapsibleSection
      id="category"
      title="Category & Classification *"
      description="Select parent, sub, or nested category to load specification templates"
      defaultExpanded={true}
      badge={
        selectedCategory ? (
          <Badge variant="default" size="xs">
            {selectedCategory.name}
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
            placeholder="Search categories (e.g. Electronics, Clothing, Gadgets)…"
            className="h-9.5 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Category List */}
        <div className="ws-scroll max-h-48 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2 space-y-1">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Loading catalog taxonomy…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No matching categories found</p>
          ) : (
            filtered.map((cat) => {
              const isSelected = cat.id === categoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id, cat.name)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "text-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FolderTree className="h-3.5 w-3.5 shrink-0" />
                    {cat.name}
                  </span>
                  {isSelected ? (
                    <Badge variant="secondary" size="xs">Selected</Badge>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </StudioCollapsibleSection>
  );
}
