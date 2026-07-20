# 07 - Media Visibility

## Overview

Product media has role-based visibility rules. Media is organized into collections, each with a visibility scope. Unauthorized users cannot see, access, or discover restricted media URLs.

## Media Collections

| Collection             | Code                     | Visible To                                    | Media Types                                                                                       |
| ---------------------- | ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Public Gallery         | `public_gallery`         | Guest, Customer, Reseller, Wholesaler, Admin  | Images, Videos, Documents                                                                         |
| Reseller Marketing Kit | `reseller_marketing_kit` | Approved Reseller, Approved Wholesaler, Admin | HD Images, Facebook Posters, Short/Long Videos, Product Descriptions, Marketing Assets, ZIP Files |
| Wholesale Resources    | `wholesale_resources`    | Approved Wholesaler, Admin                    | Bulk Pricing Sheets, Wholesale Catalogs, Logos                                                    |
| Internal Assets        | `internal_assets`        | Admin, Support Staff                          | Raw Footage, Design Files, Internal Docs                                                          |

## Media Item Structure

```typescript
interface ProductMedia {
  url: string;
  type: "image" | "video" | "document" | "zip";
  collection:
    "public_gallery" | "reseller_marketing_kit" | "wholesale_resources" | "internal_assets";
  isFeatured: boolean;
  altText?: string;
  sortOrder: number;
}
```

## Access Rules

### Rule 1: Marketing Kit Access

```
IF media.collection == "reseller_marketing_kit"
AND user.role NOT IN ["reseller", "wholesaler", "admin", "super_admin"]
THEN → Access Denied
      Do NOT expose media URL
      Do NOT expose in API response
      Return 403 Forbidden
```

### Rule 2: Wholesale Resources Access

```
IF media.collection == "wholesale_resources"
AND user.role NOT IN ["wholesaler", "admin", "super_admin"]
THEN → Access Denied
```

### Rule 3: Internal Assets Access

```
IF media.collection == "internal_assets"
AND user.role NOT IN ["admin", "super_admin"]
THEN → Access Denied
```

## Enforcement

Media visibility is enforced at two layers:

1. **Service Layer**: Filter media arrays before returning to client
2. **API Layer**: Media URL endpoints check permissions before serving

## Media Visibility Filter

```typescript
function filterMediaByRole(media: ProductMedia[], role: string): ProductMedia[] {
  return media.filter((item) => {
    switch (item.collection) {
      case "reseller_marketing_kit":
        return ["reseller", "wholesaler", "admin", "super_admin"].includes(role);
      case "wholesale_resources":
        return ["wholesaler", "admin", "super_admin"].includes(role);
      case "internal_assets":
        return ["admin", "super_admin"].includes(role);
      case "public_gallery":
      default:
        return true;
    }
  });
}
```

## Event Publication

- `pricing.media_visibility_changed` — media collection assigned/changed
