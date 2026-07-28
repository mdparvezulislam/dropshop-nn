import { parse, HTMLElement, Node, TextNode } from "node-html-parser";

const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "div",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "blockquote",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "hr",
  "br",
  "code",
  "pre",
  "figure",
  "figcaption",
  "mark",
  "small",
  "sub",
  "sup",
]);

const ALLOWED_ATTRIBUTES = new Set([
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "class",
  "style",
  "id",
  "align",
  "colspan",
  "rowspan",
]);

const DANGEROUS_PATTERNS = [/javascript:/i, /data:text\/html/i, /vbscript:/i, /expression\s*\(/i];

/**
 * Sanitizes style string to ensure no script expressions or dangerous URLs are present.
 */
function sanitizeStyle(style: string): string {
  if (!style) return "";
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(style)) return "";
  }
  return style.trim();
}

/**
 * Sanitizes URL strings to prevent XSS via javascript: or data: URIs.
 */
function sanitizeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) return "#";
  }
  return trimmed;
}

/**
 * Recursively cleans DOM nodes using node-html-parser.
 */
function cleanNode(node: Node): Node | null {
  if (node instanceof TextNode) {
    return node;
  }

  if (node instanceof HTMLElement) {
    const tagName = node.tagName.toLowerCase();

    // Strip unsafe tags completely
    if (!ALLOWED_TAGS.has(tagName)) {
      return null;
    }

    // Clean attributes
    const attributes = { ...node.attributes };
    for (const attr of Object.keys(attributes)) {
      const lowerAttr = attr.toLowerCase();
      // Remove event handlers (e.g., onload, onclick) and unallowed attributes
      if (lowerAttr.startsWith("on") || !ALLOWED_ATTRIBUTES.has(lowerAttr)) {
        node.removeAttribute(attr);
        continue;
      }

      const val = attributes[attr];
      if (lowerAttr === "href" || lowerAttr === "src") {
        const safeUrl = sanitizeUrl(val);
        if (safeUrl !== val) {
          node.setAttribute(attr, safeUrl);
        }
      } else if (lowerAttr === "style") {
        const safeCss = sanitizeStyle(val);
        if (safeCss !== val) {
          if (safeCss) {
            node.setAttribute(attr, safeCss);
          } else {
            node.removeAttribute(attr);
          }
        }
      }
    }

    // Ensure external links have rel="noopener noreferrer"
    if (tagName === "a") {
      const href = node.getAttribute("href") || "";
      if (href.startsWith("http://") || href.startsWith("https://")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    }

    // Recursively clean children
    const childNodes = [...node.childNodes];
    for (const child of childNodes) {
      const cleanedChild = cleanNode(child);
      if (!cleanedChild) {
        node.removeChild(child);
      }
    }

    return node;
  }

  return null;
}

/**
 * Sanitizes rich text HTML content to protect against XSS while preserving
 * safe formatting, inline styles, layout blocks, lists, and images.
 */
export function sanitizeRichTextHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  try {
    const root = parse(html, {
      comment: false,
      blockTextElements: { script: false, style: false },
    });

    const childNodes = [...root.childNodes];
    for (const child of childNodes) {
      const cleaned = cleanNode(child);
      if (!cleaned) {
        root.removeChild(child);
      }
    }

    return root.toString();
  } catch (err) {
    console.error("Rich text sanitization failed:", err);
    return html;
  }
}

export default sanitizeRichTextHtml;
