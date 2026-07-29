import { URL } from "url";

export class UrlFetchError extends Error {
  constructor(
    message: string,
    public readonly code:
      "INVALID_URL" | "SSRF_BLOCKED" | "TIMEOUT" | "HTTP_ERROR" | "TOO_LARGE" | "NETWORK_ERROR",
  ) {
    super(message);
    this.name = "UrlFetchError";
  }
}

export interface FetchOptions {
  timeout?: number;
  maxSize?: number;
  maxRedirects?: number;
  userAgent?: string;
}

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // RFC 6598 carrier-grade NAT
  /^169\.254\./, // link-local, incl. the 169.254.169.254 cloud metadata endpoint
  /^::1$/,
  /^fc00:/,
  /^fd00:/,
  /^fe80:/,
];

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
]);

function isPrivateIP(ip: string): boolean {
  const normalized = ip.replace(/^\[|\]$/g, "").replace(/^::ffff:/i, "");
  return PRIVATE_IP_RANGES.some((range) => range.test(normalized));
}

async function resolveHostname(hostname: string): Promise<string[] | null> {
  const { promises: dns } = await import("dns");
  try {
    const [v4, v6] = await Promise.all([
      dns.resolve4(hostname).catch(() => [] as string[]),
      dns.resolve6(hostname).catch(() => [] as string[]),
    ]);
    const addresses = [...v4, ...v6];
    return addresses.length > 0 ? addresses : null;
  } catch {
    return null;
  }
}

function validateUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UrlFetchError("Invalid URL format", "INVALID_URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlFetchError("Only HTTP and HTTPS URLs are allowed", "INVALID_URL");
  }

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    throw new UrlFetchError("Localhost URLs are not allowed", "SSRF_BLOCKED");
  }

  // Catches literal-IP targets before any DNS lookup happens.
  if (isPrivateIP(hostname)) {
    throw new UrlFetchError("Private network addresses are not allowed", "SSRF_BLOCKED");
  }

  return url;
}

/**
 * Resolves the host and rejects private/link-local targets.
 *
 * A resolution failure is now treated as a block rather than a pass: the previous
 * implementation fell back to testing the raw hostname string against IP regexes,
 * which never matched, so any host DNS could not resolve was allowed through.
 */
async function assertPublicHost(url: URL): Promise<void> {
  const ips = await resolveHostname(url.hostname);
  if (!ips) {
    throw new UrlFetchError(`Could not resolve host: ${url.hostname}`, "SSRF_BLOCKED");
  }
  for (const ip of ips) {
    if (isPrivateIP(ip)) {
      throw new UrlFetchError(
        `Blocked SSRF attempt: ${url.hostname} resolves to private IP ${ip}`,
        "SSRF_BLOCKED",
      );
    }
  }
}

/** Runs the full URL + DNS guard. Applied to the initial URL and to every redirect hop. */
async function assertFetchable(rawUrl: string): Promise<URL> {
  const url = validateUrl(rawUrl);
  await assertPublicHost(url);
  return url;
}

function buildAbortSignal(timeout: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

export async function fetchPageHtml(
  rawUrl: string,
  options: FetchOptions = {},
): Promise<{ html: string; finalUrl: string }> {
  const {
    timeout = 15000,
    maxSize = 5 * 1024 * 1024,
    maxRedirects = 5,
    userAgent = "Mozilla/5.0 (compatible; NNEnterprise/1.0; +https://nnenterprise.com.bd/bot) AppleWebKit/537.36 (KHTML, like Gecko)",
  } = options;

  const url = await assertFetchable(rawUrl);

  const { signal, clear } = buildAbortSignal(timeout);

  try {
    let currentUrl: string = url.href;
    let redirectCount = 0;

    while (redirectCount <= maxRedirects) {
      const response = await fetch(currentUrl, {
        signal,
        headers: {
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        redirect: "manual",
      });

      if (response.status >= 300 && response.status < 400 && response.headers.has("location")) {
        redirectCount++;
        if (redirectCount > maxRedirects) {
          throw new UrlFetchError("Too many redirects", "HTTP_ERROR");
        }
        const location = response.headers.get("location")!;
        // Every hop is re-validated: a public URL that 302s to 127.0.0.1 or to the
        // 169.254.169.254 metadata endpoint would otherwise bypass the entry check.
        const nextUrl = new URL(location, currentUrl).href;
        currentUrl = (await assertFetchable(nextUrl)).href;
        continue;
      }

      if (!response.ok) {
        throw new UrlFetchError(`HTTP ${response.status}: ${response.statusText}`, "HTTP_ERROR");
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        throw new UrlFetchError(`Unsupported content type: ${contentType}`, "HTTP_ERROR");
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > maxSize) {
        throw new UrlFetchError("Response too large", "TOO_LARGE");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new UrlFetchError("No response body", "NETWORK_ERROR");
      }

      const chunks: Uint8Array[] = [];
      let totalSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalSize += value.length;
          if (totalSize > maxSize) {
            reader.cancel();
            throw new UrlFetchError("Response exceeded maximum size", "TOO_LARGE");
          }
          chunks.push(value);
        }
      }

      const decoder = new TextDecoder("utf-8", { fatal: false });
      const html =
        chunks.map((chunk) => decoder.decode(chunk, { stream: true })).join("") + decoder.decode();

      return { html, finalUrl: currentUrl };
    }

    throw new UrlFetchError("Unexpected redirect loop exit", "NETWORK_ERROR");
  } catch (err) {
    if (err instanceof UrlFetchError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new UrlFetchError("Request timed out", "TIMEOUT");
    }
    throw new UrlFetchError(`Network error: ${(err as Error).message}`, "NETWORK_ERROR");
  } finally {
    // Previously only cleared on the error path, leaving a live abort timer (and its
    // event-loop handle) behind after every successful fetch.
    clear();
  }
}
