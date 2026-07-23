"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import { Megaphone, Sparkles, Plus, Trash2, Tag, Search, Bot } from "lucide-react";
import { useSearchOptimization } from "../../hooks/use-search-optimization";
import { toast } from "sonner";

export interface MarketingStudioSectionProps {
  productName: string;
  categoryName?: string;
  brandName?: string;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  bulletFeatures?: string[];
  onBulletFeaturesChange?: (bullets: string[]) => void;
}

export function MarketingStudioSection({
  productName,
  categoryName,
  brandName,
  tags = [],
  onTagsChange,
  bulletFeatures = ["Official 1 Year Warranty across Bangladesh", "High-performance chipset & premium build quality", "Fast 24-hour express courier dispatch"],
  onBulletFeaturesChange,
}: MarketingStudioSectionProps): React.ReactElement {
  const [newBullet, setNewBullet] = React.useState("");
  const [newTag, setNewTag] = React.useState("");

  const searchOpt = useSearchOptimization(productName, categoryName, brandName, tags);

  const addBullet = () => {
    if (!newBullet.trim() || !onBulletFeaturesChange) return;
    onBulletFeaturesChange([...bulletFeatures, newBullet.trim()]);
    setNewBullet("");
  };

  const removeBullet = (index: number) => {
    if (!onBulletFeaturesChange) return;
    onBulletFeaturesChange(bulletFeatures.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (!newTag.trim() || !onTagsChange) return;
    if (!tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    if (!onTagsChange) return;
    onTagsChange(tags.filter((t) => t !== tag));
  };

  // AI Extension Trigger Handlers (Prepared extension points)
  const handleAIEnhance = () => {
    toast.info("AI Copywriting Extension Point: Feature ready for LLM integration.");
  };

  return (
    <StudioCollapsibleSection
      id="marketing"
      title="Marketing & Search Intelligence Studio"
      description="Bullet feature highlights, search weights, keyword tokens, and AI copy extension triggers"
      defaultExpanded={true}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
          onClick={handleAIEnhance}
        >
          <Bot className="h-3 w-3" /> AI Copy Assistant
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Bullet Features List */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Bullet Feature Highlights (Key Selling Points)
          </label>
          <div className="space-y-2">
            {bulletFeatures.map((b, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground flex-1">{b}</span>
                <button
                  type="button"
                  onClick={() => removeBullet(i)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Input
                value={newBullet}
                onChange={(e) => setNewBullet(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBullet()}
                placeholder="e.g. Ultra-low latency bluetooth gaming mode"
                className="text-xs font-semibold"
              />
              <Button type="button" variant="outline" size="sm" onClick={addBullet} disabled={!newBullet.trim()}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Product Tags */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Search Tags ({tags.length})
          </label>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-border bg-muted/20">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 text-xs">
                {t}
                <button type="button" onClick={() => removeTag(t)} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1 min-w-[140px]">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="+ Add tag…"
                className="h-7 text-xs border-0 bg-transparent shadow-none"
              />
            </div>
          </div>
        </div>

        {/* Auto Search Optimization Summary */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-primary" /> Auto Search Tokens & Index Weight
            </span>
            <Badge variant="default" size="xs">
              Weight: {searchOpt.searchWeight}/100
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {searchOpt.tokens.map((token) => (
              <span key={token} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                #{token}
              </span>
            ))}
          </div>
        </div>
      </div>
    </StudioCollapsibleSection>
  );
}
