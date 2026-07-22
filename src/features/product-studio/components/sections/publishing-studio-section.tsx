"use client";

import * as React from "react";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { Input } from "@/shared/components/ui/input";
import { FormField } from "@/shared/components/forms/form-field";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, Clock, CheckCircle2, AlertTriangle, Send, ShieldCheck } from "lucide-react";
import type { HealthScoreResult } from "../../types/studio-types";

export interface PublishingStudioSectionProps {
  status: string;
  onStatusChange?: (status: string) => void;
  scheduledDate?: string;
  onScheduledDateChange?: (v: string) => void;
  scheduledTime?: string;
  onScheduledTimeChange?: (v: string) => void;
  healthResult?: HealthScoreResult;
}

export function PublishingStudioSection({
  status,
  onStatusChange,
  scheduledDate = "",
  onScheduledDateChange,
  scheduledTime = "00:00",
  onScheduledTimeChange,
  healthResult,
}: PublishingStudioSectionProps): React.ReactElement {
  const isReadyForPublish = (healthResult?.score ?? 0) >= 50;

  return (
    <StudioCollapsibleSection
      id="publishing"
      title="Publishing Workflow & Automated Schedule"
      description="Scheduled release calendar, automated publishing triggers, and pre-release quality audit"
      defaultExpanded={true}
      badge={
        isReadyForPublish ? (
          <Badge variant="success" size="xs" className="gap-1 font-bold">
            <CheckCircle2 className="h-3 w-3" /> Ready for Launch
          </Badge>
        ) : (
          <Badge variant="warning" size="xs" className="gap-1 font-bold">
            <AlertTriangle className="h-3 w-3" /> Audit Warnings
          </Badge>
        )
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Publishing Status">
            <select
              value={status}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
              className="h-9.5 w-full rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            >
              <option value="draft">Draft (Saved locally)</option>
              <option value="scheduled">Scheduled Auto-Publish</option>
              <option value="active">Active / Published</option>
              <option value="pending_review">Pending Admin Review</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          <FormField label="Timezone">
            <input
              readOnly
              value="Asia/Dhaka (GMT+6)"
              className="h-9.5 w-full rounded-lg border border-border bg-muted/40 px-3 text-xs font-mono font-bold text-muted-foreground"
            />
          </FormField>

          <FormField label="Scheduled Release Date">
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => onScheduledDateChange && onScheduledDateChange(e.target.value)}
              className="font-mono text-xs font-bold"
            />
          </FormField>

          <FormField label="Scheduled Release Time">
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => onScheduledTimeChange && onScheduledTimeChange(e.target.value)}
              className="font-mono text-xs font-bold"
            />
          </FormField>
        </div>

        {/* Pre-Publish Quality Audit Summary */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Pre-Publish Quality Audit
            </span>
            <span className="text-xs font-mono font-extrabold text-foreground">
              {healthResult?.score ?? 0}/100 Points
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-lg border border-border bg-muted/30 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Images</p>
              <p className="text-xs font-extrabold text-foreground">
                {(healthResult?.items.find((i) => i.id === "primaryImage")?.completed) ? "✓ Uploaded" : "❌ Missing"}
              </p>
            </div>
            <div className="p-2 rounded-lg border border-border bg-muted/30 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Pricing</p>
              <p className="text-xs font-extrabold text-foreground">
                {(healthResult?.items.find((i) => i.id === "sellingPrice")?.completed) ? "✓ Valid" : "❌ Missing"}
              </p>
            </div>
            <div className="p-2 rounded-lg border border-border bg-muted/30 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Stock</p>
              <p className="text-xs font-extrabold text-foreground">
                {(healthResult?.items.find((i) => i.id === "inventory")?.completed) ? "✓ Defined" : "❌ Missing"}
              </p>
            </div>
            <div className="p-2 rounded-lg border border-border bg-muted/30 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">SEO</p>
              <p className="text-xs font-extrabold text-foreground">
                {(healthResult?.items.find((i) => i.id === "seo")?.completed) ? "✓ Ready" : "❌ Incomplete"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </StudioCollapsibleSection>
  );
}
