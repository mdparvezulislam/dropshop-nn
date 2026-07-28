import { BRAND } from "./brand";

/**
 * Single source of truth for the storefront's public identity.
 *
 * Every absolute URL emitted to crawlers (sitemap, robots, canonicals,
 * JSON-LD) must come from SITE_URL — never hardcode a domain elsewhere.
 * Override per environment with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? BRAND.websiteUrl
).trim();

export const SITE_NAME = BRAND.publicName;

export const SITE_LOCALE = "bn_BD";

/** Below or equal to this available quantity a tracked product shows "low stock". */
export const LOW_STOCK_THRESHOLD = 10;

/** Local product image fallback — never an external stock photo. */
export const PRODUCT_IMAGE_PLACEHOLDER = "/product-placeholder.svg";

/**
 * Shipping configuration (BDT). This is the single configured source for
 * delivery pricing until a courier/rates engine ships in a later phase.
 * Express/pickup entries are architecture placeholders — disabled until real.
 */
export interface ShippingMethodConfig {
  id: string;
  label: string;
  /** BDT major units. */
  cost: number;
  eta: string;
  enabled: boolean;
}

/**
 * Delivery is priced by zone, the way every BD courier quotes it: one rate
 * inside Dhaka city, another for the rest of the country. Checkout seeds the
 * zone from the chosen district and lets the customer correct it.
 */
export const SHIPPING_METHODS: ShippingMethodConfig[] = [
  {
    id: "inside_dhaka",
    label: "ঢাকার ভিতরে",
    cost: 60,
    eta: "১-২ কার্যদিবস",
    enabled: true,
  },
  {
    id: "outside_dhaka",
    label: "ঢাকার বাইরে",
    cost: 120,
    eta: "২-৩ কার্যদিবস",
    enabled: true,
  },
];

export const SHIPPING_METHOD_IDS = SHIPPING_METHODS.map((m) => m.id) as [string, ...string[]];

/** Payment method ids — selection is stored; gateway integrations are a later phase. */
export interface PaymentMethodConfig {
  id: string;
  label: string;
  hint?: string;
  enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "cod",
    label: "ক্যাশ অন ডেলিভারি",
    hint: "পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন",
    enabled: true,
  },
  { id: "bkash", label: "bKash", hint: "শীঘ্রই আসছে", enabled: false },
  { id: "nagad", label: "Nagad", hint: "শীঘ্রই আসছে", enabled: false },
  { id: "rocket", label: "Rocket", hint: "শীঘ্রই আসছে", enabled: false },
  { id: "sslcommerz", label: "কার্ড পেমেন্ট (SSLCommerz)", hint: "শীঘ্রই আসছে", enabled: false },
  { id: "bank_transfer", label: "ব্যাংক ট্রান্সফার", hint: "শীঘ্রই আসছে", enabled: false },
];

/**
 * Product Q&A ships behind a flag: the domain/actions exist so the contract is
 * stable, but the surface stays off until moderation staffing is in place.
 */
export const PRODUCT_QA_ENABLED = process.env.NEXT_PUBLIC_PRODUCT_QA_ENABLED === "true";

/** Recently-viewed history cap (client-side, per browser). */
export const RECENTLY_VIEWED_LIMIT = 12;
