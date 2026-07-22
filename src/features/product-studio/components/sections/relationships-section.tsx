"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Link2, Plus, Trash2, Wand2, ArrowUpRight } from "lucide-react";
import type { ProductRelationship } from "../../types/studio-types";
import { useProductRelationships } from "../../hooks/use-product-relationships";
import { toast } from "sonner";

export interface RelationshipsSectionProps {
  categoryName?: string;
  brandName?: string;
  relationships?: ProductRelationship[];
  onRelationshipsChange?: (items: ProductRelationship[]) => void;
}

export function RelationshipsSection({
  categoryName,
  brandName,
  relationships = [],
  onRelationshipsChange,
}: RelationshipsSectionProps): React.ReactElement {
  const { suggestedItems } = useProductRelationships(categoryName, brandName);

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
          <Wand2 className="h-3.5 w-3.5 text-primary" /> Auto-Suggest Accessories
        </Button>
      }
    >
      <div className="space-y-3">
        {relationships.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
            No related products assigned. Click Auto-Suggest Accessories above to generate cross-sell recommendations.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {relationships.map((rel) => (
              <div key={rel.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-2xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" size="xs" className="font-bold uppercase text-[9px]">
                      {rel.type.replace("_", " ")}
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
