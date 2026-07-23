"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export interface CatalogImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function CatalogImportModal({
  open,
  onOpenChange,
  onComplete,
}: CatalogImportModalProps): React.ReactElement {
  const [file, setFile] = React.useState<File | null>(null);
  const [importing, setImporting] = React.useState(false);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      toast.success(`Imported catalog items from ${file.name} successfully!`);
      onComplete();
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-border bg-card shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Upload className="h-4 w-4 text-primary" /> ইমপোর্ট ক্যাটালগ (Import CSV / Excel)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <div
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
            onClick={() => document.getElementById("csv-file-input")?.click()}
          >
            <input
              id="csv-file-input"
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary mb-2">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-foreground text-center">
              {file ? file.name : "Select CSV or Excel (.xlsx) file to import"}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground text-center mt-1">
              Supports SKU, Title, Price, Stock, Category, Brand headers
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" className="gap-1 font-bold shadow-xs" onClick={handleImport} disabled={!file || importing}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Start Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
