import type { Product } from "@/features/catalog/domain/product-entity";
import { SITE_NAME, SITE_URL } from "@/config/site";

export interface ProductJsonLdInput {
  product: Product;
  /** BDT major units. */
  price: number;
  /** Real strike-through price in BDT, when one exists. */
  comparePrice?: number;
  currency?: string;
  /** Resolved brand NAME (never an id). Omit when unknown. */
  brandName?: string;
  /** Real availability from the inventory engine. */
  inStock: boolean;
  /** Real published-review aggregate. Omitted entirely when count is 0. */
  rating?: { average: number; count: number };
}

function absoluteUrl(url: string): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function generateProductJsonLd(input: ProductJsonLdInput) {
  const { product, price, currency = "BDT", brandName, inStock, rating } = input;
  const featuredMedia = product.media?.find((m) => m.isFeatured) || product.media?.[0];
  const imageUrl = featuredMedia ? absoluteUrl(featuredMedia.url) : "";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.metaDescription || product.name,
    sku: product.sku,
    image: imageUrl ? [imageUrl] : undefined,
    brand: brandName ? { "@type": "Brand", name: brandName } : undefined,
    // aggregateRating is emitted ONLY from real published reviews. Emitting it
    // without reviews is a Google structured-data violation.
    aggregateRating:
      rating && rating.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: rating.average,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    offers:
      price > 0
        ? {
            "@type": "Offer",
            url: `${SITE_URL}/product/${product.slug}`,
            priceCurrency: currency,
            price,
            itemCondition: "https://schema.org/NewCondition",
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: SITE_NAME },
          }
        : undefined,
  };
}

export interface BreadcrumbJsonLdItem {
  name: string;
  href: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbJsonLdItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export interface ItemListJsonLdEntry {
  name: string;
  slug: string;
  /** BDT major units; entries with no price are listed without an offer. */
  price?: number;
  inStock?: boolean;
}

export function generateItemListJsonLd(name: string, items: ItemListJsonLdEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/product/${item.slug}`,
      name: item.name,
    })),
  };
}
