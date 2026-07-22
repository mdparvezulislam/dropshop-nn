export interface ProductTemplate {
  id: string;
  name: string;
  nameBangla: string;
  iconName: string;
  categoryName: string;
  shortDescription: string;
  tags: string[];
  costPrice: string;
  weight: string;
  specs: { key: string; label: string; value: string }[];
  bulletFeatures: string[];
}

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    id: "powerbank",
    name: "Power Bank 20,000mAh",
    nameBangla: "পাওয়ার ব্যাংক",
    iconName: "BatteryCharging",
    categoryName: "Power Bank",
    shortDescription: "High-capacity 20,000mAh fast-charging portable power bank with Dual USB-C PD 3.0 & QC 4.0 ports.",
    tags: ["powerbank", "fastcharge", "20000mah", "pd30", "gadget"],
    costPrice: "1400",
    weight: "0.45",
    specs: [
      { key: "capacity", label: "Capacity", value: "20,000 mAh" },
      { key: "fast_charging", label: "Fast Charge", value: "PD 3.0 (22.5W) + QC 4.0" },
      { key: "ports", label: "Output Ports", value: "2x USB-C, 1x USB-A" },
      { key: "display", label: "Battery Indicator", value: "Digital LED Percentage Display" },
    ],
    bulletFeatures: [
      "20,000mAh High-Density Li-Polymer Battery Cells",
      "22.5W Super Fast PD Fast Charge for Smartphones & Rechargeable Gadgets",
      "Over-charge, Over-voltage & Short-Circuit Safety Protection",
      "6 Months Replacement Warranty across Bangladesh",
    ],
  },
  {
    id: "bluetooth_speaker",
    name: "Wireless Bluetooth Speaker",
    nameBangla: "ব্লুটুথ স্পিকার",
    iconName: "Volume2",
    categoryName: "Audio & Speaker",
    shortDescription: "Portable outdoor bluetooth 5.3 stereo speaker with IPX7 waterproof rating and RGB ambient lighting.",
    tags: ["speaker", "audio", "bluetooth", "waterproof", "rgblight"],
    costPrice: "1100",
    weight: "0.55",
    specs: [
      { key: "bluetooth", label: "Bluetooth Version", value: "v5.3 Low Latency" },
      { key: "driver_size", label: "Driver Diameter", value: "52mm Dual Bass Radiator" },
      { key: "playtime", label: "Battery Playtime", value: "12-15 Hours Continuous Play" },
      { key: "waterproof", label: "Water Resistance", value: "IPX7 Waterproof Rating" },
    ],
    bulletFeatures: [
      "Deep Bass Sound Engine with Dual 52mm Dynamic Drivers",
      "RGB Dynamic Music Rhythm Light Effects",
      "Built-in HD Noise Cancelling Microphone for Hands-Free Calling",
      "1 Year Official Replacement Warranty",
    ],
  },
  {
    id: "earbuds",
    name: "TWS Wireless Earbuds",
    nameBangla: "ওয়্যারলেস ইয়ারবাডস",
    iconName: "Headphones",
    categoryName: "Audio & Speaker",
    shortDescription: "True Wireless Stereo ANC earbuds with Active Noise Cancellation and low-latency gaming mode.",
    tags: ["tws", "earbuds", "anc", "audio", "wireless"],
    costPrice: "950",
    weight: "0.15",
    specs: [
      { key: "anc", label: "Noise Cancellation", value: "ANC (Active Noise Cancellation 30dB)" },
      { key: "latency", label: "Gaming Latency", value: "38ms Ultra-low Latency Mode" },
      { key: "battery", label: "Total Playtime", value: "28 Hours with Charging Case" },
    ],
    bulletFeatures: [
      "Active Noise Cancellation (ANC) up to 30dB",
      "Dual Mic Environmental Noise Cancellation (ENC) for crystal clear calls",
      "Touch Control Gestures for Track & Call Management",
      "Express 24-Hour Delivery in Dhaka City",
    ],
  },
  {
    id: "router",
    name: "WiFi 6 Gigabit Router",
    nameBangla: "ওয়াইফাই ৬ রাউটার",
    iconName: "Wifi",
    categoryName: "Networking",
    shortDescription: "AX3000 Dual-Band Gigabit WiFi 6 router with 5 High-Gain 6dBi Antennas and Beamforming.",
    tags: ["router", "wifi6", "gigabit", "networking", "ax3000"],
    costPrice: "2200",
    weight: "0.75",
    specs: [
      { key: "wifi_standard", label: "WiFi Standard", value: "WiFi 6 (802.11ax AX3000)" },
      { key: "speed", label: "Max Speed", value: "3000 Mbps Dual-Band" },
      { key: "lan_ports", label: "Gigabit Ports", value: "4x Full Gigabit LAN Ports" },
    ],
    bulletFeatures: [
      "AX3000 Ultra-Fast Dual-Band WiFi 6 Technology",
      "5x 6dBi External High-Gain Antennas for Maximum Coverage",
      "Parental Control & Guest Network Protection",
      "1 Year Official Replacement Warranty",
    ],
  },
  {
    id: "rechargeable_fan",
    name: "Smart Rechargeable Mini Fan",
    nameBangla: "রিচার্জেবল ফ্যান",
    iconName: "Fan",
    categoryName: "Home Utility",
    shortDescription: "Desktop rechargeable portable fan with 4000mAh battery, 4 speed control, and night light.",
    tags: ["fan", "rechargeable", "utility", "summer", "homegadget"],
    costPrice: "850",
    weight: "0.50",
    specs: [
      { key: "battery", label: "Battery Capacity", value: "4000 mAh Rechargeable" },
      { key: "speeds", label: "Speed Modes", value: "4 Airflow Speed Settings" },
      { key: "charging", label: "Charging Port", value: "Type-C Fast Charge" },
    ],
    bulletFeatures: [
      "4000mAh Battery Provides 6 to 10 Hours Backup Time",
      "Ultra-Quiet Brushless Motor Operation",
      "120 Degree Oscillating Head Movement",
      "3 Months Warranty",
    ],
  },
];
