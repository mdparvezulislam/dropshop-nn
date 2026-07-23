import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/reseller/",
        "/wholesale/",
        "/supplier/",
        "/account/",
        "/api/",
      ],
    },
    sitemap: "https://dropshop.com.bd/sitemap.xml",
  };
}
