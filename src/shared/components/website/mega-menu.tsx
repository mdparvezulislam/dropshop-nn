"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const CATEGORIES = [
  {
    name: "Electronics",
    href: "/category/electronics",
    items: ["Smart Watches", "Audio & Speakers", "Power Banks", "Accessories", "Rechargeable Devices"],
  },
  {
    name: "Fashion",
    href: "/category/fashion",
    items: ["Men", "Women", "Kids", "Footwear", "Accessories"],
  },
  {
    name: "Home & Living",
    href: "/category/home-living",
    items: ["Furniture", "Decor", "Kitchen", "Bedding", "Lighting"],
  },
  {
    name: "Beauty",
    href: "/category/beauty",
    items: ["Skincare", "Makeup", "Haircare", "Fragrance", "Tools"],
  },
];

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full mt-1 w-[600px] rounded-xl border border-border/60 bg-card shadow-lg backdrop-blur-xl overflow-hidden"
            onMouseLeave={onClose}
          >
            <div className="grid grid-cols-2 gap-px bg-border/30">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="p-5 hover:bg-muted/30 transition-colors">
                  <Link
                    href={cat.href}
                    className="flex items-center justify-between group mb-3"
                  >
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                  </Link>
                  <ul className="space-y-1.5">
                    {cat.items.map((item) => (
                      <li key={item}>
                        <Link
                          href={`${cat.href}/${item.toLowerCase()}`}
                          className="text-sm text-foreground/60 hover:text-foreground hover:pl-0.5 transition-all"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-t border-border/40">
              <Link
                href="/categories"
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all categories
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
