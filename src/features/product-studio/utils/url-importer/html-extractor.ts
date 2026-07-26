import { parse, HTMLElement } from "node-html-parser";
import type { PageMetadata, JsonLdProduct, ExtractedData } from "./types";

function extractMeta(root: HTMLElement): PageMetadata {
  const metadata: PageMetadata = {};
  const metas = root.querySelectorAll("meta");
  for (const meta of metas) {
    const name = meta.getAttribute("name")?.toLowerCase();
    const prop = meta.getAttribute("property")?.toLowerCase();
    const content = meta.getAttribute("content");

    if (!content) continue;

    if (name === "title") metadata.metaTitle = content;
    if (name === "description") metadata.metaDescription = content;
    if (prop === "og:title") metadata.ogTitle = content;
    if (prop === "og:description") metadata.ogDescription = content;
    if (prop === "og:image") metadata.ogImage = content;
    if (prop === "og:locale") metadata.locale = content;
    if (prop === "og:site_name") metadata.siteName = content;
  }

  const canonical = root.querySelector('link[rel="canonical"]');
  if (canonical) {
    metadata.canonicalUrl = canonical.getAttribute("href");
  }

  const titleTag = root.querySelector("title");
  if (titleTag) {
    metadata.title = titleTag.textContent.trim();
  }

  return metadata;
}

function extractJsonLd(root: HTMLElement): JsonLdProduct | undefined {
  const scripts = root.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const raw = script.textContent.trim();
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (
          item["@type"] === "Product" ||
          item["@type"] === "product" ||
          (item["@graph"] && Array.isArray(item["@graph"]))
        ) {
          if (item["@graph"]) {
            const productNode = item["@graph"].find(
              (n: Record<string, unknown>) => n["@type"] === "Product",
            );
            if (productNode) return mapJsonLd(productNode);
          }
          return mapJsonLd(item);
        }
      }
    } catch {
      continue;
    }
  }
  return undefined;
}

function mapJsonLd(raw: Record<string, unknown>): JsonLdProduct {
  return {
    name: typeof raw.name === "string" ? raw.name : undefined,
    description: typeof raw.description === "string" ? raw.description : undefined,
    sku: typeof raw.sku === "string" ? raw.sku : undefined,
    brand:
      raw.brand && typeof raw.brand === "object"
        ? { name: (raw.brand as Record<string, unknown>).name as string }
        : undefined,
    mpn: typeof raw.mpn === "string" ? raw.mpn : undefined,
    gtin: (raw.gtin ?? raw.gtin13 ?? raw.gtin12 ?? raw.gtin14 ?? raw.gtin8) as string | undefined,
    image:
      typeof raw.image === "string"
        ? raw.image
        : Array.isArray(raw.image)
          ? (raw.image as string[])
          : undefined,
    offers:
      raw.offers && typeof raw.offers === "object"
        ? {
            price: (raw.offers as Record<string, unknown>).price as string | number | undefined,
            priceCurrency: (raw.offers as Record<string, unknown>).priceCurrency as
              string | undefined,
            availability: (raw.offers as Record<string, unknown>).availability as
              string | undefined,
          }
        : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
  };
}

function extractPageTitle(root: HTMLElement): string | undefined {
  const h1 = root.querySelector("h1");
  if (h1) {
    const text = h1.textContent.trim();
    if (text.length > 0 && text.length < 300) return text;
  }
  return undefined;
}

function extractDescription(root: HTMLElement, metadata: PageMetadata): string | undefined {
  if (metadata.ogDescription) return metadata.ogDescription;
  if (metadata.metaDescription) return metadata.metaDescription;
  const descEl = root.querySelector(
    '[class*="description"], [class*="desc-"], [itemprop="description"]',
  );
  if (descEl) {
    const text = descEl.textContent.trim();
    if (text.length > 20 && text.length < 2000) return text;
  }
  return undefined;
}

function extractFeatures(root: HTMLElement): string[] {
  const features: string[] = [];
  const seen = new Set<string>();

  const lists = root.querySelectorAll("ul, ol");
  for (const list of lists) {
    const items = list.querySelectorAll("li");
    if (items.length < 2 || items.length > 30) continue;

    for (const li of items) {
      const text = li.textContent.trim();
      if (text.length > 5 && text.length < 300 && !seen.has(text.toLowerCase())) {
        seen.add(text.toLowerCase());
        features.push(text);
      }
    }
  }

  const featureSections = root.querySelectorAll(
    '[class*="feature"], [class*="highlight"], [id*="feature"], [id*="highlight"]',
  );
  for (const section of featureSections) {
    const items = section.querySelectorAll("li, p, span");
    for (const item of items) {
      const text = item.textContent.trim();
      if (text.length > 5 && text.length < 300 && !seen.has(text.toLowerCase())) {
        seen.add(text.toLowerCase());
        features.push(text);
      }
    }
  }

  return features;
}

