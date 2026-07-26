"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wand2,
  BatteryCharging,
  Volume2,
  Headphones,
  Wifi,
  Fan,
  Check,
} from "lucide-react";
import { PRODUCT_TEMPLATES, type ProductTemplate } from "../../data/product-templates-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export interface StudioTemplateSelectorProps {
  onApplyTemplate: (template: ProductTemplate) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BatteryCharging,
  Volume2,
  Headphones,
  Wifi,
  Fan,
};

export function StudioTemplateSelector({
  onApplyTemplate,
}: StudioTemplateSelectorProps): React.ReactElement {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleSelect = (template: ProductTemplate) => {
    setSelectedId(template.id);
    onApplyTemplate(template);
    toast.success(`Applied template: ${template.name} (${template.nameBangla})`);
  };

  return (
    <div className="p-4 rounded-2xl border border-primary/30 bg-accent/30 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
            ১-ক্লিক প্রোডাক্ট টেমপ্লেট (1-Click Product Template Presets)
          </span>
        </div>
        <Badge variant="secondary" size="xs" className="font-bold">
          Gadgets & Electronics
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground font-medium">
        Select a product template to automatically pre-populate specifications, pricing rules, tags,
        and bullet features.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
        {PRODUCT_TEMPLATES.map((tmpl) => {
          const Icon = ICON_MAP[tmpl.iconName] || Wand2;
          const isSelected = selectedId === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleSelect(tmpl)}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground font-bold shadow-2xs"
                  : "border-border/80 bg-card text-foreground hover:border-primary/50 hover:bg-muted/40",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                  isSelected
                    ? "bg-primary-foreground/20 border-white/20"
                    : "bg-muted/60 border-border",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold truncate">{tmpl.nameBangla}</p>
                <p className="text-[10px] opacity-75 truncate">{tmpl.name}</p>
              </div>
              {isSelected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
