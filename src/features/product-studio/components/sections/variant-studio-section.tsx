"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { FormField } from "@/shared/components/forms/form-field";
import {
  Layers,
  Wand2,
  Table,
  LayoutGrid,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { ExtendedVariantRow, VariantMatrixOptions } from "../../types/studio-types";
import { useVariantMatrix } from "../../hooks/use-variant-matrix";
import { VariantBulkEditModal } from "../modals/variant-bulk-edit-modal";
import { toast } from "sonner";

export interface VariantStudioSectionProps {
  variants: ExtendedVariantRow[];
  onChange: (variants: ExtendedVariantRow[]) => void;
  baseSku: string;
  basePrice?: number;
  baseCost?: number;
}

export function VariantStudioSection({
  variants,
  onChange,
  baseSku,
  basePrice = 1200,
  baseCost = 800,
}: VariantStudioSectionProps): React.ReactElement {
  const [viewMode, setViewMode] = React.useState<"table" | "card">("table");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = React.useState(false);

  // Auto Matrix Generator Inputs (Gadget-focused)
  const [colorInput, setColorInput] = React.useState("Black, White");
  const [storageInput, setStorageInput] = React.useState("");
  const [sizeInput, setSizeInput] = React.useState("");

  const { generateMatrix } = useVariantMatrix();

  const handleGenerateMatrix = () => {
    const colors = colorInput.split(",").map((s) => s.trim()).filter(Boolean);
    const storages = storageInput.split(",").map((s) => s.trim()).filter(Boolean);
    const sizes = sizeInput.split(",").map((s) => s.trim()).filter(Boolean);

    if (colors.length === 0 && storages.length === 0 && sizes.length === 0) {
      toast.error("Enter at least one color, edition, or size option");
      return;
    }

    const options: VariantMatrixOptions = {
      colors,
      storages,
      sizes,
      rams: [],
      materials: [],
      baseSku: baseSku || "DS-PROD",
      basePrice,
      baseCost,
      baseStock: 15,
    };

    const generated = generateMatrix(options);
    onChange(generated);
    toast.success(`Generated ${generated.length} gadget variant combinations!`);
  };

  const handleAddSingleVariant = () => {
    const newVar: ExtendedVariantRow = {
      id: `v-${Date.now()}`,
      sku: `${baseSku || "DS-PROD"}-VAR-${variants.length + 1}`,
      price: basePrice,
      costPrice: baseCost,
      stock: 10,
      status: "active",
      visibility: "public",
    };
    onChange([...variants, newVar]);
  };

  const handleUpdateVariant = (id: string, partial: Partial<ExtendedVariantRow>) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...partial } : v)));
  };

  const handleDeleteVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === variants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(variants.map((v) => v.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleApplyBulkChanges = (changes: {
    price?: number;
    stock?: number;
    status?: "active" | "draft" | "disabled";
  }) => {
    onChange(
      variants.map((v) => {
        if (!selectedIds.includes(v.id)) return v;
        return {
          ...v,
          ...(changes.price !== undefined ? { price: changes.price } : {}),
          ...(changes.stock !== undefined ? { stock: changes.stock } : {}),
          ...(changes.status ? { status: changes.status } : {}),
        };
      }),
    );
  };

  return (
    <>
      <StudioCollapsibleSection
        id="variants"
        title={`Variant Studio Matrix (${variants.length})`}
        description="Automated Cartesian combination generator, bulk price/stock editor, and dense matrix table"
        defaultExpanded={true}
        badge={
          variants.length > 0 ? (
            <Badge variant="secondary" size="xs" className="font-bold">
              {variants.length} Variants
            </Badge>
          ) : null
        }
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "rounded-md p-1 text-xs font-semibold transition-all",
                  viewMode === "table" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
                )}
                title="Table Matrix View"
              >
                <Table className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={cn(
                  "rounded-md p-1 text-xs font-semibold transition-all",
                  viewMode === "card" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
                )}
                title="Card Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Auto Variant Combination Generator Card */}
          <div className="p-4 rounded-xl border border-primary/30 bg-accent/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-primary" /> Auto Variant Combination Generator
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">e.g. 2 Colors x 2 Editions = 4 Gadget Variants</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="Color Options">
                <Input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="Black, White, Blue"
                  className="font-mono text-xs"
                />
              </FormField>
              <FormField label="Edition / Model Type">
                <Input
                  value={storageInput}
                  onChange={(e) => setStorageInput(e.target.value)}
                  placeholder="Standard, Pro Edition"
                  className="font-mono text-xs"
                />
              </FormField>
              <FormField label="Size / Dimension Options">
                <Input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="Compact, Large"
                  className="font-mono text-xs"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" className="gap-1.5 font-bold shadow-xs" onClick={handleGenerateMatrix}>
                <Wand2 className="h-3.5 w-3.5" /> Generate Combinations Matrix
              </Button>
            </div>
          </div>

          {/* Bulk Tools Bar */}
          {variants.length > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length === variants.length && variants.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-foreground">
                  {selectedIds.length} of {variants.length} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedIds.length > 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs font-semibold"
                    onClick={() => setBulkModalOpen(true)}
                  >
                    <Layers className="h-3.5 w-3.5 text-primary" /> Bulk Edit ({selectedIds.length})
                  </Button>
                ) : null}

                <Button size="sm" variant="outline" className="gap-1 text-xs font-semibold" onClick={handleAddSingleVariant}>
                  <Plus className="h-3.5 w-3.5" /> Add Variant
                </Button>
              </div>
            </div>
          )}

          {/* Variant Matrix Table View */}
          {viewMode === "table" ? (
            <div className="ws-scroll max-h-96 overflow-y-auto rounded-xl border border-border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur-xs border-b border-border font-bold text-muted-foreground">
                  <tr>
                    <th className="p-3 w-8"></th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Attributes</th>
                    <th className="p-3">Retail (৳)</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {variants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">
                        No variants generated yet. Use the Auto Generator above or click Add Variant.
                      </td>
                    </tr>
                  ) : (
                    variants.map((v) => {
                      const isSelected = selectedIds.includes(v.id);
                      return (
                        <tr key={v.id} className={cn("hover:bg-muted/40 transition-colors", isSelected && "bg-accent/40")}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(v.id)}
                              className="h-3.5 w-3.5 rounded border-border text-primary"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={v.sku}
                              onChange={(e) => handleUpdateVariant(v.id, { sku: e.target.value })}
                              className="h-8 font-mono text-xs font-bold w-36"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {v.color ? <Badge variant="outline" size="xs">{v.color}</Badge> : null}
                              {v.storage ? <Badge variant="outline" size="xs">{v.storage}</Badge> : null}
                              {v.size ? <Badge variant="outline" size="xs">{v.size}</Badge> : null}
                              {!v.color && !v.storage && !v.size ? <span className="text-muted-foreground">—</span> : null}
                            </div>
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={v.price}
                              onChange={(e) => handleUpdateVariant(v.id, { price: parseFloat(e.target.value) || 0 })}
                              className="h-8 font-mono text-xs font-bold w-24"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={v.stock}
                              onChange={(e) => handleUpdateVariant(v.id, { stock: parseInt(e.target.value) || 0 })}
                              className="h-8 font-mono text-xs font-bold w-20"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={v.status}
                              onChange={(e) => handleUpdateVariant(v.id, { status: e.target.value as any })}
                              className="h-8 rounded-lg border border-border bg-card px-2 text-[11px] font-semibold"
                            >
                              <option value="active">Active</option>
                              <option value="draft">Draft</option>
                              <option value="disabled">Disabled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(v.id)}
                              className="p-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete variant"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {variants.map((v) => (
                <div key={v.id} className="p-3 rounded-xl border border-border bg-card shadow-2xs space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs truncate">{v.sku}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(v.id)}
                      className="text-destructive hover:text-destructive/80 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {v.color ? <Badge variant="secondary" size="xs">{v.color}</Badge> : null}
                    {v.storage ? <Badge variant="secondary" size="xs">{v.storage}</Badge> : null}
                    {v.size ? <Badge variant="secondary" size="xs">{v.size}</Badge> : null}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold uppercase">Price (৳)</label>
                      <Input
                        type="number"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(v.id, { price: parseFloat(e.target.value) || 0 })}
                        className="h-7 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold uppercase">Stock</label>
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(v.id, { stock: parseInt(e.target.value) || 0 })}
                        className="h-7 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </StudioCollapsibleSection>

      <VariantBulkEditModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        selectedCount={selectedIds.length}
        onApplyBulkEdit={handleApplyBulkChanges}
      />
    </>
  );
}
