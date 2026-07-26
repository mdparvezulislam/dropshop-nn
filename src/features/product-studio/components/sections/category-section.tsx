"use client";

import * as React from "react";
import Link from "next/link";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { useTaxonomy } from "@/features/catalog/hooks/use-taxonomy";
import { Badge } from "@/components/ui/badge";
import { Search, FolderTree, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
  // Shared, cached taxonomy — one fetch per session across every selector.
  const { flatCategories, loading } = useTaxonomy();
  const [query, setQuery] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return flatCategories;
    // Matched against the full ancestry path, so "mobile" finds "Electronics > Mobile".
    return flatCategories.filter(
      (c) => c.path.toLowerCase().includes(needle) || c.slug.toLowerCase().includes(needle),
    );
  }, [flatCategories, query]);

  const selectedCategory = flatCategories.find((c) => c.id === categoryId);

  /** Roving arrow-key navigation across the option list. */
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
      id="category"
      title="Category & Classification *"
      description="Select parent, sub, or nested category to load specification templates"
      defaultExpanded={true}
      badge={
        selectedCategory ? (
          <Badge variant="default" size="xs">
            {selectedCategory.path}
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
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Category List */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Product category"
          onKeyDown={handleListKeyDown}
          className="ws-scroll max-h-48 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2 space-y-1"
        >
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Loading catalog taxonomy…
            </p>
          ) : filtered.length === 0 ? (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">No matching categories found</p>
              <Link
                href="/dashboard/catalog/categories"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Create a category
              </Link>
            </div>
          ) : (
            filtered.map((cat) => {
              const isSelected = cat.id === categoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  title={cat.path}
                  onClick={() => onCategoryChange(cat.id, cat.name)}
                  style={{ paddingLeft: `${0.75 + cat.depth * 0.85}rem` }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg py-2 pr-3 text-xs font-semibold transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "text-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FolderTree className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {cat.depth > 0 && (
                        <span className="opacity-50 mr-1" aria-hidden="true">
                          └
                        </span>
                      )}
                      {cat.name}
                    </span>
                  </span>
                  {isSelected ? (
                    <Badge variant="secondary" size="xs">
                      Selected
                    </Badge>
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
