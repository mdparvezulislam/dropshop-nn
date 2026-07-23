"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Plus, Trash2, Wand2, Search, X } from "lucide-react";
import type { ProductRelationship } from "../../types/studio-types";
import { useProductRelationships } from "../../hooks/use-product-relationships";
import { listProductsAction } from "@/features/catalog/actions/product-actions";
import { toast } from "sonner";

export interface RelationshipsSectionProps {
  categoryName?: string;
  brandName?: string;
  relationships?: ProductRelationship[];
  onRelationshipsChange?: (items: ProductRelationship[]) => void;
}

const RELATIONSHIP_TYPES = [
  { value: "related", label: "Related" },
  { value: "upsell", label: "Upsell" },
  { value: "cross_sell", label: "Cross Sell" },
  { value: "accessory", label: "Accessory" },
  { value: "replacement", label: "Replacement" },
  { value: "frequently_bought_together", label: "Frequently Bought Together" },
] as const;

interface SearchResult {
  id: string;
  name: string;
  sku: string;
  price: number;
  image?: string;
}

export function RelationshipsSection({
  categoryName,
  brandName,
  relationships = [],
  onRelationshipsChange,
}: RelationshipsSectionProps): React.ReactElement {
  const { suggestedItems } = useProductRelationships(categoryName, brandName);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<string>("related");
  const [showTypePicker, setShowTypePicker] = React.useState(false);
  const [pendingProduct, setPendingProduct] = React.useState<SearchResult | null>(null);

  const handleSearch = React.useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    try {
      const res = await listProductsAction({ search: query }, { limit: 10 });
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data as any).items ?? [];
        setSearchResults(
          items.map((p: any) => ({
            id: p.id,
            name: p.title ?? p.name ?? "",
            sku: p.sku ?? "",
            price: p.retailPrice ?? p.price ?? p.pricing?.sellingPrice ?? 0,
            image: p.images?.[0] ?? p.media?.[0]?.url ?? undefined,
          })),
        );
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSelectProduct = (product: SearchResult) => {
    setPendingProduct(product);
    setShowTypePicker(true);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleConfirmAdd = () => {
    if (!pendingProduct || !onRelationshipsChange) return;
    const newRel: ProductRelationship = {
      id: `rel-${Date.now()}`,
      targetProductId: pendingProduct.id,
      targetProductName: pendingProduct.name,
      targetProductSku: pendingProduct.sku,
      targetProductPrice: pendingProduct.price,
      targetProductImage: pendingProduct.image,
      type: selectedType as ProductRelationship["type"],
    };
    onRelationshipsChange([...relationships, newRel]);
    setPendingProduct(null);
    setShowTypePicker(false);
    toast.success(`Added "${pendingProduct.name}" as ${selectedType.replace(/_/g, " ")}`);
  };

  const handleAutoSuggest = () => {
    if (!onRelationshipsChange) return;
    onRelationshipsChange([...relationships, ...suggestedItems]);
    toast.success("Auto-suggested 3 complementary accessories & upsells!");
  };

  const handleRemove = (id: string) => {
    if (!onRelationshipsChange) return;
    onRelationshipsChange(relationships.filter((r) => r.id !== id));
  };

  return (
    <StudioCollapsibleSection
      id="relationships"
      title={`Product Relationships & Recommendations (${relationships.length})`}
      description="Cross-sells, upsells, accessories, and frequently bought together items"
      defaultExpanded={true}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-semibold"
          onClick={handleAutoSuggest}
        >
          <Wand2 className="h-3.5 w-3.5 text-primary" /> Auto-Suggest
        </Button>
      }
    >
      <div className="space-y-3">
        {/* Search Products */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products by name or SKU to add as relationship..."
            className="h-9 pl-9 text-xs"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center gap-3 w-full p-3 text-left hover:bg-muted/40 transition-colors border-b border-border/50 last:border-b-0"
                >
                  {product.image ? (
                    <img src={product.image} alt="" className="h-8 w-8 rounded-md object-cover bg-muted" />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      <Link2 className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{product.sku} • ৳{product.price.toLocaleString()}</p>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                </button>
              ))}
            </div>
          )}
          {showResults && searchQuery && !searching && searchResults.length === 0 && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-border bg-card shadow-lg p-4 text-center text-xs text-muted-foreground">
              No products found
            </div>
          )}
        </div>

        {/* Type Picker Modal */}
        {showTypePicker && pendingProduct && (
          <div className="p-4 rounded-xl border border-primary/30 bg-accent/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Add "{pendingProduct.name}" as:
              </span>
              <button
                type="button"
                onClick={() => { setShowTypePicker(false); setPendingProduct(null); }}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedType === type.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => { setShowTypePicker(false); setPendingProduct(null); }}>
                Cancel
              </Button>
              <Button size="sm" className="gap-1" onClick={handleConfirmAdd}>
                <Plus className="h-3.5 w-3.5" /> Add Relationship
              </Button>
            </div>
          </div>
        )}

        {/* Existing Relationships */}
        {relationships.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
            No related products assigned. Search for products above or click Auto-Suggest.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {relationships.map((rel) => (
              <div key={rel.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-2xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" size="xs" className="font-bold uppercase text-[9px]">
                      {rel.type.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs font-bold text-foreground truncate">{rel.targetProductName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-mono">{rel.targetProductSku}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-foreground">৳{rel.targetProductPrice.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(rel.id)}
                  className="p-1 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudioCollapsibleSection>
  );
}
