import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/config/env";

/**
 * Signed order-access tokens.
 *
 * Grants a guest (no session) read access to exactly ONE order for a limited
 * time — issued at order placement for the success page, and the foundation
 * for future signed tracking links (email/SMS). HMAC-SHA256 keyed off
 * AUTH_SECRET; the token carries no PII, only orderNumber + expiry.
 *
 * Format: base64url(orderNumber).expiryEpochSeconds.base64url(hmac)
 */

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return env.AUTH_SECRET;
}

function sign(payload: string): Buffer {
  return createHmac("sha256", `order-access:${secret()}`).update(payload).digest();
}

export function createOrderAccessToken(
  orderNumber: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const encoded = Buffer.from(orderNumber, "utf8").toString("base64url");
  const signature = sign(`${encoded}.${exp}`).toString("base64url");
  return `${encoded}.${exp}.${signature}`;
}

/** Returns the orderNumber when the token is valid and unexpired, else null. */
export function verifyOrderAccessToken(token: string): string | null {
  try {
    const [encoded, expRaw, signature] = token.split(".");
    if (!encoded || !expRaw || !signature) return null;

    const exp = Number(expRaw);
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;

    const expected = sign(`${encoded}.${exp}`);
    const provided = Buffer.from(signature, "base64url");
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
      return null;
    }

    return Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
