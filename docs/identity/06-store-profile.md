# 06 - Store Profile

## Overview

Every reseller and wholesaler can customize their store profile. The store profile represents the public-facing storefront for their customers.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `storeName` | String | Yes | Public store name |
| `storeSlug` | String | Yes | URL-friendly identifier |
| `storeLogo` | String | No | Store logo URL |
| `storeBanner` | String | No | Store banner URL |
| `theme` | String | No | Visual theme identifier |
| `color` | String | No | Brand accent color |
| `description` | String | No | Store description |
| `contactPhone` | String | No | Store contact phone |
| `contactEmail` | String | No | Store contact email |
| `facebook` | String | No | Facebook page URL |
| `instagram` | String | No | Instagram URL |
| `youtube` | String | No | YouTube URL |
| `whatsapp` | String | No | WhatsApp number |
| `telegram` | String | No | Telegram handle |

## Store Slug

The store slug is auto-generated from the store name and must be unique:
```
"My Awesome Store" → "my-awesome-store"
"If taken"        → "my-awesome-store-1"
```

## Store Profile Binding

```
Business Profile (1) ──── (0..1) Store Profile (1) ──── (1) User
```

Each business profile can have zero or one store profile. Store profiles are created after business approval.

## Theme Customization

Future theme support:
- Predefined theme templates
- Custom color schemes
- Custom CSS overrides
- Logo and banner positioning

## Events

Store profile mutations publish events:
- `identity.store_created`
- `identity.store_updated`
