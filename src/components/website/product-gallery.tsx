"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Play, RotateCw, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface GalleryImage {
  url: string;
  alt?: string;
  type?: "image" | "video" | "model";
  isFeatured?: boolean;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
  marketingAssets?: boolean;
  selectedImage?: string;
}

export function ProductGallery({
  images = [],
  title,
  marketingAssets,
  selectedImage,
}: ProductGalleryProps) {
  // Determine initial featured index
  const initialIndex = React.useMemo(() => {
    if (!images || images.length === 0) return 0;
    const featuredIdx = images.findIndex((img) => img.isFeatured);
    return featuredIdx !== -1 ? featuredIdx : 0;
  }, [images]);

  const [selected, setSelected] = React.useState<number>(initialIndex);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);
  const [zoomPos, setZoomPos] = React.useState({ x: 0, y: 0 });

  // Sync selected image if variant selection changes
  React.useEffect(() => {
    if (!selectedImage || !images || images.length === 0) return;
    const matchIdx = images.findIndex((img) => img.url === selectedImage);
    if (matchIdx !== -1) {
      setSelected(matchIdx);
    }
  }, [selectedImage, images]);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoomed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPos({ x, y });
    },
    [zoomed]
  );

  const handlePrev = () => {
    setSelected((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelected((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-3xl bg-slate-100 flex items-center justify-center border border-slate-200">
        <span className="text-slate-400 text-xs font-semibold">ছবি উপলব্ধ নেই</span>
      </div>
    );
  }

  const current = images[selected] || images[0];

  return (
    <>
      <div className="space-y-3">
        {/* HERO IMAGE CONTAINER */}
        <div
          className="relative aspect-square rounded-3xl bg-slate-100 overflow-hidden cursor-crosshair group border border-slate-200 shadow-xs"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {current.type === "video" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/90 text-slate-900 text-xs font-bold shadow-md">
                <Play className="h-4 w-4 text-red-600" />
                <span>Play Video</span>
              </div>
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-200"
              style={{
                backgroundImage: `url(${current.url})`,
                transform: zoomed ? "scale(1.5)" : "scale(1)",
                backgroundPosition: zoomed ? `${zoomPos.x}% ${zoomPos.y}%` : "center",
              }}
            />
          )}

          {current.type === "model" && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 border border-slate-200 text-[10px] font-bold text-slate-800 flex items-center space-x-1 backdrop-blur-xs">
              <RotateCw className="h-3 w-3 text-red-600" />
              <span>360° View</span>
            </div>
          )}

          {marketingAssets && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black flex items-center space-x-1 shadow-md">
              <Shield className="h-3 w-3" />
              <span>HD Asset</span>
            </div>
          )}

          {/* MOBILE SWIPE NAVIGATION CHEVRONS (High-touch targets 44x44px) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/80 border border-slate-200 text-slate-800 hover:bg-white transition-colors shadow-md md:hidden"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/80 border border-slate-200 text-slate-800 hover:bg-white transition-colors shadow-md md:hidden"
                aria-label="Next Image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* ZOOM FULLSCREEN TRIGGER */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/90 border border-slate-200 text-slate-800 hover:bg-white transition-colors shadow-md opacity-0 group-hover:opacity-100"
            aria-label="View full size"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* MOBILE PAGINATION DOTS (Visible on Mobile Only) */}
        {images.length > 1 && (
          <div className="flex items-center justify-center space-x-1.5 py-1 md:hidden">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelected(idx)}
                className={cn(
                  "h-2 rounded-full transition-all min-w-[20px] min-h-[20px] flex items-center justify-center",
                  selected === idx ? "bg-red-600 w-6" : "bg-slate-300 w-2"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* DESKTOP THUMBNAILS GRID (Visible on Desktop Only) */}
        {images.length > 1 && (
          <div className="hidden md:flex gap-2.5 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={cn(
                  "relative min-w-[64px] min-h-[64px] rounded-2xl overflow-hidden border-2 transition-all shrink-0",
                  selected === i
                    ? "border-red-600 ring-2 ring-red-600/30"
                    : "border-slate-200 hover:border-slate-400"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${img.url})` }}
                />
                {img.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-full min-h-[350px] sm:min-h-[550px] rounded-2xl bg-cover bg-center"
                style={{
                  backgroundImage: `url(${current.url})`,
                  aspectRatio: "4/3",
                }}
              />
              <p className="text-white/70 text-xs font-semibold text-center mt-3">
                {current.alt ?? title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
