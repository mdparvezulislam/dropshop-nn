"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { FormField } from "@/shared/components/forms/form-field";
import { TagsInput } from "@/shared/components/forms/tags-input";
import { StudioSection } from "../studio-layout";

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
  metaTitle, onMetaTitleChange,
  metaDescription, onMetaDescriptionChange,
  metaKeywords, onMetaKeywordsChange,
  slug, onSlugChange,
  ogImage, onOgImageChange,
}: SEOSectionProps): React.ReactElement {
  return (
    <StudioSection id="seo" title="SEO & Metadata" description="Search engine optimization for product pages">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Meta title" hint={`${metaTitle.length}/70 chars`} className="sm:col-span-2">
          <Input
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="SEO-optimized product title"
            maxLength={70}
          />
        </FormField>
        <FormField label="Meta description" hint={`${metaDescription.length}/160 chars`} className="sm:col-span-2">
          <Textarea
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Brief description for search results"
            rows={2}
            maxLength={160}
          />
        </FormField>
        <FormField label="URL slug">
          <Input
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="product-name-slug"
            className="font-mono"
          />
        </FormField>
        <FormField label="Open Graph image">
          <Input
            value={ogImage}
            onChange={(e) => onOgImageChange(e.target.value)}
            placeholder="https://…"
            className="font-mono"
          />
        </FormField>
        <FormField label="Meta keywords" className="sm:col-span-2">
          <TagsInput value={metaKeywords} onChange={onMetaKeywordsChange} />
        </FormField>
      </div>
    </StudioSection>
  );
}
