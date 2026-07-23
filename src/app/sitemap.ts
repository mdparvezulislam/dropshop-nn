import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://dropshop.com.bd";

  const staticRoutes = [
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
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" || route === "/products" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.7,
  }));
}
