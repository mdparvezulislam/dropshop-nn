# Product Studio & Catalog System Specification
**Project Core Identity:** DropshopNN Enterprise E-Commerce Platform  
**Public Brand Identity:** NN Enterprise  
**Module:** Product Studio (Create, Edit, Quick Parse, Details Console)  
**Version:** 3.0.0 (Enterprise Production Spec)

---

## 1. Executive Summary & Architectural Principles

The Product Studio is a high-performance, mobile-first, domain-driven product management suite built for Next.js App Router and Tailwind CSS v4. It unifies product drafting, rich description editing, media asset management, variant matrix generation, pricing/margin engines, SEO optimization, and section-aware AI text parsing.

### Core Principles
- **Strict Separation of Concerns**: UI Components -> Server Actions (Zod validated) -> Domain Services -> Repositories -> Mongoose Models.
- **Decimal-Free Currency Standard**: Integer-based currency formatting in Taka (`৳ 3,700` without decimal `,00` or `.00`), backed by minor-unit (cents) storage in the database.
- **High Touch-Density Mobile App UI**: Rounded 2xl cards, backdrop-blur tabs, zero layout shift, compact spacing without wasteful padding.
- **Section-Aware AI Parsing**: Regex + NLP boundary parser that categorizes raw product copy into Features, Specs, Usage Steps, Package Contents, and Notices without cross-contamination.

---

## 2. Core Domain Data Models & Schemas

### 2.1 Product Entity & Schema (`src/features/catalog/domain/product-entity.ts`)

```typescript
export interface ProductMedia {
  id: string;
  url: string;
  type: "image" | "video" | "document";
  isFeatured: boolean;
  altText?: string;
  caption?: string;
  imagekitFileId?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name?: string;
  priceAdjustment: number; // Minor units (cents)
  stock: number;
  image?: string;
  status?: "active" | "inactive";
  isActive?: boolean;
  color?: string;
  size?: string;
  storage?: string;
  ram?: string;
  capacity?: string;
  material?: string;
  weight?: number; // Grams
  attributes?: Record<string, string>;
}

export interface ProductSpecification {
  key: string;
  value: string;
  group?: string;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;
  ogImage?: string;
}

export interface Product extends BaseDBEntity {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  gtin?: string;
  productType?: "simple" | "variable" | "digital" | "bundle";
  shortDescription?: string;
  description?: string;
  notice?: string;
  productModel?: string;
  brandId?: string;
  categoryId?: string;
  supplierId?: string;
  status: "draft" | "pending_review" | "active" | "inactive" | "archived";
  visibility: "public" | "private" | "reseller_only" | "wholesale_only";
  badges: string[];
  featured?: boolean;
  trending?: boolean;
  flashSale?: boolean;
  newArrival?: boolean;
  hasVariants?: boolean;
  variants: ProductVariant[];
  media: ProductMedia[];
  videoUrl?: string; // YouTube Showcase Video URL
  specifications: ProductSpecification[];
  bulletFeatures?: string[];
  tags: string[];
  seo?: ProductSEO;
}
```

### 2.2 Pricing Entity (`src/features/pricing/domain/pricing-entity.ts`)

```typescript
export interface ProductPricing extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  baseCostPrice: number;    // Minor units (cents) -> e.g., ৳1,500 = 150000
  sellingPrice: number;     // Minor units (cents) -> Retail Price
  resellerPrice: number;    // Minor units (cents) -> Reseller Price (MUST >= baseCostPrice)
  wholesalePrice: number;   // Minor units (cents) -> Bulk Wholesale Price
  comparePrice: number;     // Minor units (cents) -> Original MRP
  campaignPrice?: number;   // Minor units (cents) -> Flash Sale Price
  currency: string;         // e.g. "BDT" or "USD"
  manualPriceOverrides?: Record<string, boolean>;
  status: "active" | "inactive" | "scheduled" | "expired";
}
```

### 2.3 Studio Form State (`src/features/product-studio/hooks/use-product-studio.ts`)

```typescript
export interface StudioFormState {
  name: string;
  productType: "simple" | "variable" | "digital" | "bundle";
  templateId: string;
  sku: string;
  shortDescription: string;
  richDescription: string;
  productModel: string;
  barcode: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  tags: string[];
  visibility: string;
  status: string;
  featured: boolean;
  trending: boolean;
  flashSale: boolean;
  newArrival: boolean;
  warranty: string;
  returnPolicy: string;
  notice?: string;
  badges?: string[];
  specifications?: ProductSpecification[];

  /* Financials */
  costPrice: string;       // Form string in Taka (৳)
  sellingPrice: string;    // Form string in Taka (৳)
  wholesalePrice: string;  // Form string in Taka (৳)
  resellerPrice: string;   // Form string in Taka (৳)
  comparePrice: string;    // Form string in Taka (৳)
  campaignPrice: string;   // Form string in Taka (৳)
  manualPriceOverrides?: Record<string, boolean>;

  /* Inventory */
  inventorySku: string;
  inventoryBarcode: string;
  stock: string;           // Direct quick-stock quantity
  reservedStock: string;
  incomingStock: string;
  lowStockThreshold: string;
  warehouseLocation: string;
  weight: string;

  /* Media & Variants */
  variants: ProductVariant[];
  media: ProductMedia[];
  videoUrl?: string;       // YouTube URL
  bulletFeatures: string[];
  selectedCollectionIds: string[];
  channels: string[];

  /* SEO */
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  slug: string;
  ogImage: string;
}
```

