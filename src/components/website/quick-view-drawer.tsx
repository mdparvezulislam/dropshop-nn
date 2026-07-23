"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "./price-display";
import type { ProductCardData } from "./product-card";
import { toast } from "sonner";

interface QuickViewDrawerProps {
  product: ProductCardData | null;
  onClose: () => void;
}

export function QuickViewDrawer({ product, onClose }: QuickViewDrawerProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    toast.success(`'${product.name}' কার্টে যোগ করা হয়েছে (${quantity} টি)!`);
    onClose();
  };

  const displayImage = !product.image || product.image === "Product Image"
    ? "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
    : product.image;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/20">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">
              কুইক ভিউ
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="relative aspect-square rounded-2xl bg-muted/30 overflow-hidden border border-border/80">
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                {product.brand && (
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    {product.brand}
                  </span>
                )}

                <h2 className="text-lg font-black text-foreground leading-snug">
                  {product.name}
                </h2>

                {product.rating != null && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.round(product.rating!) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-foreground">{product.rating}</span>
                  </div>
                )}

                {/* BDT Price Display */}
                <PriceDisplay
                  retailPrice={product.retailPrice}
                  resellerPrice={product.resellerPrice}
                  wholesalePrice={product.wholesalePrice}
                  comparePrice={product.comparePrice}
                  showLabel={true}
                />

                <p className="text-xs text-muted-foreground leading-relaxed">
                  ১০০% অরিজিনাল প্রোডাক্ট, অফিসিয়াল ওয়ারেন্টি এবং দ্রুত সারা বাংলাদেশে ডেলিভারি সুবিধা।
                </p>

                {/* Quantity Control */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-foreground">পরিমাণ:</span>
                  <div className="flex items-center rounded-xl border border-border/80 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-foreground hover:bg-muted rounded-l-xl transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-extrabold text-foreground">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 text-foreground hover:bg-muted rounded-r-xl transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantees Bar */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/60 text-[11px] font-bold text-foreground/80">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                <span>অরিজিনাল গ্যারান্টি</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <Truck className="h-4 w-4 text-amber-500 shrink-0" />
                <span>দ্রুত ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <RotateCcw className="h-4 w-4 text-amber-500 shrink-0" />
                <span>সহজ রিটার্ন</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/80 bg-white flex items-center gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="flex-1 h-11 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-md"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              কার্টে যোগ করুন (৳{((product.retailPrice * quantity) / 100).toFixed(0)})
            </Button>
            <Link href={`/product/${product.slug}`} className="shrink-0">
              <Button size="lg" variant="outline" className="h-11 px-4 text-xs font-bold border-border/80">
                সম্পূর্ণ তথ্য
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default QuickViewDrawer;
