export interface BlogSeedItem {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  tags: string[];
}

export const BLOGS_DATA: BlogSeedItem[] = [
  {
    title: "Best Fast Chargers in Bangladesh (2026 Buying Guide)",
    slug: "best-fast-chargers-bangladesh-2026-guide",
    category: "Buying Guides",
    excerpt: "Compare GaN wall chargers, Type-C 100W PD adapters, and power banks for iPhone, Samsung, and laptops.",
    content: `
      <h2>Why GaN Technology Matters for Bangladesh Tech Consumers</h2>
      <p>Gallium Nitride (GaN) chargers are revolutionizing mobile power delivery in Bangladesh. Unlike traditional silicon chargers, GaN components operate at higher voltages and temperatures with smaller physical footprints.</p>
      <h3>Top Features to Consider Before Purchasing</h3>
      <ul>
        <li><strong>Total Wattage Output:</strong> Ensure 65W+ if charging laptops like MacBook Air or Pro.</li>
        <li><strong>Port Count:</strong> Dual USB-C plus single USB-A ports offer maximum versatility.</li>
        <li><strong>Thermal Protection:</strong> Built-in safeguards protect against load-shedding power surges.</li>
      </ul>
      <p>Brands like UGREEN, Baseus, and Anker provide official warranty coverage through authorized Bangladesh distributors.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=1000&auto=format&fit=crop&q=80",
    tags: ["chargers", "gan", "buying-guide", "tech-tips"],
  },
  {
    title: "TWS Earbuds Under 3,000 BDT: Top Picks for Sound & ANC",
    slug: "tws-earbuds-under-3000-bdt-top-picks",
    category: "Audio",
    excerpt: "Looking for budget true wireless earbuds with active noise cancellation and punchy bass in BD?",
    content: `
      <h2>High Quality Wireless Audio on a Budget</h2>
      <p>You no longer need to spend 10,000 BDT to get great wireless audio in Bangladesh. Brands like Oraimo, Hoco, and Joyroom offer features previously reserved for premium audio gear.</p>
      <h3>Key Features under 3,000 BDT:</h3>
      <ul>
        <li>Active Noise Cancellation (up to 30dB)</li>
        <li>Low Latency Gaming Mode (< 60ms)</li>
        <li>IPX5 Water & Sweat Resistance</li>
      </ul>
    `,
    featuredImage: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&auto=format&fit=crop&q=80",
    tags: ["tws", "earbuds", "audio", "budget-gadgets"],
  },
  {
    title: "How to Build a Successful Dropshipping Business in Bangladesh",
    slug: "how-to-build-successful-dropshipping-business-bangladesh",
    category: "Commerce",
    excerpt: "A step-by-step roadmap for resellers leveraging DropshopNN unified commerce architecture.",
    content: `
      <h2>The Rise of E-commerce Reselling in BD</h2>
      <p>Dropshipping in Bangladesh has evolved. Resellers can now leverage centralized inventory, verified wholesale pricing, and automated Pathao/Steadfast courier fulfillment without stocking inventory.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=1000&auto=format&fit=crop&q=80",
    tags: ["dropshipping", "reseller", "ecommerce-bd", "business-guide"],
  },
];
