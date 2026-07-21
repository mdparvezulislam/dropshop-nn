export interface CategorySeedItem {
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description: string;
  children?: { name: string; slug: string; description: string }[];
}

export const CATEGORIES_DATA: CategorySeedItem[] = [
  {
    name: "Smartphones",
    slug: "smartphones",
    icon: "Smartphone",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    description: "Official flagships, budget smartphones, and accessories in Bangladesh.",
    children: [
      { name: "Flagship Phones", slug: "flagship-phones", description: "Top-tier smartphones with cutting edge processors." },
      { name: "Mid-Range Phones", slug: "mid-range-phones", description: "Value-for-money smartphones with great cameras." },
      { name: "Budget Phones", slug: "budget-phones", description: "Affordable entry-level smartphones." },
    ],
  },
  {
    name: "Audio & Headphones",
    slug: "audio-headphones",
    icon: "Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    description: "TWS earbuds, wireless headphones, neckbands, and Bluetooth speakers.",
    children: [
      { name: "TWS Earbuds", slug: "tws-earbuds", description: "True wireless stereo earbuds with Active Noise Cancellation." },
      { name: "Wireless Headphones", slug: "wireless-headphones", description: "Over-ear and on-ear wireless Bluetooth headphones." },
      { name: "Bluetooth Speakers", slug: "bluetooth-speakers", description: "Portable waterproof wireless speakers." },
      { name: "Neckbands", slug: "neckbands", description: "Comfortable sport neckband earphones." },
    ],
  },
  {
    name: "Chargers & Power",
    slug: "chargers-power",
    icon: "Zap",
    image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600&auto=format&fit=crop&q=80",
    description: "GaN fast chargers, high-capacity power banks, and MagSafe wireless pads.",
    children: [
      { name: "Power Banks", slug: "power-banks", description: "10,000mAh to 30,000mAh fast-charging power banks." },
      { name: "Wall Chargers", slug: "wall-chargers", description: "Multi-port GaN fast chargers up to 140W." },
      { name: "Wireless Chargers", slug: "wireless-chargers", description: "Qi and MagSafe wireless charging docks." },
    ],
  },
  {
    name: "Cables & Adapters",
    slug: "cables-adapters",
    icon: "Cable",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    description: "Type-C, Lightning, HDMI, USB hubs, and audio convertors.",
    children: [
      { name: "Type-C Cables", slug: "type-c-cables", description: "Braided 100W PD fast charging USB-C cables." },
      { name: "Lightning Cables", slug: "lightning-cables", description: "MFi certified Apple charging cables." },
      { name: "USB Hubs & Docks", slug: "usb-hubs-docks", description: "Multi-port Type-C HDMI hubs for laptops." },
    ],
  },
  {
    name: "Wearables & Smartwatches",
    slug: "wearables-smartwatches",
    icon: "Watch",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
    description: "Fitness trackers, AMOLED smartwatches, and fashion bands.",
    children: [
      { name: "AMOLED Smartwatches", slug: "amoled-smartwatches", description: "High-resolution bright screen smartwatches." },
      { name: "Fitness Bands", slug: "fitness-bands", description: "Heart rate and step tracking fitness bands." },
    ],
  },
  {
    name: "Computer Accessories",
    slug: "computer-accessories",
    icon: "Monitor",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
    description: "Keyboards, mice, webcams, laptop stands, and desk pads.",
    children: [
      { name: "Mechanical Keyboards", slug: "mechanical-keyboards", description: "Hot-swappable RGB mechanical gaming keyboards." },
      { name: "Wireless Mice", slug: "wireless-mice", description: "Ergonomic multi-device Bluetooth wireless mice." },
      { name: "Webcams", slug: "webcams", description: "1080p and 4K streaming webcams." },
    ],
  },
  {
    name: "Gaming Gear",
    slug: "gaming-gear",
    icon: "Gamepad2",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
    description: "Game controllers, RGB headsets, gaming mice, and cooling pads.",
    children: [
      { name: "Game Controllers", slug: "game-controllers", description: "Wireless controllers for PC, Mobile, and Consoles." },
      { name: "Gaming Headsets", slug: "gaming-headsets", description: "7.1 Surround sound RGB gaming headsets." },
    ],
  },
  {
    name: "Networking & WiFi",
    slug: "networking-wifi",
    icon: "Wifi",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
    description: "Dual-band WiFi 6 routers, mesh systems, and Range extenders.",
    children: [
      { name: "WiFi Routers", slug: "wifi-routers", description: "High speed gigabit WiFi 6 dual-band routers." },
      { name: "Range Extenders", slug: "range-extenders", description: "Signal boosters and WiFi repeaters." },
    ],
  },
  {
    name: "Smart Home & Security",
    slug: "smart-home",
    icon: "Home",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80",
    description: "IP Security cameras, smart plugs, LED strips, and sensors.",
    children: [
      { name: "IP Cameras", slug: "ip-cameras", description: "360-degree night vision security cameras." },
      { name: "Smart Plugs & Bulbs", slug: "smart-plugs-bulbs", description: "App & voice controlled smart home automation." },
    ],
  },
  {
    name: "Storage & Memory",
    slug: "storage-memory",
    icon: "HardDrive",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
    description: "MicroSD cards, High-speed pendrives, Portable SSDs.",
    children: [
      { name: "MicroSD Cards", slug: "microsd-cards", description: "Class 10 UHS-I memory cards for phones and cameras." },
      { name: "Flash Drives", slug: "flash-drives", description: "Dual Type-C and USB 3.2 flash drives." },
    ],
  },
];
