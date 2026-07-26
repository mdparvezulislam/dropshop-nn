"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeftRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductCardData } from "./product-card";

interface CompareDrawerProps {
  products: ProductCardData[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function CompareDrawer({ products, onRemove, onClear }: CompareDrawerProps) {
  if (products.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/80 shadow-2xl p-4"
      >
        <div className="mx-auto max-w-(--content-max) flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold shrink-0">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-foreground">
                প্রোডাক্ট তুলনা ({products.length}/4)
              </h4>
              <p className="text-[11px] text-muted-foreground">
                নির্বাচিত প্রোডাক্টগুলোর স্পেসিফিকেশন তুলনা করুন
              </p>
            </div>
          </div>

          {/* Product Items List */}
          <div className="flex items-center gap-3 overflow-x-auto py-1">
            {products.map((p) => (
              <div
                key={p.id}
                className="relative flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border/80 w-44 shrink-0"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white border">
                  <Image
                    src={
                      p.image ||
                      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=100&q=80"
                    }
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] font-extrabold text-amber-600">
                    ৳{(p.retailPrice / 100).toFixed(0)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/compare">
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
              >
                তুলনা দেখুন
              </Button>
            </Link>
            <button
              type="button"
              onClick={onClear}
              className="p-2 text-xs text-muted-foreground hover:text-red-600 font-semibold"
            >
              মুছে ফেলুন
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CompareDrawer;
