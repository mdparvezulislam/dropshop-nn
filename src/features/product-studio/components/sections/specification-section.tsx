"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { FormField } from "@/shared/components/forms/form-field";
import { Badge } from "@/shared/components/ui/badge";
import { SlidersHorizontal, Plus, Trash2, Check, Sparkles } from "lucide-react";
import type { SpecificationField } from "../../types/studio-types";
import { useCategorySpecifications } from "../../hooks/use-category-specifications";

export interface SpecificationSectionProps {
  categoryName?: string;
  specs?: SpecificationField[];
  onSpecsChange?: (specs: SpecificationField[]) => void;
}

export function SpecificationSection({
  categoryName,
  specs,
  onSpecsChange,
}: SpecificationSectionProps): React.ReactElement {
  const { template } = useCategorySpecifications(undefined, categoryName);
  const currentSpecs = specs && specs.length > 0 ? specs : template;

  const handleFieldValueChange = (key: string, val: any) => {
    const updated = currentSpecs.map((s) => (s.key === key ? { ...s, value: val } : s));
    if (onSpecsChange) onSpecsChange(updated);
  };

  const handleAddCustomField = () => {
    const newField: SpecificationField = {
      key: `custom_${Date.now()}`,
      label: "Custom Spec Property",
      type: "text",
      value: "",
    };
    if (onSpecsChange) onSpecsChange([...currentSpecs, newField]);
  };

  const handleRemoveField = (key: string) => {
    if (onSpecsChange) onSpecsChange(currentSpecs.filter((s) => s.key !== key));
  };

  return (
    <StudioCollapsibleSection
      id="specifications"
      title="Dynamic Specifications & Attributes"
      description="Category-driven product specifications, technical attributes, and filters"
      defaultExpanded={true}
      action={
        <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs font-semibold" onClick={handleAddCustomField}>
          <Plus className="h-3.5 w-3.5" /> Add Attribute
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {currentSpecs.map((field) => (
          <div key={field.key} className="space-y-1.5 p-3 rounded-xl border border-border bg-card shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">{field.label}</label>
              <button
                type="button"
                onClick={() => handleRemoveField(field.key)}
                className="text-muted-foreground hover:text-destructive p-0.5"
                title="Remove attribute"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>

            {field.type === "select" && field.options ? (
              <select
                value={String(field.value)}
                onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                className="h-8.5 w-full rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "boolean" ? (
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleFieldValueChange(field.key, !field.value)}
                  className={`h-7 px-3 rounded-lg text-xs font-bold transition-all border ${
                    field.value ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {field.value ? "Yes / Supported" : "No / N/A"}
                </button>
              </div>
            ) : field.type === "number" ? (
              <Input
                type="number"
                value={String(field.value)}
                onChange={(e) => handleFieldValueChange(field.key, parseFloat(e.target.value) || 0)}
                className="h-8.5 font-mono text-xs font-bold"
              />
            ) : (
              <Input
                type="text"
                value={String(field.value)}
                onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                className="h-8.5 text-xs font-medium"
              />
            )}
          </div>
        ))}
      </div>
    </StudioCollapsibleSection>
  );
}
