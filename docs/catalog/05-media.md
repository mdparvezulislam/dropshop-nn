# 05 - Media System

## Overview

The media system manages all product visual assets. Media is stored externally (ImageKit) with URLs stored in the catalog.

## Media Types

| Type | Description | Status |
|------|-------------|--------|
| Featured Image | Primary product image | ✅ Current |
| Gallery Images | Additional product images | ✅ Current |
| Videos | Product videos (hosted URLs) | ✅ Current |
| Documents | Manuals, spec sheets | ✅ Current |
| 360 Images | Interactive product views | 🔮 Future |

## Media Structure

```typescript
interface ProductMedia {
  url: string;            // ImageKit URL
  type: "image" | "video" | "document";
  isFeatured: boolean;     // Only one featured image per product
  altText?: string;        // SEO alt text
  caption?: string;        // Display caption
  sortOrder: number;       // Display order
  width?: number;          // Image width
  height?: number;         // Image height
  fileSize?: number;       // Size in bytes
  mimeType?: string;       // MIME type
}
```

## Media Constraints

| Rule | Value |
|------|-------|
| Featured images per product | 1 |
| Gallery images max | 20 |
| Videos max | 5 |
| Documents max | 10 |
| Total media per product | 30 |

## Featured Image

The featured image is the primary product thumbnail used in:
- Product listing cards
- Search results
- Category pages
- Social share previews

## Image Variants (Future)

ImageKit transformations will provide:

| Variant | Size | Use |
|---------|------|-----|
| thumbnail | 150×150 | Grid listings |
| small | 300×300 | Card view |
| medium | 600×600 | Product detail |
| large | 1200×1200 | Zoom/lightbox |
| original | Full | Download |

## Video Handling

Videos are stored as URLs (YouTube, Vimeo, or direct MP4):
- Embedded via iframe/player
- Thumbnail extracted for listing
- Caption displayed below

## Document Handling

Documents include:
- User manuals (PDF)
- Warranty cards (PDF)
- Specification sheets (PDF)
- Certifications (PDF, image)

## Media Operations

| Operation | Description |
|-----------|-------------|
| Upload | Upload media to ImageKit, store URL |
| Set featured | Set primary image |
| Reorder | Change display order |
| Delete | Remove media (soft-delete) |
| Update alt text | Update SEO alt text |

## Validation

- All URLs must be valid
- Image URLs must come from ImageKit
- Only one featured image per product
- Sort order must be unique per product
