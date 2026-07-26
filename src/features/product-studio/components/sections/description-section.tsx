"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { StudioSection } from "../studio-layout";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const RichTextEditor = dynamic(
  () => import("@/components/editor/rich-text-editor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false },
);

export interface DescriptionSectionProps {
  value: string;
  onChange: (v: string) => void;
  onMagicParse?: (textToParse?: string) => void;
}

export function DescriptionSection({
  value,
  onChange,
  onMagicParse,
}: DescriptionSectionProps): React.ReactElement {
  return (
    <StudioSection
      id="description"
      title="Description"
      description="Rich product story with formatting and media"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 dark:bg-amber-950/20">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-amber-500">Pro Tip:</span> Paste raw HTML or
            supplier product text here, then click{" "}
            <strong className="text-foreground">Magic Parse</strong> to auto-extract Title,
            Specifications, SEO Meta, and Tags!
          </div>
          {onMagicParse ? (
            <Button
              type="button"
              size="sm"
              className="shrink-0 gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs transition-all hover:scale-102 active:scale-98"
              onClick={() => onMagicParse?.(value)}
              title="Auto-extract Title, Specs, SEO Meta, and Tags using SmartParser"
            >
              <Sparkles className="h-4 w-4 fill-slate-950" />⚡ Magic Parse
            </Button>
          ) : null}
        </div>

        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder="Write or paste supplier product text/HTML here (e.g., Specs: RAM 8GB, Display: 6.5 inches...)"
          minHeight="18rem"
        />
      </div>
    </StudioSection>
  );
}
