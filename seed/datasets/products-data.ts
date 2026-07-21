export interface ProductSeedItem {
  name: string;
  sku: string;
  brand: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  baseCostPrice: number;
  retailPrice: number;
  resellerPrice: number;
  wholesalePrice: number;
  moq: number;
  stock: number;
  images: string[];
  attributes: { key: string; value: string; group?: string }[];
  variants?: { sku: string; color?: string; storage?: string; ram?: string; price: number; stock: number }[];
  tags: string[];
}

export const PRODUCTS_DATA: ProductSeedItem[] = [
  {
    name: "UGREEN Nexode 65W GaN 3-Port Wall Charger",
    sku: "UG-NEX-65W",
    brand: "UGREEN",
    category: "Chargers & Power",
    shortDescription: "Foldable 3-port 65W GaN fast wall charger for MacBook, iPhone, and Android.",
    fullDescription: "Powered by GaNTech, the UGREEN Nexode 65W charger delivers ultra-fast 65W power delivery for laptops, smartphones, and tablets simultaneously. Built-in thermal protection ensures maximum safety.",
    baseCostPrice: 240000, // 2400 BDT in cents
    retailPrice: 349000,   // 3490 BDT
    resellerPrice: 295000,
    wholesalePrice: 275000,
    moq: 5,
    stock: 250,
    images: [
      "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Total Output", value: "65W Max", group: "specifications" },
      { key: "Ports", value: "2x USB-C, 1x USB-A", group: "specifications" },
      { key: "Technology", value: "GaN III (Gallium Nitride)", group: "features" },
      { key: "Warranty", value: "1 Year Official Warranty", group: "general" },
    ],
    variants: [
      { sku: "UG-NEX-65W-BLK", color: "Space Gray", price: 349000, stock: 150 },
      { sku: "UG-NEX-65W-WHT", color: "Pure White", price: 349000, stock: 100 },
    ],
    tags: ["charger", "gan", "fast-charging", "ugreen", "macbook-charger"],
  },
  {
    name: "Baseus Blade 100W 20,000mAh Power Bank",
    sku: "BS-BLD-100W",
    brand: "Baseus",
    category: "Chargers & Power",
    shortDescription: "Ultra-thin 100W laptop power bank with digital LED status display.",
    fullDescription: "Baseus Blade 100W power bank features a futuristic ultra-slim 18mm design with dual Type-C ports capable of outputting 100W PD power for laptops and high-performance devices.",
    baseCostPrice: 480000,
    retailPrice: 689000,
    resellerPrice: 580000,
    wholesalePrice: 540000,
    moq: 3,
    stock: 180,
    images: [
      "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Battery Capacity", value: "20,000mAh / 74Wh", group: "specifications" },
      { key: "Max Output", value: "100W PD Fast Charge", group: "specifications" },
      { key: "Display", value: "Status LED Digital Screen", group: "features" },
    ],
    variants: [
      { sku: "BS-BLD-100W-BLK", color: "Matte Black", price: 689000, stock: 180 },
    ],
    tags: ["powerbank", "baseus", "100w", "laptop-powerbank"],
  },
  {
    name: "Anker Soundcore Liberty 4 NC TWS Earbuds",
    sku: "ANK-LIB4-NC",
    brand: "Anker",
    category: "Audio & Headphones",
    shortDescription: "Adaptive ANC 98.5% noise reduction TWS earbuds with LDAC Hi-Res Audio.",
    fullDescription: "Experience pure audio clarity with Anker Soundcore Liberty 4 NC. Features custom 11mm drivers, 50 hours of total playtime, wireless charging, and 6-mic AI noise reduction for crystal clear calls.",
    baseCostPrice: 650000,
    retailPrice: 899000,
    resellerPrice: 780000,
    wholesalePrice: 730000,
    moq: 4,
    stock: 320,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Noise Cancellation", value: "Adaptive ANC 2.0 (up to 98.5%)", group: "features" },
      { key: "Audio Codec", value: "LDAC, AAC, SBC", group: "specifications" },
      { key: "Playtime", value: "10 Hours / 50 Hours with Case", group: "battery" },
    ],
    variants: [
      { sku: "ANK-LIB4-NC-BLK", color: "Velvet Black", price: 899000, stock: 120 },
      { sku: "ANK-LIB4-NC-BLU", color: "Clear Blue", price: 899000, stock: 100 },
      { sku: "ANK-LIB4-NC-WHT", color: "Pearl White", price: 899000, stock: 100 },
    ],
    tags: ["earbuds", "tws", "anker", "soundcore", "anc"],
  },
  {
    name: "Oraimo FreePods 4 ANC TWS Earbuds",
    sku: "ORA-FP4-ANC",
    brand: "Oraimo",
    category: "Audio & Headphones",
    shortDescription: "30dB Active Noise Cancellation TWS earbuds with heavy bass algorithm.",
    fullDescription: "Oraimo FreePods 4 offers powerful 30dB ANC, transparency mode, 35.5 hours total battery life, low latency gaming mode, and custom EQ customization via the Oraimo Sound App.",
    baseCostPrice: 210000,
    retailPrice: 299000,
    resellerPrice: 250000,
    wholesalePrice: 235000,
    moq: 10,
    stock: 500,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Active Noise Cancellation", value: "Up to 30dB", group: "features" },
      { key: "Water Resistance", value: "IPX5 Sweat & Water Resistant", group: "specifications" },
      { key: "Playtime", value: "8.5 Hrs + 27 Hrs Case", group: "battery" },
    ],
    variants: [
      { sku: "ORA-FP4-ANC-BLK", color: "Shadow Black", price: 299000, stock: 300 },
      { sku: "ORA-FP4-ANC-WHT", color: "Snow White", price: 299000, stock: 200 },
    ],
    tags: ["oraimo", "freepods", "tws", "budget-earbuds"],
  },
  {
    name: "Logitech MX Master 3S Wireless Mouse",
    sku: "LOG-MXM-3S",
    brand: "Logitech",
    category: "Computer Accessories",
    shortDescription: "Quiet Click ergonomic wireless productivity mouse with 8K DPI sensor.",
    fullDescription: "Logitech MX Master 3S is an iconic wireless mouse remastered for ultimate feel and performance. Quiet Clicks deliver a tactile feel with 90% less click noise. 8000 DPI optical sensor tracks on glass.",
    baseCostPrice: 950000,
    retailPrice: 1299000,
    resellerPrice: 1120000,
    wholesalePrice: 1050000,
    moq: 2,
    stock: 140,
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Sensor", value: "Darkfield High Precision 8000 DPI", group: "specifications" },
      { key: "Connectivity", value: "Bluetooth + Logi Bolt USB Receiver", group: "connectivity" },
      { key: "Battery Life", value: "Up to 70 days on full charge", group: "battery" },
    ],
    variants: [
      { sku: "LOG-MXM-3S-GRY", color: "Graphite", price: 1299000, stock: 80 },
      { sku: "LOG-MXM-3S-PLT", color: "Pale Grey", price: 1299000, stock: 60 },
    ],
    tags: ["logitech", "mx-master", "mouse", "wireless-mouse", "productivity"],
  },
  {
    name: "A4Tech Bloody B820R RGB Mechanical Gaming Keyboard",
    sku: "A4-BLD-B820R",
    brand: "A4Tech",
    category: "Gaming Gear",
    shortDescription: "Light Strike optical switch RGB mechanical gaming keyboard.",
    fullDescription: "Featuring LK Light Strike Optical Switch technology, the B820R delivers 0.2ms key response speed, customizable RGB backlighting, and spill-resistant nano-coating for ultimate durability.",
    baseCostPrice: 380000,
    retailPrice: 520000,
    resellerPrice: 440000,
    wholesalePrice: 410000,
    moq: 5,
    stock: 220,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Switch Type", value: "LK Optical Blue Switch", group: "specifications" },
      { key: "Response Speed", value: "0.2 ms", group: "features" },
      { key: "Key Lifetime", value: "100 Million Clicks", group: "durability" },
    ],
    variants: [
      { sku: "A4-BLD-B820R-RED", color: "RGB Black (Red Switch)", price: 520000, stock: 120 },
      { sku: "A4-BLD-B820R-BLU", color: "RGB Black (Blue Switch)", price: 520000, stock: 100 },
    ],
    tags: ["a4tech", "bloody", "keyboard", "gaming-keyboard", "rgb"],
  },
  {
    name: "Xiaomi Router AX3000T WiFi 6 Dual Band",
    sku: "XIA-RTR-AX3000T",
    brand: "Xiaomi",
    category: "Networking & WiFi",
    shortDescription: "Gigabit 3000Mbps dual band WiFi 6 mesh router with NFC quick connect.",
    fullDescription: "Xiaomi Router AX3000T supports next-gen WiFi 6 with dual-band concurrent speeds up to 2976Mbps. Equipped with 4 high-gain antennas, 160MHz bandwidth, and NFC one-touch connection for smartphones.",
    baseCostPrice: 290000,
    retailPrice: 420000,
    resellerPrice: 350000,
    wholesalePrice: 325000,
    moq: 5,
    stock: 300,
    images: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Wireless Speed", value: "2.4GHz 574Mbps + 5GHz 2402Mbps", group: "specifications" },
      { key: "Processor", value: "Dual-Core 1.3GHz CPU", group: "hardware" },
      { key: "Ports", value: "4x 10/100/1000Mbps WAN/LAN Auto-Sensing", group: "ports" },
    ],
    variants: [
      { sku: "XIA-RTR-AX3000T-WHT", color: "White", price: 420000, stock: 300 },
    ],
    tags: ["xiaomi", "wifi6", "router", "networking", "ax3000t"],
  },
  {
    name: "JBL Flip 6 Waterproof Portable Bluetooth Speaker",
    sku: "JBL-FLIP-6",
    brand: "JBL",
    category: "Audio & Headphones",
    shortDescription: "IP67 waterproof and dustproof portable Bluetooth speaker with 12 hours playtime.",
    fullDescription: "The JBL Flip 6 delivers bold JBL Original Pro Sound with exceptional clarity thanks to its 2-way speaker system. Waterproof, dustproof IP67 construction allows you to bring music anywhere.",
    baseCostPrice: 920000,
    retailPrice: 1250000,
    resellerPrice: 1080000,
    wholesalePrice: 1020000,
    moq: 3,
    stock: 160,
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Output Power", value: "20W RMS Woofer + 10W RMS Tweeter", group: "specifications" },
      { key: "Protection", value: "IP67 Waterproof & Dustproof", group: "durability" },
      { key: "Playtime", value: "Up to 12 Hours", group: "battery" },
    ],
    variants: [
      { sku: "JBL-FLIP-6-BLK", color: "Midnight Black", price: 1250000, stock: 60 },
      { sku: "JBL-FLIP-6-RED", color: "Fiery Red", price: 1250000, stock: 50 },
      { sku: "JBL-FLIP-6-BLU", color: "Ocean Blue", price: 1250000, stock: 50 },
    ],
    tags: ["jbl", "flip6", "speaker", "bluetooth-speaker", "waterproof"],
  },
  {
    name: "SanDisk Extreme PRO 128GB MicroSDXC UHS-I Card",
    sku: "SD-EXT-128GB",
    brand: "SanDisk",
    category: "Storage & Memory",
    shortDescription: "Up to 200MB/s read speed A2 4K UHD memory card with adapter.",
    fullDescription: "SanDisk Extreme PRO microSDXC memory card delivers quick transfer speeds up to 200MB/s. Ideal for Android smartphones, action cameras, or drones for recording 4K UHD video.",
    baseCostPrice: 140000,
    retailPrice: 210000,
    resellerPrice: 175000,
    wholesalePrice: 160000,
    moq: 10,
    stock: 600,
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Capacity", value: "128GB", group: "specifications" },
      { key: "Read Speed", value: "Up to 200MB/s", group: "performance" },
      { key: "Speed Class", value: "C10, U3, V30, A2", group: "performance" },
    ],
    variants: [
      { sku: "SD-EXT-128GB-STD", color: "Red/Gold", price: 210000, stock: 600 },
    ],
    tags: ["sandisk", "microsd", "memory-card", "128gb"],
  },
  {
    name: "Apple iPhone 16 Pro Max (256GB)",
    sku: "APL-IPH16PM-256",
    brand: "Apple",
    category: "Smartphones",
    shortDescription: "Grade 5 titanium chassis smartphone with A18 Pro silicon and camera control.",
    fullDescription: "Apple iPhone 16 Pro Max features a 6.9-inch Super Retina XDR display with ProMotion, A18 Pro chip, 48MP Fusion camera system with 5x Telephoto lens, and breakthrough battery life.",
    baseCostPrice: 13500000, // 135,000 BDT
    retailPrice: 15500000,  // 155,000 BDT
    resellerPrice: 14500000,
    wholesalePrice: 14000000,
    moq: 1,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    ],
    attributes: [
      { key: "Display", value: "6.9-inch OLED 120Hz ProMotion", group: "specifications" },
      { key: "Chipset", value: "Apple A18 Pro (3nm)", group: "performance" },
      { key: "Main Camera", value: "48MP Main + 48MP UltraWide + 12MP 5x Telephoto", group: "camera" },
    ],
    variants: [
      { sku: "APL-IPH16PM-256-BLK", color: "Black Titanium", storage: "256GB", price: 15500000, stock: 15 },
      { sku: "APL-IPH16PM-256-WHT", color: "White Titanium", storage: "256GB", price: 15500000, stock: 15 },
      { sku: "APL-IPH16PM-256-DES", color: "Desert Titanium", storage: "256GB", price: 15500000, stock: 15 },
    ],
    tags: ["apple", "iphone16promax", "smartphone", "flagship"],
  },
];
