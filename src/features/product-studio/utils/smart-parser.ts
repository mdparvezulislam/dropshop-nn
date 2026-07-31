/**
 * SmartParserService — 100% Offline Regex & Traditional NLP Text Extraction Utility
 * Project: NN Enterprise Enterprise Commerce Operating System
 *
 * V2-002 Enhancements:
 * - extractBrand: First known brand word from clean text
 * - extractModel: Alphanumeric model code after brand
 * - extractCategory: Category keyword matching
 * - extractWarranty: Warranty period extraction
 * - extractPackageContents: "Includes" list detection
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
  /* V2-002: Enhanced extraction */
  brand?: string;
  model?: string;
  category?: string;
  categoryCode?: string;
  warranty?: string;
  packageContents?: string[];
  howToUse?: string[];
  notice?: string;
}

// Stop words dictionary (English + Bengali)
const ENGLISH_STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "let's",
  "me",
  "more",
  "most",
  "mustn't",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "you",
  "all",
  "can",
  "had",
  "her",
  "was",
  "one",
  "our",
  "out",
  "has",
  "have",
  "been",
  "some",
  "same",
  "than",
  "that",
  "them",
  "then",
  "they",
  "this",
  "very",
  "just",
  "also",
  "with",
  "buy",
  "new",
  "best",
  "free",
  "shop",
  "online",
  "price",
  "bdt",
  "product",
  "quality",
  "delivery",
  "store",
  "bangladesh",
  "dropshop",
]);

const BENGALI_STOP_WORDS = new Set([
  "এই",
  "সেই",
  "এর",
  "ও",
  "এবং",
  "জন্য",
  "টি",
  "টা",
  "করে",
  "হয়",
  "সহ",
  "থেকে",
  "বা",
  "না",
  "যা",
  "নিয়ে",
  "নিন",
  "দাম",
  "টাকা",
  "আছে",
  "করা",
  "একটি",
  "সব",
  "কোন",
  "আপনার",
  "আমাদের",
  "কি",
  "কেন",
  "এখনই",
  "অর্ডার",
  "ডেলিভারি",
  "সেরা",
  "কোয়ালিটি",
  "ফ্রি",
  "প্রোডাক্ট",
  "বাংলাদেশে",
]);

/* ─── Category keyword map (pure, no React dependency) ─── */

const PARSER_CATEGORY_MAP: Record<string, string> = {
  cable: "Cables & Chargers",
  charger: "Cables & Chargers",
  charging: "Cables & Chargers",
  usb: "Cables & Chargers",
  typec: "Cables & Chargers",
  lightning: "Cables & Chargers",
  speaker: "Audio & Speaker",
  earbuds: "Audio & Speaker",
  headphones: "Audio & Speaker",
  earphone: "Audio & Speaker",
  tws: "Audio & Speaker",
  bluetooth: "Audio & Speaker",
  audio: "Audio & Speaker",
  powerbank: "Power Bank",
  "power bank": "Power Bank",
  battery: "Power Bank",
  mah: "Power Bank",
  router: "Networking",
  wifi: "Networking",
  network: "Networking",
  ethernet: "Networking",
  watch: "Smart Watches",
  smartwatch: "Smart Watches",
  wearable: "Smart Watches",
  camera: "Camera & Accessories",
  drone: "Camera & Accessories",
  light: "Lighting",
  led: "Lighting",
  mouse: "Computer Peripherals",
  keyboard: "Computer Peripherals",
  monitor: "Computer Peripherals",
  laptop: "Computer Peripherals",
  phone: "Mobile Accessories",
  case: "Mobile Accessories",
  bag: "Bags & Cases",
  backpack: "Bags & Cases",
  fan: "Home Utility",
  vacuum: "Home Utility",
  robot: "Smart Home",
  smart: "Smart Home",
  sensor: "Smart Home",
  car: "Car Accessories",
};

/* ─── Brand keyword map (pure) ─── */