---

## 3. Studio 6-Tab UI/UX Architecture

The Studio uses a 6-tab header navigation layout (`STUDIO_TABS`):

```typescript
export const STUDIO_TABS = [
  { value: "basic", label: "Product Details", icon: Info },
  { value: "pricing", label: "Pricing & Stock", icon: DollarSign },
  { value: "media", label: "Media & Video Studio", icon: ImageIcon },
  { value: "variants", label: "Variant Studio Matrix", icon: LayoutGrid },
  { value: "seo", label: "SEO & Publishing", icon: Search },
  { value: "preview", label: "Live Preview", icon: Eye },
];
```

### Tab Breakdown & Field Groupings

| Tab Index | Tab Key | Purpose & Component Hierarchy |
| :--- | :--- | :--- |
| **Tab 1** | `basic` | **Product Details**<br>1. `GeneralSection`: Product Title *, Base SKU *, **Available Stock Quantity (Pcs) \***, Model Number, Barcode, Short Pitch.<br>2. `LazyDescriptionSection`: Rich Text Editor & Quality Notice.<br>3. `FeaturesEditor`: Bullet points list.<br>4. `CategorySection` & `BrandSection` & `BadgesStudioSection`.<br>5. `InlineSpecEditor`: Specifications table. |
| **Tab 2** | `pricing` | **Pricing & Stock**<br>1. `PricingSection`: Cost Price, Selling Price *, Reseller Price (with margin calculation), Wholesale Price, Compare Price.<br>2. `CostStudioSection`: Cost breakdown.<br>3. `InventorySection`: Low Stock Threshold, Warehouse Location, Weight. |
| **Tab 3** | `media` | **Media & Video Studio** (Always-open Card)<br>1. `ImageKit Dropzone`: Drag-and-drop, clipboard paste, WebP conversion.<br>2. `Gallery Grid`: Re-order, primary cover image selector, alt text editor.<br>3. `YouTube Video Showcase`: Input field + real-time YouTube Video ID extractor & responsive player iframe. |
| **Tab 4** | `variants` | **Variant Studio Matrix**<br>1. Attribute Generator (Color, Size, RAM, Storage, Material).<br>2. Bulk Matrix Generator.<br>3. Variant Table with SKU, Price Adjustment, Stock & Image per variant. |
| **Tab 5** | `seo` | **SEO & Publishing**<br>1. `SEOAdvancedSection`: Meta Title, Meta Description, URL Slug, Auto-generated Phrase Keywords.<br>2. `CollectionsChannelsSection` & `LazySupplierStudioSection`.<br>3. `LazyPublishingStudioSection`: Status, Scheduled Publish, Health Score. |
| **Tab 6** | `preview` | **Live Preview**<br>Storefront Product Mockup preview. |

---

## 4. Smart Product Parse (Magic Parse) Engine

The Smart Parser (`SmartParserService`) parses raw supplier text or Bengali/English hybrid product descriptions using section boundary matching and keyword filters.

### 4.1 Section Boundary Delineation Matrix

