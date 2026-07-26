"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { TagsInput } from "@/components/forms/tags-input";
import { StudioSection } from "../studio-layout";
import { Card } from "@/components/ui/card";
import { Globe, Search } from "lucide-react";

export interface SEOSectionProps {
  metaTitle: string;
  onMetaTitleChange: (v: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  metaKeywords: string[];
  onMetaKeywordsChange: (v: string[]) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  ogImage: string;
  onOgImageChange: (v: string) => void;
}

export function SEOSection({
  metaTitle,
  onMetaTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  metaKeywords,
  onMetaKeywordsChange,
  slug,
  onSlugChange,
  ogImage,
  onOgImageChange,
}: SEOSectionProps): React.ReactElement {
  const displayTitle = metaTitle || "Product Title | DropshopNN";
  const displaySlug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "product-slug";
  const displayDesc =
    metaDescription ||
    "Buy authentic products with fast delivery across Bangladesh on DropshopNN. Premium quality and best market prices.";

  return (
    <StudioSection
      id="seo"
      title="SEO & Search Engine Preview"
      description="Real-time Google search listing snippet and metadata controls"
    >
      {/* Live Google Search Preview Card */}
      <Card className="border border-border bg-card p-4 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <Search className="h-3.5 w-3.5 text-primary" /> Google Search Preview
        </div>
        <div className="p-3 rounded-lg border border-border bg-background space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3 w-3 text-success" />
            <span className="truncate font-mono">https://dropshop.nn/products/{displaySlug}</span>
          </div>
          <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
            {displayTitle}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 pt-2">
        <FormField
          label="Meta Title"
          hint={`${metaTitle.length}/70 chars`}
          className="sm:col-span-2"
        >
          <Input
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="SEO-optimized product title"
            maxLength={70}
          />
        </FormField>
        <FormField
          label="Meta Description"
          hint={`${metaDescription.length}/160 chars`}
          className="sm:col-span-2"
        >
          <Textarea
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Brief snippet for search results"
            rows={2}
            maxLength={160}
          />
        </FormField>
        <FormField label="URL Handle / Slug">
          <Input
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="product-name-slug"
            className="font-mono text-xs"
          />
        </FormField>
        <FormField label="Social Sharing (OG Image)">
          <Input
            value={ogImage}
            onChange={(e) => onOgImageChange(e.target.value)}
            placeholder="https://..."
            className="font-mono text-xs"
          />
        </FormField>
        <FormField label="Meta Keywords" className="sm:col-span-2">
          <TagsInput value={metaKeywords} onChange={onMetaKeywordsChange} />
        </FormField>
      </div>
    </StudioSection>
  );
}
