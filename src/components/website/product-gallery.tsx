"use client";

import * as React from "react";
import Image from "next/image";
import { X, ZoomIn, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import { optimizedImageUrl, PRODUCT_BLUR_DATA_URL } from "@/lib/utils/image-url";

export interface GalleryMedia {
  url: string;
  alt?: string;
  type?: "image" | "video" | "model";
  isFeatured?: boolean;
}

interface ProductGalleryProps {
  media: GalleryMedia[];
  title: string;
  /** Variant-selected image URL — gallery jumps to it when it changes. */
  selectedImage?: string;
}

/**
 * PDP media gallery. Real <Image> elements (SEO, LCP, alt text), CSS
 * scroll-snap swipe on mobile, hover-zoom overlay on desktop, and a
 * fullscreen lightbox with dialog semantics. Videos render natively.
 */
export function ProductGallery({ media, title, selectedImage }: ProductGalleryProps) {
  const items = React.useMemo<GalleryMedia[]>(
    () =>
      media.length > 0
        ? media
        : [{ url: PRODUCT_IMAGE_PLACEHOLDER, alt: title, type: "image", isFeatured: true }],
    [media, title],
  );

  const initialIndex = React.useMemo(() => {
    const featuredIdx = items.findIndex((m) => m.isFeatured);
    return featuredIdx !== -1 ? featuredIdx : 0;
  }, [items]);

  const [selected, setSelected] = React.useState(initialIndex);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [zoomed, setZoomed] = React.useState(false);
  const [zoomPos, setZoomPos] = React.useState({ x: 50, y: 50 });
  const trackRef = React.useRef<HTMLDivElement>(null);
  const lightboxCloseRef = React.useRef<HTMLButtonElement>(null);
  const zoomTriggerRef = React.useRef<HTMLButtonElement>(null);

  const scrollToIndex = React.useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  const select = React.useCallback(
    (index: number) => {
      const clamped = ((index % items.length) + items.length) % items.length;
      setSelected(clamped);
      scrollToIndex(clamped);
    },
    [items.length, scrollToIndex],
  );

  // Variant image sync
  React.useEffect(() => {
    if (!selectedImage) return;
    const matchIdx = items.findIndex((m) => m.url === selectedImage);
    if (matchIdx !== -1) select(matchIdx);
  }, [selectedImage, items, select]);

  // Track mobile swipe position → active dot
  const handleTrackScroll = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setSelected((prev) => (prev === index ? prev : Math.min(index, items.length - 1)));
  }, [items.length]);

  // Lightbox: Escape + focus management
  React.useEffect(() => {
    if (!lightboxOpen) return;
    lightboxCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        zoomTriggerRef.current?.focus();
      }
      if (e.key === "ArrowLeft") select(selected - 1);
      if (e.key === "ArrowRight") select(selected + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, select, selected]);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoomed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setZoomPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [zoomed],
  );

  const current = items[selected] ?? items[0];
  const isPlaceholder = current.url === PRODUCT_IMAGE_PLACEHOLDER;

  return (
    <>
      <div className="space-y-3">
        {/* Main media: mobile = swipeable snap track; desktop = single frame with hover zoom */}
        <div
          className="relative rounded-3xl bg-slate-100 overflow-hidden border border-slate-200 shadow-xs group"
          onMouseEnter={() => current.type !== "video" && setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <div
            ref={trackRef}
            onScroll={handleTrackScroll}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                select(selected - 1);
              }
              if (e.key === "ArrowRight") {
                e.preventDefault();
                select(selected + 1);
              }
            }}
            tabIndex={items.length > 1 ? 0 : -1}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none md:overflow-hidden focus-visible:outline-2 focus-visible:outline-amber-500"
            aria-roledescription="carousel"
            aria-label={`${title} — ছবি গ্যালারি (অ্যারো কী দিয়ে নেভিগেট করুন)`}
          >
            {items.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className={cn(
                  "relative w-full shrink-0 snap-center aspect-square",
                  // Desktop shows only the selected frame
                  "md:transition-none",
                  index !== selected && "md:hidden",
                )}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${items.length}`}
              >
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-contain bg-black"
                    aria-label={item.alt ?? `${title} ভিডিও`}
                  />
                ) : (
                  <Image
                    src={optimizedImageUrl(item.url, 1280)}
                    alt={item.alt ?? title}
                    fill
                    priority={index === initialIndex}
                    fetchPriority={index === initialIndex ? "high" : "auto"}
                    placeholder={isPlaceholder ? undefined : "blur"}
                    blurDataURL={PRODUCT_BLUR_DATA_URL}
                    className={cn(
                      "object-cover",
                      isPlaceholder && "object-contain p-10 opacity-70",
                    )}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Desktop hover zoom overlay (progressive enhancement over the real <Image>) */}
          {zoomed && current.type !== "video" && !isPlaceholder && (
            <div
              aria-hidden
              className="absolute inset-0 hidden md:block pointer-events-none bg-no-repeat"
              style={{
                backgroundImage: `url(${optimizedImageUrl(current.url, 1920)})`,
                backgroundSize: "200%",
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          )}

          {/* Desktop arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => select(selected - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-white/85 border border-slate-200 text-slate-800 hover:bg-white transition-colors shadow-md opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-500"
                aria-label="আগের ছবি"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => select(selected + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-white/85 border border-slate-200 text-slate-800 hover:bg-white transition-colors shadow-md opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-500"
                aria-label="পরের ছবি"
              >
                <ChevronRight className="w-5 h-5" aria-hidden />
              </button>
            </>
          )}

          {/* Fullscreen trigger */}
          {current.type !== "video" && !isPlaceholder && (
            <button
              ref={zoomTriggerRef}
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-3 right-3 h-11 w-11 flex items-center justify-center rounded-xl bg-white/90 border border-slate-200 text-slate-800 hover:bg-white transition-colors shadow-md md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-500"
              aria-label="ফুলস্ক্রিনে দেখুন"
            >
              <ZoomIn className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Mobile dots */}
        {items.length > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 py-1 md:hidden"
            role="tablist"
            aria-label="গ্যালারি নেভিগেশন"
          >
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={selected === idx}
                onClick={() => select(idx)}
                className={cn(
                  "h-5 min-w-5 flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-amber-500",
                )}
                aria-label={`ছবি ${idx + 1} দেখুন`}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-2 rounded-full transition-all",
                    selected === idx ? "bg-amber-500 w-6" : "bg-slate-300 w-2",
                  )}
                />
              </button>
            ))}
          </div>
        )}

        {/* Desktop thumbnails */}
        {items.length > 1 && (
          <div className="hidden md:flex gap-2.5 overflow-x-auto pb-1">
            {items.map((item, i) => (
              <button
                key={`${item.url}-thumb-${i}`}
                type="button"
                onClick={() => select(i)}
                aria-label={`ছবি ${i + 1} দেখুন`}
                aria-current={selected === i}
                className={cn(
                  "relative h-16 w-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
                  selected === i
                    ? "border-amber-500 ring-2 ring-amber-500/30"
                    : "border-slate-200 hover:border-slate-400",
                )}
              >
                <Image
                  src={optimizedImageUrl(item.url, 128)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
                {item.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-4 w-4 text-white" aria-hidden />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — বড় ছবি`}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => {
            setLightboxOpen(false);
            zoomTriggerRef.current?.focus();
          }}
        >
          <button
            ref={lightboxCloseRef}
            type="button"
            onClick={() => {
              setLightboxOpen(false);
              zoomTriggerRef.current?.focus();
            }}
            className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-white"
            aria-label="বন্ধ করুন"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div
            className="relative w-full max-w-4xl aspect-[4/3] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={optimizedImageUrl(current.url, 1920)}
              alt={current.alt ?? title}
              placeholder="blur"
              blurDataURL={PRODUCT_BLUR_DATA_URL}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  select(selected - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
                aria-label="আগের ছবি"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  select(selected + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
                aria-label="পরের ছবি"
              >
                <ChevronRight className="w-5 h-5" aria-hidden />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
