"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { Badge } from "@/components/ui/badge";
import { StudioSection } from "../studio-layout";
import { Plus, Trash2, Dice5 } from "lucide-react";

export interface VariantRow {
  id: string;
  color: string;
  size: string;
  storage: string;
  ram: string;
  capacity: string;
  material: string;
  sku: string;
  weight?: number;
  price?: number;
  stock?: number;
}

export interface VariantsSectionProps {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
  baseSku?: string;
}

const GENERATOR_OPTIONS = {
  colors: ["Black", "White", "Red", "Blue", "Green", "Gold", "Silver", "Purple", "Pink", "Graphite"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  storages: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  rams: ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"],
  capacities: ["250ml", "500ml", "1L", "2L", "5L"],
  materials: ["Leather", "Fabric", "Plastic", "Metal", "Wood", "Glass", "Carbon Fiber"],
};

export function VariantsSection({ variants, onChange, baseSku }: VariantsSectionProps): React.ReactElement {
  const generateId = () => `v${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const addVariant = () => {
    onChange([
      ...variants,
      {
        id: generateId(),
        color: "", size: "", storage: "", ram: "", capacity: "", material: "",
        sku: baseSku ? `${baseSku}-${variants.length + 1}` : "",
      },
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) return;
    onChange(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof VariantRow, value: string | number) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const openGenerator = () => {
    const color = GENERATOR_OPTIONS.colors[Math.floor(Math.random() * GENERATOR_OPTIONS.colors.length)];
    const size = GENERATOR_OPTIONS.sizes[Math.floor(Math.random() * GENERATOR_OPTIONS.sizes.length)];
    const storage = GENERATOR_OPTIONS.storages[Math.floor(Math.random() * GENERATOR_OPTIONS.storages.length)];
    const ram = GENERATOR_OPTIONS.rams[Math.floor(Math.random() * GENERATOR_OPTIONS.rams.length)];

    const newVariant: VariantRow = {
      id: generateId(),
      color, size, storage, ram, capacity: "", material: "",
      sku: baseSku ? `${baseSku}-${variants.length + 1}` : `VAR-${variants.length + 1}`,
    };
    onChange([...variants, newVariant]);
  };

  const activeCount = variants.filter((v) => v.sku.trim()).length;

  return (
    <StudioSection
      id="variants"
      title={`Variants (${activeCount})`}
      description="Product variations by color, size, storage, and more"
    >
      <div className="flex items-center gap-2 mb-2">
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="h-3.5 w-3.5" /> Add variant
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={openGenerator}>
          <Dice5 className="h-3.5 w-3.5" /> Generate
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No variants yet. Add at least one variant to create a product.
        </p>
      ) : (
        <div className="space-y-2">
          {variants.map((v, idx) => (
            <div
              key={v.id}
              className="grid gap-2 rounded-lg border border-border p-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
            >
              <FormField label="Color">
                <Input
                  value={v.color}
                  onChange={(e) => updateVariant(v.id, "color", e.target.value)}
                  placeholder="Black"
                />
              </FormField>
              <FormField label="Size">
                <Input
                  value={v.size}
                  onChange={(e) => updateVariant(v.id, "size", e.target.value)}
                  placeholder="M"
                />
              </FormField>
              <FormField label="Storage">
                <Input
                  value={v.storage}
                  onChange={(e) => updateVariant(v.id, "storage", e.target.value)}
                  placeholder="256GB"
                />
              </FormField>
              <FormField label="RAM">
                <Input
                  value={v.ram}
                  onChange={(e) => updateVariant(v.id, "ram", e.target.value)}
                  placeholder="8GB"
                />
              </FormField>
              <FormField label="Material">
                <Input
                  value={v.material}
                  onChange={(e) => updateVariant(v.id, "material", e.target.value)}
                  placeholder="Leather"
                />
              </FormField>
              <FormField label="SKU" required>
                <Input
                  value={v.sku}
                  onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                  className="font-mono"
                />
              </FormField>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={variants.length <= 1}
                  onClick={() => removeVariant(v.id)}
                  aria-label="Remove variant"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudioSection>
  );
}
