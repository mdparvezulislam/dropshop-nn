"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip, statusToneFromValue } from "@/components/workspace/status-chip";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Eye,
  RefreshCw,
  Globe,
  Activity,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Share2,
} from "lucide-react";
import type { SaveState } from "../../hooks/use-autosave";
import type { HealthScoreResult } from "../../types/studio-types";
import { toast } from "sonner";

export interface StudioRightSidebarProps {
  status: string;
  visibility: string;
  onVisibilityChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPublish: () => void;
  onSave: () => void;
  onPreview: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  saving: boolean;
  saveState: SaveState;
  productName: string;
  productSku: string;
  healthResult?: HealthScoreResult;
  sections: { id: string; label: string }[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}

export function StudioRightSidebar({
  status, visibility, onVisibilityChange,
  onPublish, onSave, onPreview, onDuplicate, onDelete,
  saving, saveState,
  productName, productSku,
  healthResult,
  sections, activeSection, onSectionClick,
}: StudioRightSidebarProps): React.ReactElement {
  const score = healthResult?.score ?? 0;
  const scoreColor =
    score >= 80
      ? "text-success bg-success/15 border-success/30"
      : score >= 50
      ? "text-warning bg-warning/15 border-warning/30"
      : "text-destructive bg-destructive/15 border-destructive/30";

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/products/${productSku || "item"}`;
    navigator.clipboard.writeText(url);
    toast.success("Product URL copied to clipboard");
  };

  return (
    <>
      {/* Product Health Score Gauge */}
      {healthResult ? (
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary" /> Product Health
              </span>
              <span className={`px-2 py-0.5 rounded-full border font-mono font-extrabold text-xs ${scoreColor}`}>
                {score}/100
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                style={{ width: `${score}%` }}
                className={`h-full transition-all duration-300 ${
                  score >= 80 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-destructive"
                }`}
              />
            </div>

            <p className="text-[11px] font-medium text-muted-foreground">
              {healthResult.completedCount} of {healthResult.totalCount} quality checks completed.
            </p>

            {/* Missing items checklist */}
            {healthResult.missingItems.length > 0 && (
              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Required Improvements:
                </p>
                <ul className="space-y-1">
                  {healthResult.missingItems.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSectionClick(item.sectionId)}
                        className="flex items-center gap-1.5 text-left text-xs font-semibold text-destructive/90 hover:text-destructive hover:underline"
                      >
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Publishing CTA & Status */}
      <Card className="border-border bg-card shadow-2xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
            <span>Publishing Status</span>
            <StatusChip label={status} tone={statusToneFromValue(status)} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Channel Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => onVisibilityChange(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            >
              <option value="public">Online Store & App</option>
              <option value="private">Reseller Private Catalog</option>
              <option value="supplier_only">Wholesale Bulk Portal</option>
              <option value="hidden">Hidden / Draft Only</option>
            </select>
          </div>

          <div className="space-y-2 pt-1">
            <Button size="sm" className="w-full justify-center gap-1.5 font-bold shadow-xs" onClick={onSave} disabled={saving}>
              <RefreshCw className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`} />
              {saveState === "saving" ? "Saving Changes…" : saveState === "saved" ? "Autosaved" : "Save Draft"}
            </Button>
            <Button size="sm" className="w-full justify-center gap-1.5 font-extrabold shadow-xs bg-amber-500 hover:bg-amber-600 text-slate-950" onClick={onPublish} disabled={saving}>
              <Send className="h-3.5 w-3.5" />
              {status === "active" ? "Publish Changes" : "Publish Product"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Menu */}
      <Card className="border-border bg-card shadow-2xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Button size="sm" variant="ghost" className="w-full justify-start gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={onPreview}>
            <Eye className="h-3.5 w-3.5 text-primary" /> Preview Listing
          </Button>
          <Button size="sm" variant="ghost" className="w-full justify-start gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={handleCopyUrl}>
            <Share2 className="h-3.5 w-3.5 text-primary" /> Copy Product Link
          </Button>
          {onDuplicate && (
            <Button size="sm" variant="ghost" className="w-full justify-start gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5 text-primary" /> Duplicate Item
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" className="w-full justify-start gap-2 text-xs font-semibold text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" /> Delete Product
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Section Navigation Jump Links */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
          Editor Jump Links
        </p>
        <div className="space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSectionClick(s.id)}
              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all ${
                activeSection === s.id
                  ? "bg-accent text-foreground font-bold border-l-4 border-primary pl-2 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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

export default StudioRightSidebar;
