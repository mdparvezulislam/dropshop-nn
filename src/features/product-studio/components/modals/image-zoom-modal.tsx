"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Monitor, Smartphone, Tablet, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ImageZoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  altText?: string;
}

export function ImageZoomModal({
  open,
  onOpenChange,
  imageUrl,
  altText,
}: ImageZoomModalProps): React.ReactElement {
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoom, setZoom] = React.useState<number>(1);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border border-border bg-card shadow-2xl rounded-2xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Maximize2 className="h-4 w-4 text-primary" /> ImageKit HD Preview & Responsive Inspector
          </DialogTitle>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={cn(
                "rounded-md p-1 text-xs font-semibold transition-all",
                device === "desktop" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
              )}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={cn(
                "rounded-md p-1 text-xs font-semibold transition-all",
                device === "tablet" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
              )}
              title="Tablet view"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={cn(
                "rounded-md p-1 text-xs font-semibold transition-all",
                device === "mobile" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
              )}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-black/90 min-h-[400px] overflow-hidden relative">
          <div
            className={cn(
              "transition-all duration-300 flex items-center justify-center overflow-hidden rounded-lg bg-card shadow-2xl",
              device === "desktop" && "w-full max-w-2xl aspect-[16/10]",
              device === "tablet" && "w-[480px] aspect-[4/3]",
              device === "mobile" && "w-[300px] aspect-[9/16]",
            )}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={altText || "Preview"}
                style={{ transform: `scale(${zoom})` }}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
              />
            ) : (
              <p className="text-xs text-muted-foreground">No image available</p>
            )}
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/80 backdrop-blur-md p-1 shadow-lg">
            <Button size="icon-sm" variant="ghost" onClick={handleZoomOut} title="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono font-bold px-2 text-foreground">{Math.round(zoom * 100)}%</span>
            <Button size="icon-sm" variant="ghost" onClick={handleZoomIn} title="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
