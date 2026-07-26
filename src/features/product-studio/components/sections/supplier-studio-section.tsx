"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/forms/currency-input";

export interface SupplierStudioSectionProps {
  supplierId?: string;
  onSupplierIdChange?: (v: string) => void;
  supplierSku?: string;
  onSupplierSkuChange?: (v: string) => void;
  supplierCost?: string;
  onSupplierCostChange?: (v: string) => void;
  leadTimeDays?: string;
  onLeadTimeDaysChange?: (v: string) => void;
  purchaseLink?: string;
  onPurchaseLinkChange?: (v: string) => void;
  supplierNotes?: string;
  onSupplierNotesChange?: (v: string) => void;
}

export function SupplierStudioSection({
  supplierSku = "",
  onSupplierSkuChange,
  supplierCost = "",
  onSupplierCostChange,
  leadTimeDays = "3",
  onLeadTimeDaysChange,
  purchaseLink = "",
  onPurchaseLinkChange,
  supplierNotes = "",
  onSupplierNotesChange,
}: SupplierStudioSectionProps): React.ReactElement {
  return (
    <StudioCollapsibleSection
      id="supplier"
      title="Supplier & Sourcing Intelligence"
      description="Supplier mapping, purchasing lead times, supplier cost, and procurement links"
      defaultExpanded={true}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Supplier Part / SKU">
          <Input
            value={supplierSku}
            onChange={(e) => onSupplierSkuChange && onSupplierSkuChange(e.target.value)}
            placeholder="SUP-PART-9921"
            className="font-mono text-xs"
          />
        </FormField>
        <FormField label="Supplier Cost Price">
          <CurrencyInput
            value={supplierCost}
            onChange={(v) => onSupplierCostChange && onSupplierCostChange(v)}
            currency="৳"
          />
        </FormField>
        <FormField label="Fulfillment Lead Time (Days)">
          <Input
            type="number"
            value={leadTimeDays}
            onChange={(e) => onLeadTimeDaysChange && onLeadTimeDaysChange(e.target.value)}
            placeholder="3"
            className="font-mono text-xs font-bold"
          />
        </FormField>
        <FormField label="Supplier Procurement Link">
          <Input
            value={purchaseLink}
            onChange={(e) => onPurchaseLinkChange && onPurchaseLinkChange(e.target.value)}
            placeholder="https://supplier-portal.com/item/123"
            className="font-mono text-xs"
          />
        </FormField>
        <FormField label="Internal Procurement Notes" className="sm:col-span-2">
          <Textarea
            value={supplierNotes}
            onChange={(e) => onSupplierNotesChange && onSupplierNotesChange(e.target.value)}
            placeholder="Internal notes regarding MOQ, supplier contact person, or reorder terms..."
            rows={2}
          />
        </FormField>
      </div>
    </StudioCollapsibleSection>
  );
}
