"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Play, RotateCw, Shield } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface GalleryImage {
  url: string;
  alt?: string;
  type?: "image" | "video" | "model";
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
  marketingAssets?: boolean;
}

export function ProductGallery({ images, title, marketingAssets }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const current = images[selected];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoomed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPos({ x, y });
    },
    [zoomed],
  );

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-muted flex items-center justify-center">
        <span className="text-foreground/20 text-sm">No images available</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div
          className="relative aspect-square rounded-xl bg-muted overflow-hidden cursor-crosshair group"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {current.type === "video" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 text-foreground/70 text-sm">
                <Play className="h-4 w-4" />
                Play Video
              </div>
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-200"
              style={{
                backgroundImage: `url(${current.url})`,
                transform: zoomed ? "scale(1)" : "scale(1)",
                backgroundPosition: zoomed ? `${zoomPos.x}% ${zoomPos.y}%` : "center",
                backgroundSize: zoomed ? "200%" : "cover",
              }}
            />
          )}

          {current.type === "model" && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-card/90 border border-border/60 text-[10px] font-medium text-foreground/60 flex items-center gap-1 backdrop-blur-sm">
              <RotateCw className="h-3 w-3" />
              360°
            </div>
          )}

          {marketingAssets && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary flex items-center gap-1 backdrop-blur-sm">
              <Shield className="h-3 w-3" />
              Marketing Asset
            </div>
          )}

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 border border-border/60 text-foreground/60 hover:text-foreground hover:bg-background transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
            aria-label="View full size"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={cn(
                  "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                  selected === i
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border/60 hover:border-border",
                )}
                aria-label={`View image ${i + 1}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${img.url})` }}
                />
                {img.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                )}
                {img.type === "model" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <RotateCw className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-full h-full min-h-[300px] sm:min-h-[500px] rounded-xl bg-cover bg-center"
                style={{
                  backgroundImage: `url(${current.url})`,
                  aspectRatio: "4/3",
                }}
              />
              <p className="text-white/60 text-sm text-center mt-3">{current.alt ?? title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