function extractSpecifications(
  root: HTMLElement,
): Array<{ key: string; value: string; group?: string }> {
  const specs: Array<{ key: string; value: string; group?: string }> = [];
  const seen = new Set<string>();

  const tables = root.querySelectorAll("table");
  for (const table of tables) {
    const rows = table.querySelectorAll("tr");
    for (const row of rows) {
      const cells = row.querySelectorAll("td, th");
      if (cells.length >= 2) {
        const key = cells[0].textContent.trim().replace(/[:：]\s*$/, "");
        const value = cells[1].textContent.trim();
        if (key && value && key.length < 100 && value.length < 500) {
          const sig = `${key.toLowerCase()}:${value.toLowerCase()}`;
          if (!seen.has(sig)) {
            seen.add(sig);
            specs.push({ key, value });
          }
        }
      }
    }
  }

  const dlLists = root.querySelectorAll("dl");
  for (const dl of dlLists) {
    const terms = dl.querySelectorAll("dt");
    const defs = dl.querySelectorAll("dd");
    for (let i = 0; i < Math.min(terms.length, defs.length); i++) {
      const key = terms[i].textContent.trim().replace(/[:：]\s*$/, "");
      const value = defs[i].textContent.trim();
      if (key && value && key.length < 100 && value.length < 500) {
        const sig = `${key.toLowerCase()}:${value.toLowerCase()}`;
        if (!seen.has(sig)) {
          seen.add(sig);
          specs.push({ key, value });
        }
      }
    }
  }

  const specSections = root.querySelectorAll(
    '[class*="specification"], [class*="specs-"], [id*="specification"], [itemprop*="spec"]',
  );
  for (const section of specSections) {
    const items = section.querySelectorAll("li, p, div");
    for (const item of items) {
      const text = item.textContent.trim();
      const match = text.match(/^([A-Za-z][A-Za-z\s\-/]+?)\s*[:：]\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key.length < 100 && value.length < 500) {
          const sig = `${key.toLowerCase()}:${value.toLowerCase()}`;
          if (!seen.has(sig)) {
            seen.add(sig);
            specs.push({ key, value });
          }
        }
      }
    }
  }

  return specs;
}

function extractBreadcrumbs(root: HTMLElement): string[] {
  const crumbs: string[] = [];
  const breadcrumbSelectors = [
    '[class*="breadcrumb"] a, [class*="breadcrumb"] span',
    '[itemprop="breadcrumb"] a, [itemprop="breadcrumb"] span',
    'nav a[class*="crumb"], nav span[class*="crumb"]',
  ];

  for (const selector of breadcrumbSelectors) {
    const links = root.querySelectorAll(selector);
    for (const link of links) {
      const text = link.textContent.trim();
      if (text && text.length < 100 && !crumbs.includes(text)) {
        crumbs.push(text);
      }
    }
    if (crumbs.length > 0) break;
  }

  return crumbs;
}

function extractBrandHint(root: HTMLElement, structuredData?: JsonLdProduct): string | undefined {
  if (structuredData?.brand?.name) return structuredData.brand.name;
  const brandEl = root.querySelector('[class*="brand"], [itemprop="brand"], [id*="brand"]');
  if (brandEl) {
    const text = brandEl.textContent.trim();
    if (text.length > 0 && text.length < 100) return text;
  }
  return undefined;
}

function extractPriceHint(root: HTMLElement, structuredData?: JsonLdProduct): string | undefined {
  if (structuredData?.offers?.price) {
    return String(structuredData.offers.price);
  }
  const priceEl = root.querySelector(
    '[class*="price"], [itemprop="price"], [class*="sale-price"], [class*="offer-price"]',
  );
  if (priceEl) {
    const match = priceEl.textContent.trim().match(/[0-9,]+(?:\.[0-9]{2})?/);
    if (match) return match[0].replace(/,/g, "");
  }
  return undefined;
}

function extractCategoryHint(
  root: HTMLElement,
  structuredData?: JsonLdProduct,
  breadcrumbs?: string[],
): string | undefined {
  if (structuredData?.category) return structuredData.category;
  if (breadcrumbs && breadcrumbs.length > 1) {
    return breadcrumbs[breadcrumbs.length - 1];
  }
  return undefined;
}

