"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { exportProductsAction } from "../../actions/product-catalog-actions";
import { toast } from "sonner";

export interface CatalogExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
}

export function CatalogExportModal({
  open,
  onOpenChange,
  selectedIds,
}: CatalogExportModalProps): React.ReactElement {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportProductsAction(selectedIds.length > 0 ? selectedIds : undefined);
      if (res.success && res.csvContent) {
        const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `catalog-export-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Catalog CSV downloaded!");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Export failed");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-border bg-card shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Download className="h-4 w-4 text-primary" /> এক্সপোর্ট ক্যাটালগ (Export Catalog)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
            <p className="text-xs font-bold text-foreground">
              {selectedIds.length > 0
                ? `Export ${selectedIds.length} Selected Items to CSV`
                : "Export Entire Product Catalog to CSV"}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Includes SKU, Title, Price (BDT), Stock, Category, Brand, and Status fields.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1 font-bold shadow-xs"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-3.5 w-3.5" /> Download CSV Spreadsheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
