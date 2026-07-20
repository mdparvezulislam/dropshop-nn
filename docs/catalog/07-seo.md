# 07 - SEO

## Overview

Each product has dedicated SEO fields for search engine optimization, social sharing, and rich snippets.

## SEO Fields

| Field                | Type     | Max         | Description                            |
| -------------------- | -------- | ----------- | -------------------------------------- |
| `metaTitle`          | String   | 70 chars    | Browser tab title and SERP title       |
| `metaDescription`    | String   | 160 chars   | SERP description                       |
| `metaKeywords`       | String[] | 20 keywords | SEO keywords                           |
| `canonicalUrl`       | String   | -           | Preferred URL for duplicate content    |
| `ogTitle`            | String   | 70 chars    | Open Graph title (overrides metaTitle) |
| `ogDescription`      | String   | 200 chars   | Open Graph description                 |
| `ogImage`            | String   | -           | Open Graph image URL                   |
| `ogType`             | String   | -           | Open Graph type (default: "product")   |
| `twitterTitle`       | String   | 70 chars    | Twitter Card title                     |
| `twitterDescription` | String   | 200 chars   | Twitter Card description               |
| `twitterImage`       | String   | -           | Twitter Card image                     |
| `twitterCardType`    | String   | -           | summary, summary_large_image           |

## SEO Defaults

If SEO fields are not explicitly set, the system generates defaults:

```
metaTitle: "{product.name} | {platform.name}"
metaDescription: "Buy {product.name} at {platform.name}. {shortDescription}"
ogImage: product.featuredImage
```

## Structured Data (Future)

Products will include JSON-LD structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "sku": "SKU-001",
  "brand": { "@type": "Brand", "name": "Brand Name" },
  "image": "https://...",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "BDT",
    "lowPrice": "1000"
  }
}
```

## OG / Twitter Card Resolution

The SEO service resolves the best available value:

```
ogTitle = ogTitle || metaTitle || product.name
ogDescription = ogDescription || metaDescription || shortDescription
ogImage = ogImage || featuredImage
```

## SEO Event

When SEO is updated, `SEOUpdated` event is published to trigger:

- Search reindex
- Sitemap regeneration
- Cache invalidation
