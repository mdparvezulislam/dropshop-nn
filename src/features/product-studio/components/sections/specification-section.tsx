"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { Badge } from "@/components/ui/badge";
import {
  SlidersHorizontal, Plus, Trash2, Check, Sparkles,
  ChevronDown, ChevronRight, Pencil, ArrowUp, ArrowDown,
} from "lucide-react";
import type { SpecificationField } from "../../types/studio-types";
import { useCategorySpecifications } from "../../hooks/use-category-specifications";

export interface SpecificationSectionProps {
  categoryName?: string;
  specs?: SpecificationField[];
  onSpecsChange?: (specs: SpecificationField[]) => void;
}

const GROUPS = [
  "Technical Specs",
  "Physical Specs",
  "General",
  "Performance",
  "Connectivity",
  "Compatibility",
  "Packaging",
];

interface SpecWithGroup extends SpecificationField {
  group: string;
}

function groupSpecs(specs: SpecWithGroup[]): Record<string, SpecWithGroup[]> {
  const groups: Record<string, SpecWithGroup[]> = {};
  for (const spec of specs) {
    const g = spec.group || "General";
    if (!groups[g]) groups[g] = [];
    groups[g].push(spec);
  }
  return groups;
}

export function SpecificationSection({
  categoryName,
  specs,
  onSpecsChange,
}: SpecificationSectionProps): React.ReactElement {
  const { template } = useCategorySpecifications(undefined, categoryName);
  const currentSpecs = React.useMemo(() => {
    return specs && specs.length > 0 ? specs : template;
  }, [specs, template]);

  const [localSpecs, setLocalSpecs] = React.useState<SpecWithGroup[]>([]);
  const [editingLabel, setEditingLabel] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());
  const [addingAttribute, setAddingAttribute] = React.useState(false);
  const [newAttrGroup, setNewAttrGroup] = React.useState("General");
  const [newAttrLabel, setNewAttrLabel] = React.useState("");
  const [newAttrType, setNewAttrType] = React.useState<"text" | "number" | "boolean" | "select">("text");

  React.useEffect(() => {
    setLocalSpecs(
      currentSpecs.map((s) => ({ ...s, group: (s as SpecWithGroup).group || "General" })),
    );
  }, [currentSpecs]);

  const emitChange = React.useCallback((updated: SpecWithGroup[]) => {
    setLocalSpecs(updated);
    if (onSpecsChange) onSpecsChange(updated);
  }, [onSpecsChange]);

  const handleFieldValueChange = (key: string, val: string | number | boolean | string[]) => {
    const updated = localSpecs.map((s) => (s.key === key ? { ...s, value: val } : s));
    emitChange(updated);
  };

  const handleAddCustomField = () => {
    setNewAttrLabel("Custom Spec Property");
    setNewAttrGroup("General");
    setNewAttrType("text");
    setAddingAttribute(true);
  };

  const handleConfirmAdd = () => {
    if (!newAttrLabel.trim()) return;
    const newField: SpecWithGroup = {
      key: `custom_${Date.now()}`,
      label: newAttrLabel.trim(),
      type: newAttrType,
      value: newAttrType === "boolean" ? false : "",
      group: newAttrGroup,
    };
    emitChange([...localSpecs, newField]);
    setAddingAttribute(false);
    setNewAttrLabel("");
  };

  const handleRemoveField = (key: string) => {
    emitChange(localSpecs.filter((s) => s.key !== key));
  };

  const handleStartRename = (key: string, currentLabel: string) => {
    setEditingLabel(key);
    setEditValue(currentLabel);
  };

  const handleFinishRename = (key: string) => {
    if (!editValue.trim()) {
      setEditingLabel(null);
      return;
    }
    const updated = localSpecs.map((s) =>
      s.key === key ? { ...s, label: editValue.trim() } : s,
    );
    emitChange(updated);
    setEditingLabel(null);
  };

  const handleMove = (key: string, direction: "up" | "down") => {
    const idx = localSpecs.findIndex((s) => s.key === key);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === localSpecs.length - 1) return;
    const updated = [...localSpecs];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    emitChange(updated);
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const grouped = groupSpecs(localSpecs);
  const groupNames = Object.keys(grouped).sort();

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
      <div className="space-y-4">
        {/* Add Attribute Popup */}
        {addingAttribute && (
          <div className="p-4 rounded-xl border border-primary/30 bg-accent/30 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-primary" /> New Attribute
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="Label">
                <Input
                  value={newAttrLabel}
                  onChange={(e) => setNewAttrLabel(e.target.value)}
                  placeholder="e.g. Screen Size"
                  className="text-xs"
                />
              </FormField>
              <FormField label="Type">
                <select
                  value={newAttrType}
                  onChange={(e) => setNewAttrType(e.target.value as any)}
                  className="h-8.5 w-full rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="select">Select</option>
                </select>
              </FormField>
              <FormField label="Group">
                <select
                  value={newAttrGroup}
                  onChange={(e) => setNewAttrGroup(e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground"
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => setAddingAttribute(false)}>Cancel</Button>
              <Button size="sm" className="gap-1" onClick={handleConfirmAdd}>
                <Check className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
        )}

        {/* Specs by Group */}
        {groupNames.map((group) => {
          const specsInGroup = grouped[group];
          const isCollapsed = collapsedGroups.has(group);
          return (
            <div key={group} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="flex items-center justify-between w-full px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">{group}</span>
                  <Badge variant="secondary" size="xs">{specsInGroup.length}</Badge>
                </div>
              </button>
              {!isCollapsed && (
                <div className="grid gap-3 sm:grid-cols-2 p-4">
                  {specsInGroup.map((field, fieldIndex) => (
                    <div key={field.key} className="space-y-1.5 p-3 rounded-xl border border-border bg-card shadow-2xs relative group">
                      <div className="flex items-center justify-between">
                        {editingLabel === field.key ? (
                          <div className="flex items-center gap-1 flex-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleFinishRename(field.key); if (e.key === "Escape") setEditingLabel(null); }}
                              className="h-7 text-xs font-bold"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleFinishRename(field.key)}
                              className="p-1 text-primary hover:text-primary/80"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <label className="text-xs font-bold text-foreground truncate">{field.label}</label>
                            <button
                              type="button"
                              onClick={() => handleStartRename(field.key, field.label)}
                              className="p-0.5 text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              title="Rename"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMove(field.key, "up")}
                            className="p-0.5 text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Move up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(field.key, "down")}
                            className="p-0.5 text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(field.key)}
                            className="p-0.5 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove attribute"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {field.type === "select" && field.options ? (
                        <select
                          value={String(field.value)}
                          onChange={(e) => handleFieldValueChange(field.key, e.target.value)}
                          className="h-8.5 w-full rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        >
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
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
              )}
            </div>
          );
        })}
      </div>
    </StudioCollapsibleSection>
  );
}
