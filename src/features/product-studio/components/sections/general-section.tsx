"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { QrCode, Wand2 } from "lucide-react";
import { QRCodeModal } from "../modals/qr-code-modal";

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
  stock?: string;
  onStockChange?: (v: string) => void;
  onAutoGenerateSKU?: () => void;
}

export function GeneralSection({
  name,
  onNameChange,
  sku,
  onSkuChange,
  shortDescription,
  onShortDescriptionChange,
  productModel,
  onProductModelChange,
  barcode,
  onBarcodeChange,
  stock,
  onStockChange,
  onAutoGenerateSKU,
}: GeneralSectionProps): React.ReactElement {
  const [qrOpen, setQrOpen] = React.useState(false);

  return (
    <>
      <StudioCollapsibleSection
        id="general"
        title="General Information"
        description="Basic product identity, SKU, barcodes, and pitch"
        defaultExpanded={true}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Title with Character Counter */}
          <FormField
            label="Product Title"
            required
            hint={`${name.length}/255 chars`}
            className="sm:col-span-2"
          >
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Premium Wireless Noise-Cancelling Headphones"
              maxLength={255}
              className="h-11 text-base font-semibold"
            />
          </FormField>

          {/* SKU Field with Auto Generation */}
          <FormField label="Base SKU" required hint="Master stock keeping unit">
            <div className="flex gap-2">
              <Input
                value={sku}
                onChange={(e) => onSkuChange(e.target.value)}
                placeholder="SKU-PROD-001"
                className="font-mono font-bold text-xs uppercase"
              />
              {onAutoGenerateSKU ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1 text-xs font-semibold"
                  onClick={onAutoGenerateSKU}
                  title="Auto generate SKU"
                >
                  <Wand2 className="h-3.5 w-3.5 text-primary" /> Auto
                </Button>
              ) : null}
            </div>
          </FormField>

          {/* Model Number */}
          <FormField label="Model / Part Number">
            <Input
              value={productModel}
              onChange={(e) => onProductModelChange(e.target.value)}
              placeholder="e.g. WH-1000XM5"
              className="font-mono text-xs"
            />
          </FormField>

          {/* Available Stock Quantity (Main Tab Quick Input) */}
          {onStockChange !== undefined && (
            <FormField label="Available Stock Quantity (Pcs)" required hint="Central warehouse stock count">
              <Input
                type="number"
                min={0}
                value={stock ?? "0"}
                onChange={(e) => onStockChange(e.target.value)}
                placeholder="100"
                className="font-mono font-bold text-xs"
              />
            </FormField>
          )}

          {/* Barcode / GTIN with QR Code Modal Trigger */}
          <FormField label="Barcode / GTIN / UPC">
            <div className="flex gap-2">
              <Input
                value={barcode}
                onChange={(e) => onBarcodeChange(e.target.value)}
                placeholder="e.g. 190199223344"
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1 text-xs font-semibold"
                onClick={() => setQrOpen(true)}
                title="View QR & Barcode"
              >
                <QrCode className="h-3.5 w-3.5 text-primary" /> Label
              </Button>
            </div>
          </FormField>

          {/* Short Pitch Description */}
          <FormField
            label="Short Summary Pitch"
            hint={`${shortDescription.length}/500 chars`}
            className="sm:col-span-2"
          >
            <Textarea
              value={shortDescription}
              onChange={(e) => onShortDescriptionChange(e.target.value)}
              placeholder="Brief summary sentence used for store cards, search results, and marketplaces..."
              rows={2}
              maxLength={500}
            />
          </FormField>
        </div>
      </StudioCollapsibleSection>

      <QRCodeModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        productName={name}
        sku={sku}
        barcode={barcode}
      />
    </>
  );
}
