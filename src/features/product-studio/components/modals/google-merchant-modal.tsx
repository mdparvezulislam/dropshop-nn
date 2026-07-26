"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface GoogleMerchantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  xmlFeed: string;
  jsonLd: string;
}

export function GoogleMerchantModal({
  open,
  onOpenChange,
  xmlFeed,
  jsonLd,
}: GoogleMerchantModalProps): React.ReactElement {
  const [tab, setTab] = React.useState<"jsonld" | "xml">("jsonld");
  const [copied, setCopied] = React.useState(false);

  const contentToCopy = tab === "jsonld" ? jsonLd : xmlFeed;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    toast.success("Google Merchant snippet copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-border bg-card shadow-2xl rounded-2xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <ShoppingBag className="h-4 w-4 text-primary" /> Google Merchant Center & JSON-LD
            Inspector
          </DialogTitle>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setTab("jsonld")}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                tab === "jsonld"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              JSON-LD Schema
            </button>
            <button
              type="button"
              onClick={() => setTab("xml")}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                tab === "xml"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              XML Feed
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl border border-border bg-black/90 font-mono text-xs text-green-400 max-h-72 overflow-y-auto ws-scroll">
            <pre className="whitespace-pre-wrap leading-relaxed">{contentToCopy}</pre>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">
              Validates Schema.org/Product and Google Merchant Feed spec (2026).
            </p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-bold shadow-2xs"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}{" "}
              Copy Snippet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
