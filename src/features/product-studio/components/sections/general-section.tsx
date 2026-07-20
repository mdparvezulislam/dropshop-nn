"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { FormField } from "@/shared/components/forms/form-field";
import { StudioSection } from "../studio-layout";

export interface GeneralSectionProps {
  name: string;
  onNameChange: (v: string) => void;
  sku: string;
  onSkuChange: (v: string) => void;
  shortDescription: string;
  onShortDescriptionChange: (v: string) => void;
  productModel: string;
  onProductModelChange: (v: string) => void;
  barcode: string;
  onBarcodeChange: (v: string) => void;
}

export function GeneralSection({
  name, onNameChange,
  sku, onSkuChange,
  shortDescription, onShortDescriptionChange,
  productModel, onProductModelChange,
  barcode, onBarcodeChange,
}: GeneralSectionProps): React.ReactElement {
  return (
    <StudioSection id="general" title="General Information" description="Basic product details for catalog listings">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Product title" required className="sm:col-span-2">
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. iPhone 16 Pro Max 256GB"
            className="h-11 text-base font-medium"
          />
        </FormField>
        <FormField label="Base SKU" required>
          <Input
            value={sku}
            onChange={(e) => onSkuChange(e.target.value)}
            placeholder="APL-IPH16PM-256"
            className="font-mono"
          />
        </FormField>
        <FormField label="Model">
          <Input
            value={productModel}
            onChange={(e) => onProductModelChange(e.target.value)}
            placeholder="A3296"
          />
        </FormField>
        <FormField label="Barcode / GTIN">
          <Input
            value={barcode}
            onChange={(e) => onBarcodeChange(e.target.value)}
            placeholder="UPC / EAN"
            className="font-mono"
          />
        </FormField>
        <FormField label="Short description" className="sm:col-span-2">
          <Textarea
            value={shortDescription}
            onChange={(e) => onShortDescriptionChange(e.target.value)}
            placeholder="One-line pitch for listings and cards (max 500 chars)"
            rows={2}
          />
        </FormField>
      </div>
    </StudioSection>
  );
}
