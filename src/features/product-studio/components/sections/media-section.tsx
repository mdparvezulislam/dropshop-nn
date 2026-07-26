"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudioCollapsibleSection } from "../studio-collapsible-section";
import { ImagePlus, X, Star, Maximize2, ArrowLeft, ArrowRight, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useImageKitUpload } from "../../hooks/use-imagekit-upload";
import { ImageZoomModal } from "../modals/image-zoom-modal";
import { toast } from "sonner";

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video" | "document";
  isFeatured: boolean;
  altText?: string;
  caption?: string;
  imagekitFileId?: string;
}

export interface MediaSectionProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

export function MediaSection({ items, onChange }: MediaSectionProps): React.ReactElement {
  const [urlInput, setUrlInput] = React.useState("");
  const [zoomUrl, setZoomUrl] = React.useState<string | null>(null);
  const [editingAltId, setEditingAltId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadSuccess = React.useCallback(
    (item: any) => {
      const newItem: MediaItem = {
        id: item.id || `m-${Date.now()}`,
        url: item.url,
        type: "image",
        isFeatured: items.length === 0,
        imagekitFileId: item.imagekitFileId,
      };
      onChange([...items, newItem]);
    },
    [items, onChange],
  );

  const { uploading, uploadFiles, handlePasteEvent } = useImageKitUpload(handleUploadSuccess);

  // Global paste listener when component is mounted
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      handlePasteEvent(e);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handlePasteEvent]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const addUrlMedia = () => {
    if (!urlInput.trim()) return;
    const newItem: MediaItem = {
      id: `m-${Date.now()}`,
      url: urlInput.trim(),
      type: "image",
      isFeatured: items.length === 0,
    };
    onChange([...items, newItem]);
    setUrlInput("");
  };

  const removeMedia = (id: string) => {
    const filtered = items.filter((m) => m.id !== id);
    if (filtered.length > 0 && items.find((m) => m.id === id)?.isFeatured) {
      filtered[0].isFeatured = true;
    }
    onChange(filtered);
  };

  const setPrimary = (id: string) => {
    onChange(items.map((m) => ({ ...m, isFeatured: m.id === id })));
    toast.success("Primary cover image updated");
  };

  const moveMedia = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const updateAltText = (id: string, altText: string) => {
    onChange(items.map((m) => (m.id === id ? { ...m, altText } : m)));
  };

  return (
    <>
      <StudioCollapsibleSection
        id="media"
        title={`Media Studio (${items.length})`}
        description="ImageKit drag-and-drop studio, clipboard paste, WebP optimization, and gallery management"
        defaultExpanded={true}
        badge={
          items.length > 0 ? (
            <Badge variant="secondary" size="xs" className="font-bold">
              {items.length} Assets
            </Badge>
          ) : null
        }
      >
        <div className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none",
              uploading
                ? "border-primary bg-primary/5 animate-pulse"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary mb-2 shadow-2xs">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-foreground text-center">
              {uploading
                ? "Uploading to ImageKit…"
                : "Drag & drop images here, paste from clipboard (CTRL+V), or browse"}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground text-center mt-1">
              Supports JPEG, PNG, WebP, GIF, SVG up to 10MB • Automatic ImageKit compression
            </p>
          </div>

          {/* Media Grid Gallery */}
          {items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {items.map((m, idx) => (
                <div
                  key={m.id}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-2xl border bg-card shadow-2xs transition-all",
                    m.isFeatured
                      ? "border-primary ring-2 ring-primary/40 shadow-xs"
                      : "border-border/80",
                  )}
                >
                  <img
                    src={m.url}
                    alt={m.altText || "Product media"}
                    className="h-full w-full object-cover"
                  />

                  {/* Primary Badge */}
                  {m.isFeatured ? (
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-primary px-2 py-0.5 text-[9px] font-extrabold uppercase text-primary-foreground shadow-2xs flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 fill-current" /> Cover
                    </span>
                  ) : null}

                  {/* Overlay Action Buttons */}
                  <div className="absolute inset-0 flex flex-col justify-between p-2 sm:p-2.5 bg-black/50 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setZoomUrl(m.url)}
                        className="flex h-10 sm:h-7 w-10 sm:w-7 items-center justify-center rounded-xl sm:rounded-lg bg-black/60 text-white hover:bg-black"
                        title="Zoom / Inspect"
                      >
                        <Maximize2 className="h-4 sm:h-3.5 w-4 sm:w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeMedia(m.id)}
                        className="flex h-10 sm:h-7 w-10 sm:w-7 items-center justify-center rounded-xl sm:rounded-lg bg-destructive text-white hover:bg-destructive/80"
                        title="Delete asset"
                      >
                        <X className="h-4 sm:h-3.5 w-4 sm:w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveMedia(idx, idx - 1)}
                            className="flex h-9 sm:h-6 w-9 sm:w-6 items-center justify-center rounded-xl sm:rounded bg-black/60 text-white hover:bg-black"
                            title="Move left"
                          >
                            <ArrowLeft className="h-4 sm:h-3 w-4 sm:w-3" />
                          </button>
                        )}
                        {idx < items.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveMedia(idx, idx + 1)}
                            className="flex h-9 sm:h-6 w-9 sm:w-6 items-center justify-center rounded-xl sm:rounded bg-black/60 text-white hover:bg-black"
                            title="Move right"
                          >
                            <ArrowRight className="h-4 sm:h-3 w-4 sm:w-3" />
                          </button>
                        )}
                      </div>

                      {!m.isFeatured && (
                        <button
                          type="button"
                          onClick={() => setPrimary(m.id)}
                          className="rounded-lg sm:rounded-md bg-primary px-3 sm:px-2 py-1.5 sm:py-1 text-xs sm:text-[10px] font-bold text-primary-foreground hover:bg-primary/90"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add via URL Input */}
          <div className="flex gap-2 pt-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUrlMedia()}
              placeholder="Or paste external ImageKit / CDN image URL..."
              className="flex-1 text-xs font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUrlMedia}
              disabled={!urlInput.trim()}
            >
              Add URL
            </Button>
          </div>
        </div>
      </StudioCollapsibleSection>

      <ImageZoomModal
        open={Boolean(zoomUrl)}
        onOpenChange={(open) => !open && setZoomUrl(null)}
        imageUrl={zoomUrl || ""}
      />
    </>
  );
}
