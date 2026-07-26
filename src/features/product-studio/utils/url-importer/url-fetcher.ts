import { URL } from "url";
import { isIP } from "net";

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
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((range) => range.test(ip));
}

async function resolveHostname(hostname: string): Promise<string[]> {
  const { promises: dns } = await import("dns");
  try {
    const addresses = await dns.resolve4(hostname);
    return addresses;
  } catch {
    return [hostname];
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

  if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "0.0.0.0") {
    throw new UrlFetchError("Localhost URLs are not allowed", "SSRF_BLOCKED");
  }

  return url;
}

async function checkSsfr(url: URL): Promise<void> {
  try {
    const ips = await resolveHostname(url.hostname);
    for (const ip of ips) {
      if (isPrivateIP(ip)) {
        throw new UrlFetchError(
          `Blocked SSRF attempt: ${url.hostname} resolves to private IP ${ip}`,
          "SSRF_BLOCKED",
        );
      }
    }
  } catch (err) {
    if (err instanceof UrlFetchError) throw err;
  }
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
    userAgent = "Mozilla/5.0 (compatible; DropshopNN/1.0; +https://dropshopnn.com/bot) AppleWebKit/537.36 (KHTML, like Gecko)",
  } = options;

  const url = validateUrl(rawUrl);
  await checkSsfr(url);

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
        currentUrl = new URL(location, currentUrl).href;
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
    clear();
    if (err instanceof UrlFetchError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new UrlFetchError("Request timed out", "TIMEOUT");
    }
    throw new UrlFetchError(`Network error: ${(err as Error).message}`, "NETWORK_ERROR");
  }
}
