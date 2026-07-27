/**
 * The courier registry. Adding Pathao/Steadfast/RedX/eCourier/Paperfly support
 * is a matter of adding a row here plus (later) an API adapter — no business
 * logic in `FulfillmentService` changes.
 *
 * `integration` records the honest truth about each provider today:
 *   - "manual": the platform tracks the shipment; booking and tracking happen
 *     in the courier's own merchant panel and the operator types the tracking
 *     number back in. This is the current mode for every provider.
 *   - "api": a live adapter books and syncs automatically. No provider is in
 *     this mode yet — WEBSITE-009 deliberately ships no external API calls.
 */
export type CourierIntegrationMode = "manual" | "api";

export interface CourierProviderInfo {
  id: string;
  name: string;
  nameBn: string;
  /** `{code}` is replaced with the tracking number. Empty when the courier has no public tracker. */
  trackingUrlTemplate: string;
  supportsCod: boolean;
  integration: CourierIntegrationMode;
  /** Typical door-to-door time, shown as guidance to operators — never to customers as a promise. */
  note: string;
}

export const COURIER_PROVIDERS: readonly CourierProviderInfo[] = [
  {
    id: "pathao",
    name: "Pathao Courier",
    nameBn: "পাঠাও কুরিয়ার",
    trackingUrlTemplate: "https://merchant.pathao.com/tracking?consignment_id={code}",
    supportsCod: true,
    integration: "manual",
    note: "ঢাকায় দ্রুত, দেশজুড়ে কভারেজ",
  },
  {
    id: "steadfast",
    name: "Steadfast Courier",
    nameBn: "স্টেডফাস্ট কুরিয়ার",
    trackingUrlTemplate: "https://steadfast.com.bd/t/{code}",
    supportsCod: true,
    integration: "manual",
    note: "সারা দেশে COD সাপোর্ট",
  },
  {
    id: "redx",
    name: "RedX",
    nameBn: "রেডএক্স",
    trackingUrlTemplate: "https://redx.com.bd/track-parcel/?trackingId={code}",
    supportsCod: true,
    integration: "manual",
    note: "৬৪ জেলায় ডেলিভারি",
  },
  {
    id: "ecourier",
    name: "eCourier",
    nameBn: "ইকুরিয়ার",
    trackingUrlTemplate: "https://ecourier.com.bd/track?id={code}",
    supportsCod: true,
    integration: "manual",
    note: "ঢাকা ও চট্টগ্রামে শক্তিশালী",
  },
  {
    id: "paperfly",
    name: "Paperfly",
    nameBn: "পেপারফ্লাই",
    trackingUrlTemplate: "https://go.paperfly.com.bd/track/{code}",
    supportsCod: true,
    integration: "manual",
    note: "সারা দেশে হোম ডেলিভারি",
  },
  {
    id: "sundarban",
    name: "Sundarban Courier",
    nameBn: "সুন্দরবন কুরিয়ার",
    trackingUrlTemplate: "",
    supportsCod: true,
    integration: "manual",
    note: "কাউন্টার ডেলিভারি নেটওয়ার্ক",
  },
  {
    id: "custom",
    name: "Own Delivery / Other",
    nameBn: "নিজস্ব ডেলিভারি",
    trackingUrlTemplate: "",
    supportsCod: true,
    integration: "manual",
    note: "নিজস্ব রাইডার বা অন্য কুরিয়ার",
  },
] as const;

const BY_ID = new Map(COURIER_PROVIDERS.map((p) => [p.id, p]));

export const COURIER_PROVIDER_IDS = COURIER_PROVIDERS.map((p) => p.id);

export function getCourierProvider(id: string): CourierProviderInfo | undefined {
  return BY_ID.get(id.toLowerCase());
}

export function isSupportedCourier(id: string): boolean {
  return BY_ID.has(id.toLowerCase());
}

/** Display name for a provider id; falls back to the raw id so unknown data still reads. */
export function getCourierName(id?: string): string {
  if (!id) return "—";
  return BY_ID.get(id.toLowerCase())?.name ?? id;
}

export function getCourierNameBn(id?: string): string {
  if (!id) return "—";
  return BY_ID.get(id.toLowerCase())?.nameBn ?? id;
}

/**
 * Public tracking URL, or undefined when the courier has no public tracker or
 * no tracking number has been issued. Never returns a guessed link.
 */
export function buildTrackingUrl(providerId: string, trackingCode?: string): string | undefined {
  if (!trackingCode?.trim()) return undefined;
  const template = BY_ID.get(providerId.toLowerCase())?.trackingUrlTemplate;
  if (!template) return undefined;
  return template.replace("{code}", encodeURIComponent(trackingCode.trim()));
}
