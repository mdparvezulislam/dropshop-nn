"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, ShoppingBag, Sparkles, AlertCircle } from "lucide-react";
import { useGoogleMerchant } from "../../hooks/use-google-merchant";
import { GoogleMerchantModal } from "../modals/google-merchant-modal";

export interface SEOAdvancedSectionProps {
  name: string;
  sku: string;
  barcode?: string;
  brandName?: string;
  categoryName?: string;
  metaTitle: string;
  onMetaTitleChange: (v: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  ogImage?: string;
  onOgImageChange?: (v: string) => void;
  focusKeyword?: string;
  onFocusKeywordChange?: (v: string) => void;
}

export function SEOAdvancedSection({
  name,
  sku,
  barcode,
  brandName,
  categoryName,
  metaTitle,
  onMetaTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  slug,
  onSlugChange,
  ogImage = "",
  onOgImageChange,
  focusKeyword = "",
  onFocusKeywordChange,
}: SEOAdvancedSectionProps): React.ReactElement {
  const [merchantModalOpen, setMerchantModalOpen] = React.useState(false);
  const [previewTab, setPreviewTab] = React.useState<"google" | "social">("google");

  const { merchantData, warnings, generateXmlFeed, generateJsonLd } = useGoogleMerchant(
    name,
    sku,
    barcode,
    brandName,
    categoryName,
  );

  const displayTitle = metaTitle || `${name || "Product Name"} | DropshopNN`;
  const displaySlug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "product-slug";
  const displayDesc =
    metaDescription ||
    "Buy authentic products with fast delivery across Bangladesh on DropshopNN. Premium quality and best market prices.";

  const keywordFound =
    focusKeyword &&
    (name.toLowerCase().includes(focusKeyword.toLowerCase()) ||
      displayDesc.toLowerCase().includes(focusKeyword.toLowerCase()));

  return (
    <>
      <StudioCollapsibleSection
        id="seo"
        title="Advanced SEO & Google Merchant Studio"
        description="Real-time Google search snippet, OpenGraph cards, JSON-LD schema, and Google Merchant feed compliance"
        defaultExpanded={true}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => setMerchantModalOpen(true)}
          >
            <ShoppingBag className="h-3.5 w-3.5 text-primary" /> Google Feed Inspector
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Live Preview Switcher Card */}
          <Card className="border border-border bg-card p-4 rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  Search & Social Live Preview
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-xl sm:rounded-lg border border-border bg-muted/40 p-0.5 sm:p-1">
                <button
                  type="button"
                  onClick={() => setPreviewTab("google")}
                  className={cn(
                    "rounded-xl sm:rounded-md px-3.5 sm:px-2.5 py-2 sm:py-0.5 text-xs sm:text-[11px] font-bold transition-all",
                    previewTab === "google"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Google Snippet
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("social")}
                  className={cn(
                    "rounded-xl sm:rounded-md px-3.5 sm:px-2.5 py-2 sm:py-0.5 text-xs sm:text-[11px] font-bold transition-all",
                    previewTab === "social"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Facebook / OpenGraph
                </button>
              </div>
            </div>

            {previewTab === "google" ? (
              <div className="p-3.5 rounded-xl border border-border bg-background space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3 text-success" />
                  <span className="truncate font-mono text-[11px]">
                    https://dropshop.nn/products/{displaySlug}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                  {displayTitle}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {displayDesc}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden max-w-md shadow-2xs">
                <div className="aspect-[1.91/1] bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold">
                  {ogImage ? (
                    <img src={ogImage} alt="OG" className="h-full w-full object-cover" />
                  ) : (
                    "OpenGraph Card Image"
                  )}
                </div>
                <div className="p-3 space-y-0.5 bg-muted/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    DROPSHOP.NN
                  </p>
                  <p className="text-xs font-extrabold text-foreground truncate">{displayTitle}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{displayDesc}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Warnings list for Google Merchant */}
          {warnings.length > 0 && (
            <div className="p-3 rounded-xl border border-warning/30 bg-warning/10 space-y-1">
              <span className="text-xs font-bold text-warning flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Google Merchant Compliance Alerts
              </span>
              <ul className="text-[11px] text-warning/90 space-y-0.5 font-medium pl-5 list-disc">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Focus Target Keyword" hint="Primary keyword to optimize">
              <Input
                value={focusKeyword}
                onChange={(e) => onFocusKeywordChange && onFocusKeywordChange(e.target.value)}
                placeholder="e.g. wireless headphones dhaka"
                className="font-semibold text-xs"
              />
            </FormField>
            <FormField label="URL Slug Handle">
              <Input
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="product-name-handle"
                className="font-mono text-xs"
              />
            </FormField>
            <FormField
              label="Meta Title"
              hint={`${metaTitle.length}/70 chars`}
              className="sm:col-span-2"
            >
              <Input
                value={metaTitle}
                onChange={(e) => onMetaTitleChange(e.target.value)}
                placeholder="SEO title tag"
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
                placeholder="SEO snippet description"
                rows={2}
                maxLength={160}
              />
            </FormField>
          </div>
        </div>
      </StudioCollapsibleSection>

      <GoogleMerchantModal
        open={merchantModalOpen}
        onOpenChange={setMerchantModalOpen}
        xmlFeed={generateXmlFeed()}
        jsonLd={generateJsonLd()}
      />
    </>
  );
}
