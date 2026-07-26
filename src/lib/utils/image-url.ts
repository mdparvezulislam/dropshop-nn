/**
 * ImageKit delivery optimization.
 *
 * For assets served from ik.imagekit.io we append transformation params so
 * the CDN delivers right-sized, auto-format (WebP/AVIF) renditions instead
 * of multi-MB originals. Non-ImageKit URLs pass through untouched.
 */
const IMAGEKIT_HOST = "ik.imagekit.io";

export function optimizedImageUrl(url: string, width: number, quality = 80): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== IMAGEKIT_HOST) return url;
    parsed.searchParams.set("tr", `w-${Math.round(width)},q-${quality},f-auto`);
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Neutral blur placeholder for product imagery (tiny embedded SVG).
 * Used with next/image `placeholder="blur"` so slots paint instantly
 * with no layout shift while the real image streams in.
 */
export const PRODUCT_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=";
