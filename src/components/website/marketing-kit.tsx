"use client";

import { motion } from "framer-motion";
import { Download, Image, FileText, Share2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

interface MarketingKitProps {
  productName: string;
  assets?: { label: string; type: "image" | "document" | "social"; url: string }[];
}

const defaultAssets = [
  { label: "Product Images", type: "image" as const, url: "#" },
  { label: "Description Sheet", type: "document" as const, url: "#" },
  { label: "Social Media Kit", type: "social" as const, url: "#" },
];

export function MarketingKit({ productName, assets = defaultAssets }: MarketingKitProps) {
  const { userRole } = usePermissions();

  const hasAccess = userRole === "reseller" || userRole === "admin" || userRole === "super_admin";

  if (!hasAccess) return null;

  const typeIcons = {
    image: Image,
    document: FileText,
    social: Share2,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="py-8 border-t border-border/40"
    >
      <h2 className="text-lg font-semibold text-foreground mb-2">Marketing Kit</h2>
      <p className="text-sm text-foreground/50 mb-4">Download assets for {productName}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {assets.map((asset) => {
          const Icon = typeIcons[asset.type];
          return (
            <a
              key={asset.label}
              href={asset.url}
              download
              className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/20 hover:shadow-sm transition-all group"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{asset.label}</p>
                <p className="text-[11px] text-foreground/40 capitalize">{asset.type}</p>
              </div>
              <Download className="h-4 w-4 text-foreground/30 group-hover:text-primary transition-colors" />
            </a>
          );
        })}
      </div>
    </motion.section>
  );
}
