"use client";

import * as React from "react";

export interface ClassificationSuggestion {
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  templateId?: string;
  templateName?: string;
  suggestedTags: string[];
  suggestedCollections: string[];
  confidence: number;
}

const KEYWORD_CATEGORY_MAP: Record<string, string> = {
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
  switch: "Networking",
  hub: "Networking",
  fan: "Home Utility",
  heater: "Home Utility",
  kitchen: "Kitchen & Home",
  blender: "Kitchen & Home",
  cooker: "Kitchen & Home",
  massager: "Health & Wellness",
  massage: "Health & Wellness",
  health: "Health & Wellness",
  watch: "Smart Watches",
  smartwatch: "Smart Watches",
  wearable: "Smart Watches",
  camera: "Camera & Accessories",
  drone: "Camera & Accessories",
  light: "Lighting",
  led: "Lighting",
  lamp: "Lighting",
  mouse: "Computer Peripherals",
  keyboard: "Computer Peripherals",
  monitor: "Computer Peripherals",
  laptop: "Computer Peripherals",
  phone: "Mobile Accessories",
  case: "Mobile Accessories",
  holder: "Mobile Accessories",
  stand: "Mobile Accessories",
  bag: "Bags & Cases",
  backpack: "Bags & Cases",
  wallet: "Bags & Cases",
  car: "Car Accessories",
  dashcam: "Car Accessories",
  vacuum: "Home Utility",
  robot: "Smart Home",
  smart: "Smart Home",
  sensor: "Smart Home",
};

const KEYWORD_BRAND_MAP: Record<string, string> = {
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
};

const KEYWORD_TAG_MAP: Record<string, string> = {
  fast: "fast-charging",
  charge: "fast-charging",
  charging: "fast-charging",
  wireless: "wireless",
  bluetooth: "bluetooth",
  waterproof: "waterproof",
  ip67: "waterproof",
  ip68: "waterproof",
  rgb: "rgb-lighting",
  led: "led",
  digital: "digital",
  smart: "smart",
  mini: "mini",
  portable: "portable",
  rechargeable: "rechargeable",
  battery: "battery",
  typec: "type-c",
  "type-c": "type-c",
  pd: "pd-fast-charge",
  qc: "quick-charge",
  noise: "noise-cancelling",
  anc: "anc",
  stereo: "stereo",
  bass: "bass",
  gaming: "gaming",
  "wifi 6": "wifi-6",
  wifi6: "wifi-6",
  gigabit: "gigabit",
  dual: "dual-band",
};

export function useAutoClassification(): {
  classifyFromName: (name: string) => ClassificationSuggestion;
} {
  const classifyFromName = React.useCallback((name: string): ClassificationSuggestion => {
    const lower = name.toLowerCase().trim();
    const words = lower.split(/\s+/);

    let bestCategory = "";
    let categoryConfidence = 0;
    for (const word of words) {
      if (KEYWORD_CATEGORY_MAP[word]) {
        bestCategory = KEYWORD_CATEGORY_MAP[word];
        categoryConfidence = Math.max(categoryConfidence, 0.7);
      }
    }

    let bestBrand = "";
    let brandConfidence = 0;
    for (const word of words) {
      if (KEYWORD_BRAND_MAP[word]) {
        bestBrand = KEYWORD_BRAND_MAP[word];
        brandConfidence = Math.max(brandConfidence, 0.8);
      }
    }

    const tags: string[] = [];
    for (const word of words) {
      if (KEYWORD_TAG_MAP[word] && !tags.includes(KEYWORD_TAG_MAP[word])) {
        tags.push(KEYWORD_TAG_MAP[word]);
      }
    }

    const confidence = Math.max(
      categoryConfidence > 0 ? 0.5 : 0,
      brandConfidence > 0 ? 0.4 : 0,
      tags.length > 0 ? 0.3 : 0,
    );

    return {
      categoryName: bestCategory || undefined,
      brandName: bestBrand || undefined,
      suggestedTags: tags.slice(0, 5),
      suggestedCollections: [],
      confidence: Math.min(confidence, 0.9),
    };
  }, []);

  return { classifyFromName };
}
