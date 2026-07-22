"use client";

import * as React from "react";
import { FileText, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { SectionHeader } from "@/shared/components/workspace/section-header";

export default function ImportExportPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <SectionHeader title="Import / Export" description="মূল্য নির্ধারণ নিয়ম ইম্পোর্ট ও এক্সপোর্ট — CSV ও Excel ফরম্যাট" icon={FileText} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="hover:border-primary/40 transition-all">
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4 text-info" /> Import</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Import pricing rules from CSV or Excel files.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <FileText className="h-3.5 w-3.5" /> CSV
              </Button>
              <Button variant="outline" size="sm" disabled>
                <FileText className="h-3.5 w-3.5" /> Excel
              </Button>
            </div>
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">CSV, XLSX up to 5MB</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-all">
          <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-4 w-4 text-success" /> Export</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Export pricing rules, profiles, or history data.</p>
            <div className="space-y-2">
              {[
                { label: "Pricing Rules", desc: "All global, category, brand & supplier rules" },
                { label: "Pricing Profiles", desc: "All reusable pricing profiles" },
                { label: "Price History", desc: "Complete price change audit trail" },
              ].map((item) => (
                <button key={item.label} className="w-full text-left flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors" disabled>
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                  </div>
                  <Badge variant="muted" size="xs">CSV</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
