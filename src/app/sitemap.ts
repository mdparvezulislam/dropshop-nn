import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";

const STATIC_ROUTES = [
  "",
  "/products",
  "/categories",
  "/brands",
  "/collections",
  "/offers",
  "/become-reseller",
  "/become-wholesale-partner",
  "/become-supplier",
  "/about",
  "/contact",
  "/blog",
  "/faq",
  "/privacy",
  "/terms",
  "/refund",
  "/help",
  "/shipping",
  "/careers",
  "/reviews",
  "/track-order",
] as const;

function staticEntries(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency:
      route === "" || route === "/products" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = staticEntries();

  try {
    const { products, categories, brands } = await new PublicCatalogService().getSitemapEntries();

    // Real lastModified only — entries without updatedAt omit the field
    // rather than stamping a fake freshness date.
    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      ...(p.updatedAt ? { lastModified: p.updatedAt } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      ...(c.updatedAt ? { lastModified: c.updatedAt } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const brandEntries: MetadataRoute.Sitemap = brands.map((b) => ({
      url: `${SITE_URL}/brands/${b.slug}`,
      ...(b.updatedAt ? { lastModified: b.updatedAt } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...statics, ...productEntries, ...categoryEntries, ...brandEntries];
  } catch {
    // DB unavailable — crawlers still get the static routes.
    return statics;
  }
}
