"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/forms/form-field";
import {
  Layers,
  Wand2,
  Table,
  LayoutGrid,
  Plus,
  Trash2,
  Check,
  X,
  Pencil,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ExtendedVariantRow, VariantMatrixOptions } from "../../types/studio-types";
import { useVariantMatrix } from "../../hooks/use-variant-matrix";
import { VariantBulkEditModal } from "../modals/variant-bulk-edit-modal";
import { toast } from "sonner";

interface AttributeItem {
  id: string;
  name: string;
  values: string;
}

const DEFAULT_ATTRIBUTES: AttributeItem[] = [
  { id: "attr-color", name: "Color", values: "Black, White, Blue, Red" },
  { id: "attr-model", name: "Model", values: "Standard, Pro, Premium" },
  { id: "attr-size", name: "Size", values: "S, M, L, XL" },
  { id: "attr-capacity", name: "Capacity", values: "64GB, 128GB, 256GB" },
  { id: "attr-material", name: "Material", values: "Aluminum, Plastic, Stainless Steel" },
  { id: "attr-length", name: "Length", values: "1m, 2m, 3m, 5m" },
  { id: "attr-voltage", name: "Voltage", values: "5V, 12V, 24V, 220V" },
  { id: "attr-power", name: "Power", values: "10W, 20W, 30W, 65W, 100W" },
  { id: "attr-warranty", name: "Warranty", values: "6 Months, 1 Year, 2 Years" },
];

const AVAILABLE_DEFAULTS = DEFAULT_ATTRIBUTES;

const KNOWN_ATTR_MAP: Record<string, keyof VariantMatrixOptions> = {
  color: "colors",
  size: "sizes",
  storage: "storages",
  capacity: "storages",
  ram: "rams",
  memory: "rams",
  material: "materials",
  edition: "storages",
};