```
┌─────────────────────────────────────────────────────────┐
│ 1. Product Title (First line or <h1>/<h2>)               │
├─────────────────────────────────────────────────────────┤
│ 2. Intro Summary Pitch                                  │
├─────────────────────────────────────────────────────────┤
│ 🔥 Why Buy This Product? (WHY BUY HEADER)              │
│    ➜ Parsed into `bulletFeatures`                       │
│    (Excludes spec pairs via `isSpecPair` filter)        │
├─────────────────────────────────────────────────────────┤
│ ⚙️ Key Features & Specifications (SPECS HEADER)         │
│    ➜ Parsed into `specifications` (Key: Value)          │
├─────────────────────────────────────────────────────────┤
│ 📖 How to Use (USAGE HEADER)                            │
│    ➜ Parsed into `howToUse` -> HTML <ol> list           │
├─────────────────────────────────────────────────────────┤
│ 📦 Package Includes (PACKAGE HEADER)                    │
│    ➜ Parsed into `packageContents` -> HTML <ul> list    │
├─────────────────────────────────────────────────────────┤
│ ✅ Quality Assurance & Warranty (QA HEADER)             │
│    ➜ Parsed into `notice` & `warranty`                  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Specification Exclusion Filter (`isSpecPair`)

To prevent specification key-value pairs (e.g. `Brand: Prestige`, `Power: 1500W`) from leaking into `bulletFeatures`, `extractFeatures` evaluates every candidate line:

```typescript
const isSpecPair = (line: string): boolean => {
  const parts = line.split(/[:=\-ঃ]/);
  if (parts.length === 2) {
    const key = parts[0].replace(/^[🔥⚙️📖📦✅\s\-\*\•\✓\➢\▪\►\d+\.]+\s*/, "").trim();
    const val = parts[1].trim();
    const isKnownSpecKey = /^(brand|model|capacity|power|consumption|pot|material|switch|lid|safety|warranty|origin|color|weight|size|sku)/i.test(key);
    if (isKnownSpecKey || (key.length <= 25 && val.length <= 35)) {
      return true;
    }
  }
  return false;
};
```

### 4.3 Phrase-Level SEO Keyword Generator

`generateSeoKeywords` generates multi-word phrase combinations from the product title plus high-intent e-commerce search variations:

```typescript
public static generateSeoKeywords(title: string, cleanText: string): string[] {
  const keywordSet = new Set<string>();

  if (title) {
    const cleanTitle = title.trim().toLowerCase();
    keywordSet.add(cleanTitle);

    const words = cleanTitle
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !ENGLISH_STOP_WORDS.has(w) && !BENGALI_STOP_WORDS.has(w));

    // Generate 2-word & 3-word bi-grams / tri-grams
    for (let i = 0; i < words.length - 1; i++) {
      keywordSet.add(`${words[i]} ${words[i + 1]}`);
      if (i < words.length - 2) {
        keywordSet.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }

    if (words.length >= 2) {
      keywordSet.add(`${words.slice(-2).join(" ")} price in bd`);
      keywordSet.add(`${words[0]} ${words[words.length - 1]}`);
    }
  }

  const topWords = this.extractKeywords(cleanText, 10);
  for (const w of topWords) {
    if (w.length >= 3) keywordSet.add(w.toLowerCase());
  }

  return Array.from(keywordSet).slice(0, 15);
}
```

---

## 5. Reseller Price Validation & Price Editing System

### 5.1 Business Rule Constraint

$$\text{resellerPrice} \ge \text{baseCostPrice}$$

- **Condition**: Reseller Price must be greater than or equal to Base Cost Price.
- **Validation**: If $\text{resellerPrice} < \text{baseCostPrice}$, form submission is blocked, displaying a red UI badge (`Below Cost Price`) and error toast: `"রিসেলার প্রাইস (৳${reseller}) অবশ্যই কস্ট প্রাইসের (৳${cost}) চেয়ে বেশি বা সমান হতে হবে!"`.
- **Margin Display**: Real-time margin calculator displays profit amount in Taka ($+\text{৳ Margin}$) and profit percentage ($\%\text{ Margin}$).

### 5.2 EditProductPricingModal Component

```typescript
// Minor units conversion helper on save:
const handleSave = async () => {
  if (reseller < cost) {
    toast.error(`রিসেলার প্রাইস (৳${reseller}) অবশ্যই কস্ট প্রাইসের (৳${cost}) চেয়ে বেশি বা সমান হতে হবে!`);
    return;
  }

  setLoading(true);
  try {
    const res = await updatePricingAction(pricingId, {
      baseCostPrice: Math.round(cost * 100),
      sellingPrice: Math.round(selling * 100),
      resellerPrice: Math.round(reseller * 100),
      wholesalePrice: Math.round(wholesale * 100),
      comparePrice: Math.round(compare * 100),
    });

    if (res.success) {
      toast.success("প্রাইসিং ও রিসেলার প্রাইস সফলভাবে আপডেট করা হয়েছে!");
      if (onSuccess) onSuccess();
      onClose();
    }
  } finally {
    setLoading(false);
  }
};
```

---

## 6. YouTube Video ID Extractor & Showcase Player

Utility to extract 11-character YouTube video IDs from any standard link:

```typescript
export function extractYoutubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
```

### Player Component

```tsx
{youtubeUrl && extractYoutubeId(youtubeUrl) && (
  <div className="rounded-xl overflow-hidden border border-border aspect-video max-w-2xl shadow-lg">
    <iframe
      className="w-full h-full"
      src={`https://www.youtube.com/embed/${extractYoutubeId(youtubeUrl)}`}
      title="YouTube Video Player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
)}
```

---

## 7. Reusable Utility Functions

### 7.1 Currency Formatter (`src/features/order/utils/payment-utils.ts`)

```typescript
export function formatAmount(val: number): string {
  if (typeof val !== "number" || isNaN(val)) return "0";
  return Math.round(val).toLocaleString("en-US");
}
```

### 7.2 Price Display Helper (Minor Units to Taka)

```typescript
const BDT = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 });

export function formatPrice(minorUnits?: number | null): string {
  if (!minorUnits || minorUnits <= 0) return "—";
  return `৳${BDT.format(Math.round(minorUnits / 100))}`;
}
```

---

## 8. Verification & Quality Assurance Checklist

- [x] **TypeScript Compilation**: `npm run type-check` returns `0 errors`.
- [x] **ESLint Compliance**: `npm run lint` returns `0 errors`.
- [x] **Section Boundary Isolation**: Features do not contain key-value specification pairs.
- [x] **Reseller Price Safeguard**: Reseller price cannot be saved below cost price.
- [x] **Decimal Elimination**: Zero decimals displayed after BDT amounts.
- [x] **Mobile Responsiveness**: Clean, zero-overflow touch-friendly interfaces.
