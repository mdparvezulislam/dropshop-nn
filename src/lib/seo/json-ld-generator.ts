import type { Product } from "@/features/catalog/domain/product-entity";

export function generateProductJsonLd(product: Product, price: number, currency = "BDT") {
  const featuredMedia = product.media?.find((m) => m.isFeatured) || product.media?.[0];
  const imageUrl = featuredMedia ? featuredMedia.url : "";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.name,
    sku: product.sku,
    image: imageUrl ? [imageUrl] : undefined,
    brand: product.brandId
      ? {
          "@type": "Brand",
          name: product.brandId,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `https://dropshop.com.bd/product/${product.slug}`,
      priceCurrency: currency,
      price: price > 0 ? price : 0,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "DropshopNN Bangladesh",
      },
    },
  };
}
