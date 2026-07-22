import * as React from "react";
import type { CategorySpecTemplate, SpecificationField } from "../types/studio-types";

const TEMPLATES: Record<string, SpecificationField[]> = {
  smartwatch: [
    { key: "display", label: "Display Size & Type", type: "text", value: "1.96-inch AMOLED HD Curved Display" },
    { key: "battery", label: "Battery Standby", type: "text", value: "7-10 Days Backup (400mAh)" },
    { key: "waterproof", label: "Water Resistance Rating", type: "select", value: "IP68 Water Resistant", options: ["IP67", "IP68", "5ATM"] },
    { key: "calling", label: "Bluetooth Calling", type: "boolean", value: true },
    { key: "sensors", label: "Health Sensors", type: "multiselect", value: ["Heart Rate", "SpO2", "Sleep Tracking"], options: ["Heart Rate", "SpO2", "Sleep Tracking", "Blood Pressure"] },
  ],
  router: [
    { key: "wifi_standard", label: "WiFi Standard", type: "select", value: "WiFi 6 (802.11ax)", options: ["WiFi 5 (ac)", "WiFi 6 (ax)", "WiFi 7 (be)"] },
    { key: "speed", label: "Max Speed (Mbps)", type: "number", value: 3000 },
    { key: "lan_ports", label: "Gigabit LAN Ports", type: "number", value: 4 },
    { key: "wan_ports", label: "WAN Ports", type: "number", value: 1 },
    { key: "bands", label: "Frequency Bands", type: "multiselect", value: ["2.4GHz", "5GHz"], options: ["2.4GHz", "5GHz", "6GHz"] },
  ],
  powerbank: [
    { key: "capacity", label: "Capacity (mAh)", type: "select", value: "20,000 mAh", options: ["10,000 mAh", "20,000 mAh", "30,000 mAh", "50,000 mAh"] },
    { key: "fast_charging", label: "Fast Charge Protocols", type: "multiselect", value: ["PD 3.0", "QC 4.0"], options: ["PD 3.0", "QC 4.0", "PPS", "MagSafe"] },
    { key: "max_output", label: "Max Output Power (W)", type: "number", value: 65 },
    { key: "ports", label: "Output Ports", type: "text", value: "2x USB-C, 1x USB-A" },
  ],
  speaker: [
    { key: "bluetooth", label: "Bluetooth Version", type: "select", value: "Bluetooth 5.3", options: ["5.0", "5.2", "5.3", "5.4"] },
    { key: "battery_life", label: "Playtime (Hours)", type: "number", value: 20 },
    { key: "waterproof", label: "Water Resistance Rating", type: "select", value: "IP67", options: ["IPX4", "IPX7", "IP67"] },
    { key: "rgb", label: "RGB Lighting FX", type: "boolean", value: true },
  ],
  default: [
    { key: "material", label: "Primary Material", type: "text", value: "Aluminum / Premium Polymer" },
    { key: "warranty_period", label: "Warranty Period", type: "select", value: "1 Year Official", options: ["6 Months", "1 Year Official", "2 Years"] },
    { key: "country_of_origin", label: "Country of Origin", type: "text", value: "Vietnam / China" },
  ],
};

export function useCategorySpecifications(categoryId?: string, categoryName?: string): {
  template: SpecificationField[];
  loadTemplateForCategory: (catName: string) => SpecificationField[];
} {
  const getTemplate = React.useCallback((name?: string): SpecificationField[] => {
    if (!name) return TEMPLATES.default;
    const lower = name.toLowerCase();
    if (lower.includes("watch") || lower.includes("smartwatch") || lower.includes("wearable") || lower.includes("gadget")) return TEMPLATES.smartwatch;
    if (lower.includes("router") || lower.includes("network") || lower.includes("wifi")) return TEMPLATES.router;
    if (lower.includes("power") || lower.includes("bank") || lower.includes("battery")) return TEMPLATES.powerbank;
    if (lower.includes("speaker") || lower.includes("audio") || lower.includes("sound")) return TEMPLATES.speaker;
    return TEMPLATES.default;
  }, []);

  const template = React.useMemo(() => getTemplate(categoryName), [categoryName, getTemplate]);

  return {
    template,
    loadTemplateForCategory: getTemplate,
  };
}
