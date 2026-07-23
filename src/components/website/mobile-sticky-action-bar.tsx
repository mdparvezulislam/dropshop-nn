"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MobileStickyActionBarProps {
  productName: string;
  price: string;
  isOutOfStock?: boolean;
}

export function MobileStickyActionBar({
  productName,
  price,
  isOutOfStock = false,
}: MobileStickyActionBarProps) {
  const handleAddToCart = () => {
    toast.success(`'${productName}' কার্টে যোগ করা হয়েছে!`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl">
      <div className="flex items-center space-x-2">
        {/* Add to Cart Button */}
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 min-h-[44px] text-xs font-black bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md disabled:opacity-40"
        >
          <ShoppingBag className="w-4 h-4 mr-1.5" />
          <span>{isOutOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}</span>
        </Button>

        {/* Buy Now Direct CTA Button */}
        {!isOutOfStock && (
          <Link href="/checkout" className="flex-1">
            <Button
              type="button"
              className="w-full min-h-[44px] text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              <span>এখনই কিনুন ({price})</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
