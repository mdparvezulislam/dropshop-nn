"use client";

import * as React from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listCampaignsAction, createCampaignAction, deleteCampaignAction } from "@/features/pricing/actions/pricing-engine-actions";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { SectionHeader } from "@/components/workspace/section-header";
import { formatCentsToCurrency } from "@/lib/utils/currency-utils";

export default function SchedulePage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader title="Scheduled Pricing" description="নির্ধারিত মূল্য পরিবর্তন — তারিখ ও সময় অনুযায়ী স্বয়ংক্রিয় মূল্য আপডেট" icon={Clock} />
      <Card className="border-border/80 bg-card">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <Clock className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">Scheduled pricing module ready</p>
          <p className="text-xs text-muted-foreground/70 mt-1 max-w-md">
            Schedule price changes with start/end dates, timezone support, auto-enable and auto-disable.
            Use campaigns for product-specific scheduled pricing.
          </p>
          <Button variant="outline" className="mt-4" disabled>Coming in next release</Button>
        </CardContent>
      </Card>
    </div>
  );
}