function removeUnwantedElements(root: HTMLElement): void {
  const selectors = [
    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "nav",
    "header:not([itemprop])",
    "footer",
    '[class*="cookie"]',
    '[id*="cookie"]',
    '[class*="ad-"]',
    '[id*="ad-"]',
    '[class*="advertisement"]',
    '[class*="banner"]',
    '[id*="banner"]',
    '[class*="popup"]',
    '[id*="popup"]',
    '[class*="modal"]',
    '[class*="newsletter"]',
    '[class*="related"]',
    '[class*="recommend"]',
    '[id*="recommend"]',
    '[class*="sidebar"]',
    '[id*="sidebar"]',
    '[class*="comment"]',
    '[id*="comment"]',
    '[class*="review"]:not([itemprop])',
    '[class*="social"]',
    '[id*="social"]',
    '[class*="share"]',
    '[aria-hidden="true"]',
    ".hidden",
    "[hidden]",
  ];

  for (const selector of selectors) {
    const elements = root.querySelectorAll(selector);
    for (const el of elements) {
      el.remove();
    }
  }
}

function extractCleanText(root: HTMLElement): string {
  const productSelectors = [
    '[itemtype$="/Product"]',
    '[class*="product-detail"]',
    '[class*="product-main"]',
    '[class*="product-info"]',
    '[id*="product-info"]',
    "main",
    '[role="main"]',
    "article",
    ".content",
    "#content",
  ];

  let container: HTMLElement | null = null;
  for (const selector of productSelectors) {
    container = root.querySelector(selector);
    if (container) break;
  }

  const source = container || root;
  const text = source.textContent
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  return text;
}

export function extractPageContent(html: string): ExtractedData {
  const root = parse(html, {
    comment: false,
    blockTextElements: { script: false, style: false },
  });

  const metadata = extractMeta(root);
  const structuredData = extractJsonLd(root);
  const pageTitle = extractPageTitle(root) || metadata.title;
  const description = extractDescription(root, metadata);
  const breadcrumbs = extractBreadcrumbs(root);
  const brandHint = extractBrandHint(root, structuredData);
  const priceHint = extractPriceHint(root, structuredData);
  const categoryHint = extractCategoryHint(root, structuredData, breadcrumbs);

  removeUnwantedElements(root);

  const features = extractFeatures(root);
  const specifications = extractSpecifications(root);
  const images = extractImages(root, metadata.ogImage);

  const cleanText = extractCleanText(root);

  return {
    metadata,
    structuredData,
    pageTitle,
    description,
    features,
    specifications,
    images,
    breadcrumbs,
    brandHint,
    categoryHint,
    priceHint,
    cleanText,
  };
}

function extractImages(
  root: HTMLElement,
  ogImageUrl?: string,
): Array<{
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  isFeatured?: boolean;
}> {
  const images: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    isFeatured?: boolean;
  }> = [];
  const seen = new Set<string>();

  if (ogImageUrl && !seen.has(ogImageUrl)) {
    seen.add(ogImageUrl);
    images.push({ url: ogImageUrl, isFeatured: true });
  }

  const imgs = root.querySelectorAll("img");
  for (const img of imgs) {
    const src = img.getAttribute("src");
    if (!src) continue;

    const width = parseInt(img.getAttribute("width") || "0", 10);
    const height = parseInt(img.getAttribute("height") || "0", 10);

    if (width > 0 && height > 0 && (width < 100 || height < 100)) continue;
    if (src.includes("icon") || src.includes("logo") || src.includes("banner")) continue;
    if (src.endsWith(".svg")) continue;
    if (src.startsWith("data:")) continue;

    const normalUrl = normalizeImageUrl(src);
    if (!normalUrl || seen.has(normalUrl)) continue;
    seen.add(normalUrl);

    const alt = img.getAttribute("alt") || undefined;
    const isGallery = img.closest('[class*="gallery"], [class*="product-image"], [id*="gallery"]');

    images.push({
      url: normalUrl,
      alt,
      width: width || undefined,
      height: height || undefined,
      isFeatured: images.length === 0 || !!isGallery,
    });
  }

  if (images.length > 1) {
    images[0].isFeatured = true;
  }

  return images;
}

function normalizeImageUrl(src: string): string | undefined {
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return undefined;
  if (src.startsWith("http")) return src;
  return undefined;
}
