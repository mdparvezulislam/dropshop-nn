/**
 * SmartParserService — 100% Offline Regex & Traditional NLP Text Extraction Utility
 * Project: DropshopNN Enterprise Commerce Operating System
 */

export interface ParsedSpecification {
  key: string;
  label?: string;
  value: string;
  group?: string;
  type?: "text" | "number" | "boolean" | "select";
}

export interface ParsedProductData {
  title: string;
  seoDescription: string;
  features: string[];
  specifications: ParsedSpecification[];
  keywords: string[];
  cleanText: string;
}

// Stop words dictionary (English + Bengali)
const ENGLISH_STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
  "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
  "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves", "buy", "online", "price", "bd", "bdt", "best",
  "product", "quality", "free", "delivery", "shop", "store",
]);

const BENGALI_STOP_WORDS = new Set([
  "এই", "সেই", "এর", "ও", "এবং", "জন্য", "টি", "টা", "করে", "হয়", "সহ",
  "থেকে", "বা", "না", "যা", "নিয়ে", "নিন", "দাম", "টাকা", "আছে", "করা",
  "একটি", "সব", "কোন", "আপনার", "আমাদের", "কি", "কেন", "এখনই", "অর্ডার",
  "ডেলিভারি", "সেরা", "কোয়ালিটি", "ফ্রি", "প্রোডাক্ট", "বাংলাদেশে",
]);

export class SmartParserService {
  /**
   * Main entry point: Parses raw HTML or text description into structured product data
   */
  public static parse(input: string): ParsedProductData {
    if (!input || typeof input !== "string") {
      return {
        title: "",
        seoDescription: "",
        features: [],
        specifications: [],
        keywords: [],
        cleanText: "",
      };
    }

    const cleanText = this.stripHtml(input);
    const title = this.extractTitle(input, cleanText);
    const specifications = this.extractSpecifications(cleanText);
    const features = this.extractFeatures(cleanText);
    const seoDescription = this.generateSeoDescription(cleanText, title);
    const keywords = this.extractKeywords(cleanText);

    return {
      title,
      seoDescription,
      features,
      specifications,
      keywords,
      cleanText,
    };
  }

  /**
   * 1. HTML Sanitization: Strips HTML tags and decodes common HTML entities
   */
  public static stripHtml(html: string): string {
    if (!html) return "";

    let text = html
      // Replace block tags with newline to preserve paragraph structure
      .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|table)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<hr\s*\/?>/gi, "\n")
      // Remove all remaining HTML tags
      .replace(/<[^>]*>/g, " ")
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&bull;/g, "•")
      .replace(/&check;/g, "✓");

    // Clean up multiple spaces and empty lines
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }

  /**
   * 2. Title Extraction: Grabs <h1> or <h2> tag content, or fallbacks to the 1st line
   */
  public static extractTitle(rawHtml: string, cleanText: string): string {
    // Try to extract from <h1> or <h2> HTML tags first
    const h1Match = rawHtml.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      const stripped = this.stripHtml(h1Match[1]).trim();
      if (stripped.length >= 3 && stripped.length <= 150) return stripped;
    }

    const h2Match = rawHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
    if (h2Match && h2Match[1]) {
      const stripped = this.stripHtml(h2Match[1]).trim();
      if (stripped.length >= 3 && stripped.length <= 150) return stripped;
    }

    // Fallback: Grab the very first line of clean plain text
    const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      const firstLine = lines[0];
      // Truncate if unusually long
      return firstLine.length > 120 ? firstLine.substring(0, 120).trim() + "..." : firstLine;
    }

    return "Untitled Product";
  }

  /**
   * 3. Specification Extraction (Regex matching Key: Value, Key - Value, Key = Value)
   */
  public static extractSpecifications(cleanText: string): ParsedSpecification[] {
    const specs: ParsedSpecification[] = [];
    const seenKeys = new Set<string>();

    const lines = cleanText.split("\n");
    // Match Key: Value, Key - Value, Key = Value patterns
    // Example: "Display: 6.5 inches", "RAM - 8GB", "Storage = 128GB"
    const specRegex = /^[\s\*\-\•\✓\➢\▪]*([A-Za-z0-9\s_\-\/\.\(\)]{2,40}?)\s*[:=\-]\s*(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) continue;

      const match = trimmed.match(specRegex);
      if (match && match[1] && match[2]) {
        const key = match[1].trim();
        const value = match[2].trim();

        // Validation: key must not be a sentence or URL
        if (
          key.length >= 2 &&
          key.length <= 35 &&
          !key.includes("http") &&
          !key.includes("www") &&
          key.split(" ").length <= 5 &&
          value.length >= 1 &&
          value.length <= 200
        ) {
          const keyLower = key.toLowerCase();
          if (!seenKeys.has(keyLower)) {
            seenKeys.add(keyLower);
            specs.push({
              key,
              label: key,
              value,
              group: "General",
              type: "text",
            });
          }
        }
      }
    }

    return specs;
  }

  /**
   * 4. Feature Extraction (List Parsing): Extracts lines starting with bullets
   */
  public static extractFeatures(cleanText: string): string[] {
    const features: string[] = [];
    const lines = cleanText.split("\n");

    // Matches bullets: -, *, •, ✓, ➢, ▪, ►, or numbered lists: 1., 2.
    const bulletRegex = /^[\s]*[\-\*\•\✓\➢\▪\►\d+\.]+\s*(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const match = trimmed.match(bulletRegex);
      if (match && match[1]) {
        const feat = match[1].trim();
        // Discard if too short or if it's a key-value spec
        if (feat.length >= 4 && !feat.includes(":") && !features.includes(feat)) {
          features.push(feat);
        }
      }
    }

    return features;
  }

  /**
   * 5. SEO Description Generation: Grabs first 150-160 chars trimmed to nearest word
   */
  public static generateSeoDescription(cleanText: string, title?: string): string {
    if (!cleanText) return "";

    const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean);

    // Skip the title if it's the first line
    let sourceText = lines.join(" ");
    if (title && lines[0] === title) {
      sourceText = lines.slice(1).join(" ");
    }

    if (!sourceText) sourceText = cleanText;

    if (sourceText.length <= 160) {
      return sourceText;
    }

    // Cut at 155 chars and trim to nearest full word
    const sub = sourceText.substring(0, 155);
    const lastSpace = sub.lastIndexOf(" ");
    if (lastSpace > 100) {
      return sub.substring(0, lastSpace).trim() + "...";
    }

    return sub.trim() + "...";
  }

  /**
   * 6. Keyword Extraction (Basic NLP with Term Frequency & Stop Words Filter)
   */
  public static extractKeywords(cleanText: string, limit = 8): string[] {
    if (!cleanText) return [];

    // Normalize text: lowercase & strip special characters/punctuation
    const sanitized = cleanText
      .toLowerCase()
      .replace(/[^\w\s\u0980-\u09FF]/g, " ")
      .replace(/\s+/g, " ");

    const words = sanitized.split(" ");
    const frequencyMap: Record<string, number> = {};

    for (const word of words) {
      const trimmed = word.trim();
      // Ignore numbers, short words, and stop words
      if (
        trimmed.length >= 3 &&
        !/^\d+$/.test(trimmed) &&
        !ENGLISH_STOP_WORDS.has(trimmed) &&
        !BENGALI_STOP_WORDS.has(trimmed)
      ) {
        frequencyMap[trimmed] = (frequencyMap[trimmed] || 0) + 1;
      }
    }

    // Sort by term frequency descending
    const sorted = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    return sorted.slice(0, limit);
  }
}

export default SmartParserService;
