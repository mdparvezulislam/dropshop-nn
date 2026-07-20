"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { StudioSection } from "../studio-layout";
import { ImagePlus, X, Film, FileText } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video" | "document";
  isFeatured: boolean;
  altText?: string;
}

export interface MediaSectionProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

export function MediaSection({ items, onChange }: MediaSectionProps): React.ReactElement {
  const [urlInput, setUrlInput] = React.useState("");

  const addMedia = () => {
    if (!urlInput.trim()) return;
    const isVideo = /\.(mp4|webm|mov)/i.test(urlInput);
    const isDoc = /\.(pdf|doc|docx|xls|xlsx)/i.test(urlInput);
    const type = isVideo ? "video" as const : isDoc ? "document" as const : "image" as const;

    onChange([
      ...items,
      {
        id: `m${Date.now()}`,
        url: urlInput.trim(),
        type,
        isFeatured: items.length === 0,
      },
    ]);
    setUrlInput("");
  };

  const removeMedia = (id: string) => {
    const filtered = items.filter((m) => m.id !== id);
    if (filtered.length > 0 && items.find((m) => m.id === id)?.isFeatured) {
      filtered[0].isFeatured = true;
    }
    onChange(filtered);
  };

  const setFeatured = (id: string) => {
    onChange(items.map((m) => ({ ...m, isFeatured: m.id === id })));
  };

  const typeIcon = (type: string) => {
    if (type === "video") return <Film className="h-3 w-3" />;
    if (type === "document") return <FileText className="h-3 w-3" />;
    return null;
  };

  return (
    <StudioSection id="media" title={`Media (${items.length})`} description="Product images, videos, and documents">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((m) => (
          <div
            key={m.id}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl border bg-muted",
              m.isFeatured ? "border-primary ring-1 ring-primary/30" : "border-border",
            )}
          >
            {m.type === "image" ? (
              <img src={m.url} alt={m.altText || ""} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                {typeIcon(m.type)}
                <span className="ml-1 text-xs">{m.type}</span>
              </div>
            )}
            {m.isFeatured ? (
              <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                Cover
              </span>
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {!m.isFeatured ? (
                <button
                  type="button"
                  onClick={() => setFeatured(m.id)}
                  className="rounded-md bg-white/20 px-2 py-1 text-[10px] text-white hover:bg-white/30"
                >
                  Set cover
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => removeMedia(m.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white"
                aria-label="Remove media"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground">
          <ImagePlus className="h-6 w-6" />
          <span className="text-[11px]">Add URL</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMedia()}
          placeholder="https://example.com/image.jpg"
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addMedia} disabled={!urlInput.trim()}>
          Add
        </Button>
      </div>
    </StudioSection>
  );
}
