"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { StatusChip, statusToneFromValue } from "@/shared/components/workspace/status-chip";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Send, Eye, Clock, History, FileText, RefreshCw } from "lucide-react";
import type { SaveState } from "../../hooks/use-autosave";

export interface StudioRightSidebarProps {
  status: string;
  visibility: string;
  onVisibilityChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPublish: () => void;
  onSave: () => void;
  onPreview: () => void;
  saving: boolean;
  saveState: SaveState;
  productName: string;
  productSku: string;
  sections: { id: string; label: string }[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}

export function StudioRightSidebar({
  status, visibility, onVisibilityChange,
  onPublish, onSave, onPreview,
  saving, saveState,
  productName, productSku,
  sections, activeSection, onSectionClick,
}: StudioRightSidebarProps): React.ReactElement {
  return (
    <>
      {/* Publishing */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <StatusChip label={status} tone={statusToneFromValue(status)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => onVisibilityChange(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-card px-2 text-xs"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="hidden">Hidden</option>
              <option value="supplier_only">Supplier only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button size="sm" className="w-full justify-start" onClick={onSave} disabled={saving}>
            <RefreshCw className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`} />
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save changes"}
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={onPublish} disabled={saving || status === "active"}>
            <Send className="h-3.5 w-3.5" />
            {status === "active" ? "Published" : "Publish"}
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={onPreview}>
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
        </CardContent>
      </Card>

      {/* Quick Preview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold line-clamp-2">{productName || "Product title"}</p>
              {productSku ? (
                <p className="text-[11px] font-mono text-muted-foreground">{productSku}</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-3.5 w-3.5" /> Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="text-[10px] text-muted-foreground/60">—</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Last modified</p>
                <p className="text-[10px] text-muted-foreground/60">Just now</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jump to */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
          Sections
        </p>
        <div className="space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSectionClick(s.id)}
              className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                activeSection === s.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