function mapAttributeName(name: string): string {
  const lower = name.toLowerCase().trim();
  // Check exact matches first
  if (lower === "color" || lower === "colour") return "Color";
  if (lower === "size") return "Size";
  if (lower === "storage" || lower === "capacity" || lower === "edition") return "StorageCapacity";
  if (lower === "ram" || lower === "memory") return "RAM";
  if (lower === "material") return "Material";
  return name;
}

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
  const [quickEntryOpen, setQuickEntryOpen] = React.useState(false);

  // Active Attributes
  const [activeAttrs, setActiveAttrs] = React.useState<AttributeItem[]>([
    { id: "attr-init-color", name: "Color", values: "Black, White" },
  ]);
  const [editingAttr, setEditingAttr] = React.useState<string | null>(null);
  const [editAttrName, setEditAttrName] = React.useState("");
  const [editAttrValues, setEditAttrValues] = React.useState("");
  const [customAttrName, setCustomAttrName] = React.useState("");
  const [customAttrValues, setCustomAttrValues] = React.useState("");

  // Quick Entry Inputs (fallback)
  const [colorInput, setColorInput] = React.useState("Black, White");
  const [storageInput, setStorageInput] = React.useState("");
  const [sizeInput, setSizeInput] = React.useState("");

  const { generateMatrix } = useVariantMatrix();

  const isAttrActive = React.useCallback(
    (attrName: string): boolean => {
      return activeAttrs.some((a) => a.name.toLowerCase() === attrName.toLowerCase());
    },
    [activeAttrs],
  );

  const handleAddDefaultAttr = (attr: AttributeItem) => {
    if (isAttrActive(attr.name)) {
      toast.message(`${attr.name} is already in the active list`);
      return;
    }
    const newAttr: AttributeItem = {
      id: `attr-${Date.now()}`,
      name: attr.name,
      values: attr.values,
    };
    setActiveAttrs([...activeAttrs, newAttr]);
    toast.success(`Added ${attr.name} attribute`);
  };

  const handleRemoveAttr = (id: string) => {
    setActiveAttrs(activeAttrs.filter((a) => a.id !== id));
  };

  const handleStartEditAttr = (attr: AttributeItem) => {
    setEditingAttr(attr.id);
    setEditAttrName(attr.name);
    setEditAttrValues(attr.values);
  };

  const handleSaveEditAttr = () => {
    if (!editingAttr || !editAttrName.trim()) return;
    setActiveAttrs(
      activeAttrs.map((a) =>
        a.id === editingAttr
          ? { ...a, name: editAttrName.trim(), values: editAttrValues.trim() }
          : a,
      ),
    );
    setEditingAttr(null);
  };

  const handleMoveAttr = (id: string, direction: "up" | "down") => {
    const idx = activeAttrs.findIndex((a) => a.id === id);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === activeAttrs.length - 1) return;
    const updated = [...activeAttrs];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setActiveAttrs(updated);
  };

  const handleAddCustomAttr = () => {
    if (!customAttrName.trim()) return;
    if (isAttrActive(customAttrName.trim())) {
      toast.message(`${customAttrName.trim()} is already in the active list`);
      return;
    }
    const newAttr: AttributeItem = {
      id: `attr-${Date.now()}`,
      name: customAttrName.trim(),
      values: customAttrValues.trim() || "Default",
    };
    setActiveAttrs([...activeAttrs, newAttr]);
    setCustomAttrName("");
    setCustomAttrValues("");
    toast.success(`Added custom attribute: ${newAttr.name}`);
  };

  const handleGenerateMatrix = () => {
    const options: VariantMatrixOptions = {
      colors: [],
      sizes: [],
      storages: [],
      rams: [],
      materials: [],
      dynamicAxes: [],
      baseSku: baseSku || "DS-PROD",
      basePrice,
      baseCost,
      baseStock: 15,
    };

    for (const attr of activeAttrs) {
      const values = attr.values
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (values.length === 0) continue;

      const lowerName = attr.name.toLowerCase().trim();
      if (lowerName === "color" || lowerName === "colour") {
        options.colors = values;
      } else if (lowerName === "size") {
        options.sizes = values;
      } else if (lowerName === "storage" || lowerName === "capacity" || lowerName === "edition") {
        options.storages = values;
      } else if (lowerName === "ram" || lowerName === "memory") {
        options.rams = values;
      } else if (lowerName === "material") {
        options.materials = values;
      } else {
        options.dynamicAxes?.push({ name: attr.name, values });
      }
    }

    const hasAnyAttr =
      options.colors.length > 0 ||
      options.sizes.length > 0 ||
      options.storages.length > 0 ||
      options.rams.length > 0 ||
      options.materials.length > 0 ||
      (options.dynamicAxes && options.dynamicAxes.length > 0);

    if (!hasAnyAttr) {
      toast.error("Add at least one attribute with values to generate variants");
      return;
    }

    const generated = generateMatrix(options);
    onChange(generated);
    toast.success(
      `Generated ${generated.length} variant combinations across ${activeAttrs.length} attributes!`,
    );
  };

  // Quick Entry fallback
  const handleQuickEntryGenerate = () => {
    const colors = colorInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const storages = storageInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const sizes = sizeInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

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
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
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

  const renderAttributeBadges = (v: ExtendedVariantRow) => {
    const badges: React.ReactNode[] = [];
    if (v.color)
      badges.push(
        <Badge key="color" variant="outline" size="xs">
          {v.color}
        </Badge>,
      );
    if (v.storage)
      badges.push(
        <Badge key="storage" variant="outline" size="xs">
          {v.storage}
        </Badge>,
      );
    if (v.size)
      badges.push(
        <Badge key="size" variant="outline" size="xs">
          {v.size}
        </Badge>,
      );
    if (v.ram)
      badges.push(
        <Badge key="ram" variant="outline" size="xs">
          {v.ram}
        </Badge>,
      );
    if (v.material)
      badges.push(
        <Badge key="material" variant="outline" size="xs">
          {v.material}
        </Badge>,
      );
    if (v.dynamicAttrs) {
      for (const [key, val] of Object.entries(v.dynamicAttrs)) {
        if (val)
          badges.push(
            <Badge key={key} variant="secondary" size="xs">
              {key}: {val}
            </Badge>,
          );
      }
    }
    if (badges.length === 0)
      badges.push(
        <span key="empty" className="text-muted-foreground">
          —
        </span>,
      );
    return badges;
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
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
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
                  viewMode === "card"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
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
          {/* Default Attribute Suggestions Card */}
          <div className="p-4 rounded-xl border border-primary/20 bg-accent/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Default Attribute Suggestions
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Click a suggestion to add it to active attributes
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_DEFAULTS.map((attr) => {
                const active = isAttrActive(attr.name);
                return (
                  <button
                    key={attr.id}
                    type="button"
                    onClick={() => !active && handleAddDefaultAttr(attr)}
                    disabled={active}
                    title={`${attr.name}: ${attr.values}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border",
                      active
                        ? "border-primary/30 bg-primary/10 text-primary cursor-default"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent cursor-pointer",
                    )}
                  >
                    {active ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {attr.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Attributes Manager */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" /> Active Attributes (
                {activeAttrs.length})
              </span>
              <span className="text-xs text-muted-foreground">
                These attributes are used for variant matrix generation
              </span>
            </div>

            {activeAttrs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                No active attributes. Click suggestions above or add custom attributes below.
              </p>
            ) : (
              <div className="space-y-1.5">
                {activeAttrs.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/20"
                  >
                    {editingAttr === attr.id ? (
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                        <Input
                          value={editAttrName}
                          onChange={(e) => setEditAttrName(e.target.value)}
                          className="h-8 text-xs font-bold w-24 sm:w-32"
                          placeholder="Name"
                        />
                        <Input
                          value={editAttrValues}
                          onChange={(e) => setEditAttrValues(e.target.value)}
                          className="h-8 text-xs font-mono flex-1 min-w-0"
                          placeholder="Value1, Value2, Value3"
                        />
                        <button
                          type="button"
                          onClick={handleSaveEditAttr}
                          className="p-1.5 text-primary hover:text-primary/80 shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAttr(null)}
                          className="p-1.5 text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMoveAttr(attr.id, "up")}
                          className="p-1 text-muted-foreground/50 hover:text-foreground"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAttr(attr.id, "down")}
                          className="p-1 text-muted-foreground/50 hover:text-foreground"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-foreground">{attr.name}</span>
                          <span className="text-[11px] text-muted-foreground ml-2 font-mono">
                            {attr.values}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartEditAttr(attr)}
                          className="p-1 text-muted-foreground/50 hover:text-muted-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttr(attr.id)}
                          className="p-1 text-muted-foreground/50 hover:text-destructive"
                          title="Remove"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Custom Attribute */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 pt-1 border-t border-border/50">
              <Input
                value={customAttrName}
                onChange={(e) => setCustomAttrName(e.target.value)}
                placeholder="Custom attribute name (e.g. Finish)"
                className="h-9 sm:h-7 w-full sm:w-44 text-xs"
              />
              <Input
                value={customAttrValues}
                onChange={(e) => setCustomAttrValues(e.target.value)}
                placeholder="Matte, Glossy, Textured"
                className="h-9 sm:h-7 flex-1 text-xs font-mono"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 sm:h-7 gap-1 text-xs font-semibold shrink-0"
                onClick={handleAddCustomAttr}
              >
                <Plus className="h-4 sm:h-3 w-4 sm:w-3" /> Add
              </Button>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end gap-2 pt-1 border-t border-border/50">
              <Button
                size="sm"
                className="gap-1.5 font-bold shadow-xs"
                onClick={handleGenerateMatrix}
              >
                <Wand2 className="h-3.5 w-3.5" /> Generate Combinations Matrix
              </Button>
            </div>
          </div>

          {/* Quick Entry (collapsible fallback) */}
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setQuickEntryOpen(!quickEntryOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                {quickEntryOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                Quick Entry (Legacy 3-field generator)
              </span>
            </button>
            {quickEntryOpen && (
              <div className="p-4 space-y-3">
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
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs font-semibold"
                    onClick={handleQuickEntryGenerate}
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Generate from Quick Entry
                  </Button>
                </div>
              </div>
            )}
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

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs font-semibold"
                  onClick={handleAddSingleVariant}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Variant
                </Button>
              </div>
            </div>
          )}

          {/* Variant Matrix Table View */}
          {viewMode === "table" ? (
            <div className="ws-scroll max-h-96 overflow-auto rounded-xl border border-border bg-card">
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
                        No variants generated yet. Use the Attribute Manager above or click Add
                        Variant.
                      </td>
                    </tr>
                  ) : (
                    variants.map((v) => {
                      const isSelected = selectedIds.includes(v.id);
                      return (
                        <tr
                          key={v.id}
                          className={cn(
                            "hover:bg-muted/40 transition-colors",
                            isSelected && "bg-accent/40",
                          )}
                        >
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
                              className="h-8 font-mono text-xs font-bold w-full min-w-28 sm:w-36"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">{renderAttributeBadges(v)}</div>
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={v.price}
                              onChange={(e) =>
                                handleUpdateVariant(v.id, {
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="h-8 font-mono text-xs font-bold w-full min-w-20 sm:w-24"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={v.stock}
                              onChange={(e) =>
                                handleUpdateVariant(v.id, { stock: parseInt(e.target.value) || 0 })
                              }
                              className="h-8 font-mono text-xs font-bold w-full min-w-16 sm:w-20"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={v.status}
                              onChange={(e) =>
                                handleUpdateVariant(v.id, { status: e.target.value as any })
                              }
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
                <div
                  key={v.id}
                  className="p-3 rounded-xl border border-border bg-card shadow-2xs space-y-2 relative group"
                >
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
                  <div className="flex flex-wrap gap-1">{renderAttributeBadges(v)}</div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold uppercase">
                        Price (৳)
                      </label>
                      <Input
                        type="number"
                        value={v.price}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, { price: parseFloat(e.target.value) || 0 })
                        }
                        className="h-7 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold uppercase">
                        Stock
                      </label>
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, { stock: parseInt(e.target.value) || 0 })
                        }
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