const PARSER_BRAND_MAP: Record<string, string> = {
  hoco: "Hoco",
  baseus: "Baseus",
  anker: "Anker",
  ugreen: "Ugreen",
  xiaomi: "Xiaomi",
  samsung: "Samsung",
  apple: "Apple",
  jbl: "JBL",
  sony: "Sony",
  aukey: "Aukey",
  mcdodo: "Mcdodo",
  remax: "Remax",
  joyroom: "Joyroom",
  qcy: "QCY",
  haylou: "Haylou",
  kospet: "Kospet",
  tky: "TKY",
  realme: "Realme",
  oneplus: "OnePlus",
  oppo: "Oppo",
  vivo: "Vivo",
  huawei: "Huawei",
  honor: "Honor",
  lg: "LG",
  toshiba: "Toshiba",
  panasonic: "Panasonic",
  philips: "Philips",
  bose: "Bose",
  mi: "Xiaomi",
  redmi: "Redmi",
  poco: "POCO",
  nokia: "Nokia",
  motorola: "Motorola",
  dell: "Dell",
  hp: "HP",
  lenovo: "Lenovo",
  asus: "Asus",
  acer: "Acer",
  canon: "Canon",
  nikon: "Nikon",
};

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
    const keywords = this.generateSeoKeywords(title, cleanText);
    const brand = this.extractBrand(cleanText);
    const model = this.extractModel(cleanText, brand);
    const category = this.extractCategory(cleanText);
    const warranty = this.extractWarranty(cleanText);
    const packageContents = this.extractPackageContents(cleanText);
    const howToUse = this.extractHowToUse(cleanText);
    const notice = this.extractNotice(cleanText);

    return {
      title,
      seoDescription,
      features,
      specifications,
      keywords,
      cleanText,
      brand,
      model,
      category,
      warranty,
      packageContents,
      howToUse,
      notice,
    };
  }

  /**
   * 1. HTML Sanitization: Strips HTML tags and decodes common HTML entities
   */
  public static stripHtml(html: string): string {
    if (!html) return "";

    const text = html
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
    const lines = cleanText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length > 0) {
      const firstLine = lines[0];
      // Truncate if unusually long
      return firstLine.length > 120 ? firstLine.substring(0, 120).trim() + "..." : firstLine;
    }

    return "Untitled Product";
  }

  /**
   * 3. Specification Extraction (Section-Aware + Regex matching Key: Value)
   */
  public static extractSpecifications(cleanText: string): ParsedSpecification[] {
    const specs: ParsedSpecification[] = [];
    const seenKeys = new Set<string>();
    const lines = cleanText.split("\n");

    const specsHeader = /(বিশেষ\s*বৈশিষ্ট্য\s*ও\s*স্পেসিফিকেশন|specifications|স্পেসিফিকেশন|technical\s*specs)/i;
    const nextHeader = /(কীভাবে\s*ব্যবহার\s*করবেন|how\s*to\s*use|প্যাকেজে\s*যা\s*যা\s*থাকছে|package\s*includes|quality\s*assurance|গ্যারান্টি)/i;

    let inSpecsSection = false;
    const specRegex = /^[\s\*\-\•\✓\➢\▪\⚙️]*([A-Za-z0-9ঀ-৿\s_\-\/\.\(\)]{2,50}?)\s*[:=\-ঃ]\s*(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (specsHeader.test(trimmed)) {
        inSpecsSection = true;
        continue;
      }

      if (inSpecsSection && nextHeader.test(trimmed)) {
        inSpecsSection = false;
        break;
      }

      // If we are in the dedicated specs section, OR if section headers don't exist in text at all
      if (inSpecsSection || !cleanText.match(specsHeader)) {
        const match = trimmed.match(specRegex);
        if (match && match[1] && match[2]) {
          const key = match[1].replace(/^[⚙️🔥📖📦✅\s]+/, "").trim();
          const value = match[2].trim();

          if (
            key.length >= 2 &&
            key.length <= 40 &&
            !key.includes("http") &&
            !key.includes("www") &&
            key.split(" ").length <= 7 &&
            value.length >= 1 &&
            value.length <= 250
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
    }

    return specs;
  }

  /**
   * 4. Feature Extraction (Section-Aware: Why Buy / Features section)
   */
  public static extractFeatures(cleanText: string): string[] {
    const features: string[] = [];
    const lines = cleanText.split("\n");

    const featuresHeader = /(কেন\s*নেবেন\s*এই\s*প্রোডাক্টটি|why\s*buy\s*this\s*product|কেন\s*কিনবেন|key\s*highlights|features)/i;
    const specsHeader = /(বিশেষ\s*বৈশিষ্ট্য\s*ও\s*স্পেসিফিকেশন|specifications|স্পেসিফিকেশন|technical\s*specs|কীভাবে\s*ব্যবহার\s*করবেন|how\s*to\s*use)/i;

    let inFeaturesSection = false;
    const bulletRegex = /^[\s]*[\-\*\•\✓\➢\▪\►\d+\.]+\s*(.+)$/;

    // Helper: test if line is a short key-value spec pair (e.g. Brand: Prestige, Model: XYZ)
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

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (featuresHeader.test(trimmed)) {
        inFeaturesSection = true;
        continue;
      }

      if (inFeaturesSection && specsHeader.test(trimmed)) {
        inFeaturesSection = false;
        break;
      }

      if (inFeaturesSection) {
        const cleanLine = trimmed.replace(/^[🔥⚙️📖📦✅\s\-\*\•\✓\➢\▪\►\d+\.]+\s*/, "").trim();
        if (cleanLine.length >= 4 && !isSpecPair(cleanLine) && !features.includes(cleanLine)) {
          features.push(cleanLine);
        }
      } else if (!cleanText.match(featuresHeader)) {
        const match = trimmed.match(bulletRegex);
        if (match && match[1]) {
          const feat = match[1].trim();
          if (feat.length >= 4 && !isSpecPair(feat) && !features.includes(feat)) {
            features.push(feat);
          }
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

    const lines = cleanText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

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

    // Normalize text
    const sanitized = cleanText
      .toLowerCase()
      .replace(/[^\w\sঀ-৿]/g, " ")
      .replace(/\s+/g, " ");

    const words = sanitized.split(" ");
    const frequencyMap: Record<string, number> = {};

    for (const word of words) {
      const trimmed = word.trim();
      if (
        trimmed.length >= 3 &&
        !/^\d+$/.test(trimmed) &&
        !ENGLISH_STOP_WORDS.has(trimmed) &&
        !BENGALI_STOP_WORDS.has(trimmed)
      ) {
        frequencyMap[trimmed] = (frequencyMap[trimmed] || 0) + 1;
      }
    }

    const sorted = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    return sorted.slice(0, limit);
  }

  /* ══════════════════════════════════════════════════════════════
     V2-002: Enhanced Extraction Methods
     ══════════════════════════════════════════════════════════════ */

  /**
   * 7. Brand Extraction: Matches known brand names from the text
   */
  public static extractBrand(cleanText: string): string | undefined {
    if (!cleanText) return undefined;

    const lower = cleanText.toLowerCase();
    const words = lower.split(/\s+/);

    for (const word of words) {
      // Normalize: remove trailing punctuation
      const clean = word.replace(/[,\/\(\)\[\]]+$/, "");
      if (PARSER_BRAND_MAP[clean]) {
        return PARSER_BRAND_MAP[clean];
      }
    }

    return undefined;
  }

  /**
   * 8. Model Extraction: Finds alphanumeric model code after brand name
   * e.g. "Samsung Galaxy S24" → "Galaxy S24"
   *      "Apple iPhone 16 Pro Max" → "iPhone 16 Pro Max"
   */
  public static extractModel(cleanText: string, brand?: string): string | undefined {
    if (!cleanText) return undefined;

    const lines = cleanText.split("\n");
    const firstLine = lines[0] || "";

    // Remove brand prefix if present
    let searchText = firstLine;
    if (brand) {
      // Try to remove brand name from the start of the title
      const brandPattern = new RegExp(`^${brand}\\s+`, "i");
      searchText = firstLine.replace(brandPattern, "");
    }

    // Common model patterns: alphanumeric with version numbers
    // Match: "Galaxy S24", "iPhone 16 Pro Max", "EQ34 Plus", "T900 Ultra"
    const modelRegex = /([A-Z][a-zA-Z0-9\s]{1,30})$/;
    const match = searchText.match(modelRegex);

    if (match && match[1].trim().length >= 2) {
      return match[1].trim();
    }

    // Fallback: try to extract any model-like pattern from first line
    // e.g., "Model: T900" or "EQ34"
    const explicitModel = cleanText.match(
      /(?:model|part\s*no|型号)[:\s]*([A-Z0-9][A-Z0-9\s\-]{1,20})/i,
    );
    if (explicitModel && explicitModel[1]) {
      return explicitModel[1].trim();
    }

    return undefined;
  }

  /**
   * 9. Category Extraction: Matches keywords against category map
   */
  public static extractCategory(cleanText: string): string | undefined {
    if (!cleanText) return undefined;

    const lower = cleanText.toLowerCase();
    const words = lower.split(/\s+/);

    let bestCategory = "";
    let bestScore = 0;

    for (const word of words) {
      const clean = word.replace(/[^a-zA-Z0-9]/g, "");
      if (PARSER_CATEGORY_MAP[clean]) {
        // Score = position weight (earlier = better)
        const positionScore = 1 / (words.indexOf(word) + 1);
        if (positionScore > bestScore) {
          bestScore = positionScore;
          bestCategory = PARSER_CATEGORY_MAP[clean];
        }
      }
    }

    // Check multi-word patterns
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (PARSER_CATEGORY_MAP[bigram]) {
        return PARSER_CATEGORY_MAP[bigram];
      }
    }

    return bestCategory || undefined;
  }

  /**
   * 10. Warranty Extraction: Finds warranty period mentioned in text
   * Supports: "12 months warranty", "2 years warranty", "১ বছরের ওয়ারেন্টি"
   */
  public static extractWarranty(cleanText: string): string | undefined {
    if (!cleanText) return undefined;

    // English patterns
    const enMatch = cleanText.match(
      /(\d+)\s*(month|year|months|years|yr|mo)\s*(warranty|guarantee)/i,
    );
    if (enMatch) {
      const num = enMatch[1];
      const unit = enMatch[2].toLowerCase();
      if (unit.startsWith("year")) return `${num} Year${num !== "1" ? "s" : ""} Official Warranty`;
      return `${num} Month${num !== "1" ? "s" : ""} Official Warranty`;
    }

    // "warranty: 12 months" pattern
    const revMatch = cleanText.match(
      /(warranty|guarantee)[:\s]+(\d+)\s*(month|year|months|years)/i,
    );
    if (revMatch) {
      const num = revMatch[2];
      const unit = revMatch[3].toLowerCase();
      if (unit.startsWith("year")) return `${num} Year${num !== "1" ? "s" : ""} Official Warranty`;
      return `${num} Month${num !== "1" ? "s" : ""} Official Warranty`;
    }

    return undefined;
  }

  /**
   * 11. Package Contents Extraction: Finds "Includes:" or "Package:" list items
   */
  public static extractPackageContents(cleanText: string): string[] {
    if (!cleanText) return [];

    const lines = cleanText.split("\n");
    const contents: string[] = [];
    let inPackageSection = false;

    const sectionHeaders =
      /^(includes?|package\s*contents?|box\s*contains|what'?s\s*in\s*the\s*box|packaging\s*includes|প্যাকেজ\s*সামগ্রী)/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        inPackageSection = false;
        continue;
      }

      if (sectionHeaders.test(trimmed)) {
        inPackageSection = true;
        continue;
      }

      if (inPackageSection) {
        // Remove leading bullets or numbers
        const item = trimmed.replace(/^[\s\-\*\•\✓\➢\▪\►\d+\.\]]+\s*/, "").trim();
        if (item.length >= 3 && item.length <= 100) {
          contents.push(item);
        }
      }
    }

    // Limit to reasonable count
    return contents.slice(0, 15);
  }

  /**
   * 12. Smart SEO Keywords Generator: Creates single-word & multi-word phrase keywords from product title & clean text
   */
  public static generateSeoKeywords(title: string, cleanText: string): string[] {
    const keywordSet = new Set<string>();

    if (title) {
      const cleanTitle = title.trim().toLowerCase();
      keywordSet.add(cleanTitle);

      // Extract title words removing symbols
      const words = cleanTitle
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 2 && !ENGLISH_STOP_WORDS.has(w) && !BENGALI_STOP_WORDS.has(w));

      // Generate 2-word & 3-word phrase combinations from title
      for (let i = 0; i < words.length - 1; i++) {
        keywordSet.add(`${words[i]} ${words[i + 1]}`);
        if (i < words.length - 2) {
          keywordSet.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }
      }

      // Add high-intent e-commerce search variations
      if (words.length >= 2) {
        keywordSet.add(`${words.slice(-2).join(" ")} price in bd`);
        keywordSet.add(`${words[0]} ${words[words.length - 1]}`);
      }
    }

    // Extract top frequent words from cleanText
    const topWords = this.extractKeywords(cleanText, 10);
    for (const w of topWords) {
      if (w.length >= 3) keywordSet.add(w.toLowerCase());
    }

    return Array.from(keywordSet).slice(0, 15);
  }

  /**
   * 13. How to Use Extraction: Extracts instructions under 'How to Use' / 'কীভাবে ব্যবহার করবেন'
   */
  public static extractHowToUse(cleanText: string): string[] {
    if (!cleanText) return [];

    const lines = cleanText.split("\n");
    const steps: string[] = [];
    let inSection = false;

    const sectionHeader = /(how\s*to\s*use|কীভাবে\s*ব্যবহার\s*করবেন|ব্যবহারের\s*নিয়ম)/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (sectionHeader.test(trimmed)) {
        inSection = true;
        continue;
      }

      // Stop section if encountering another header emoji or section
      if (inSection && /^(📦|⚙️|🔥|✅|📦|http|NN Enterprise Quality Assurance)/i.test(trimmed)) {
        inSection = false;
        break;
      }

      if (inSection) {
        const step = trimmed.replace(/^[\s\-\*\•\✓\➢\▪\►\d+\.\]]+\s*/, "").trim();
        if (step.length >= 4) {
          steps.push(step);
        }
      }
    }

    return steps;
  }

  /**
   * 14. Notice & Quality Assurance Extraction: Extracts QA & Warranty notice
   */
  public static extractNotice(cleanText: string): string | undefined {
    if (!cleanText) return undefined;

    const lines = cleanText.split("\n");
    let inSection = false;
    const noticeLines: string[] = [];

    const sectionHeader = /(quality\s*assurance|ক্যাশ\s*অন\s*ডেলিভারি|৭\s*দিনের\s*রিপ্লেসমেন্ট|7\s*days\s*replacement|গ্যারান্টি)/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (sectionHeader.test(trimmed) || trimmed.includes("NN Enterprise Quality Assurance")) {
        inSection = true;
        noticeLines.push(trimmed.replace(/^[✅🔥📖📦⚙️\s]+/, "").trim());
        continue;
      }

      if (inSection) {
        noticeLines.push(trimmed);
      }
    }

    if (noticeLines.length > 0) {
      return noticeLines.join(" ");
    }

    return undefined;
  }
}

export default SmartParserService;
