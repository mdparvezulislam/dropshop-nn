import { BRAND } from "@/config/brand";

export function estimateReadingTime(html?: string, wpm = 200): number {
  if (!html) return 1;
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / wpm));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function extractTableOfContents(html?: string): TocHeading[] {
  if (!html) return [];
  const headings: TocHeading[] = [];
  const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(html)) !== null) {
    const level = Number(match[1]);
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    const id = `heading-${index}-${text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 48)}`;
    headings.push({ id, text, level });
    index += 1;
  }

  return headings;
}

export function injectHeadingIds(html?: string, toc?: TocHeading[]): string {
  if (!html || !toc?.length) return html ?? "";
  let i = 0;
  return html.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    const heading = toc[i];
    i += 1;
    if (!heading) return full;
    if (/\sid=/.test(attrs)) return full;
    return `<h${level}${attrs} id="${heading.id}">${inner}</h${level}>`;
  });
}

export function formatBlogDate(date?: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildArticleJsonLd(input: {
  title: string;
  description?: string;
  slug: string;
  coverImage?: string;
  authorName?: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  baseUrl?: string;
}): Record<string, unknown> {
  const base = input.baseUrl ?? BRAND.websiteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.coverImage ? [input.coverImage] : undefined,
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : { "@type": "Organization", name: BRAND.publicName },
    datePublished: input.publishedAt ? new Date(input.publishedAt).toISOString() : undefined,
    dateModified: input.updatedAt
      ? new Date(input.updatedAt).toISOString()
      : input.publishedAt
        ? new Date(input.publishedAt).toISOString()
        : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${base}/blog/${input.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "NN Enterprise",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
