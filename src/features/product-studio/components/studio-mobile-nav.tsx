"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface StudioMobileNavProps {
  currentSectionIndex: number;
  totalSections: number;
  onPrevSection: () => void;
  onNextSection: () => void;
  onSave: () => void;
  onPublish: () => void;
  saving: boolean;
  status: string;
}

export function StudioMobileNav({
  currentSectionIndex,
  totalSections,
  onPrevSection,
  onNextSection,
  onSave,
  onPublish,
  saving,
  status,
}: StudioMobileNavProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-2.5 text-xs font-semibold"
          onClick={onPrevSection}
          disabled={currentSectionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="text-[11px] font-mono text-muted-foreground px-1">
          {currentSectionIndex + 1}/{totalSections}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-2.5 text-xs font-semibold"
          onClick={onNextSection}
          disabled={currentSectionIndex === totalSections - 1}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-semibold"
          onClick={onSave}
          disabled={saving}
        >
          <Save className="h-3.5 w-3.5 text-primary" /> Save
        </Button>

        <Button
          size="sm"
          className="h-9 px-3 text-xs font-extrabold shadow-sm"
          onClick={onPublish}
          disabled={saving || status === "active"}
        >
          <Send className="h-3.5 w-3.5" /> Publish
        </Button>
      </div>
    </div>
  );
}
