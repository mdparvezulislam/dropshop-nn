"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Printer, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  sku: string;
  barcode: string;
}

export function QRCodeModal({
  open,
  onOpenChange,
  productName,
  sku,
  barcode,
}: QRCodeModalProps): React.ReactElement {
  const [copied, setCopied] = React.useState(false);
  const codeValue = barcode || sku || "SKU-PROD-DS";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeValue);
    setCopied(true);
    toast.success("Barcode / SKU copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border border-border bg-card shadow-2xl rounded-2xl p-6 text-center">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center justify-center gap-2 text-foreground">
            <QrCode className="h-4 w-4 text-primary" /> Barcode & QR Code Studio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <div className="p-5 rounded-2xl border border-border bg-card dark:bg-card flex flex-col items-center justify-center space-y-3 shadow-2xs">
            {/* SVG Representation of Barcode */}
            <div className="w-full h-16 flex items-center justify-center gap-1 overflow-hidden">
              {codeValue.split("").map((char, i) => {
                const width = (char.charCodeAt(0) % 3) + 2;
                return (
                  <div
                    key={i}
                    style={{ width: `${width}px` }}
                    className="h-full bg-black shrink-0"
                  />
                );
              })}
            </div>
            <p className="font-mono text-xs font-bold text-foreground tracking-widest uppercase">
              *{codeValue}*
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground truncate">
              {productName || "Product Name"}
            </p>
            <p className="text-[11px] font-mono text-muted-foreground">SKU: {sku || "N/A"}</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleCopy}>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}{" "}
              Copy Code
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 text-primary" /> Print Label
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
