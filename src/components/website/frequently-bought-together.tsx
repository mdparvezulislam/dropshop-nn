"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BundleItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface FrequentlyBoughtTogetherProps {
  mainProductName: string;
  mainProductPrice: number;
  mainProductImage: string;
}

const MOCK_BUNDLE_ITEMS: BundleItem[] = [
  {
    id: "b-1",
    name: "GaN 65W টাইপ-সি ফার্স্ট চার্জিং ক্যাবল",
    price: 350,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "b-2",
    name: "সিলিকন প্রটেক্টিভ কভার কেস",
    price: 150,
    image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=200&q=80",
  },
];

export function FrequentlyBoughtTogether({
  mainProductName,
  mainProductPrice,
  mainProductImage,
}: FrequentlyBoughtTogetherProps) {
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>(["b-1", "b-2"]);

  const toggleItem = (id: string) => {
    setSelectedBundleIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedBundleTotal = MOCK_BUNDLE_ITEMS.filter((i) => selectedBundleIds.includes(i.id)).reduce(
    (acc, item) => acc + item.price,
    0
  );

  const grandTotal = mainProductPrice + selectedBundleTotal;

  const handleAddBundle = () => {
    toast.success("বান্ডেল প্যাকেজের সকল প্রোডাক্ট কার্টে যোগ করা হয়েছে!");
  };

  return (
    <div className="mt-8 bg-white rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-black text-foreground">
        একসাথে কিনতে কাস্টমাররা বেশি পছন্দ করেন (Frequently Bought Together)
      </h3>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Product Cards Row */}
        <div className="flex items-center gap-3 overflow-x-auto py-2">
          {/* Main Product */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200 shrink-0 w-48">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border shrink-0">
              <Image
                src={mainProductImage || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80"}
                alt={mainProductName}
                fill
                className="object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-foreground truncate">{mainProductName}</p>
              <p className="text-xs font-black text-amber-600">৳{(mainProductPrice / 100).toFixed(0)}</p>
            </div>
          </div>

          <Plus className="h-4 w-4 text-muted-foreground shrink-0" />

          {/* Bundle Items */}
          {MOCK_BUNDLE_ITEMS.map((item, idx) => {
            const isChecked = selectedBundleIds.includes(item.id);
            return (
              <div key={item.id} className="flex items-center gap-2 shrink-0">
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border cursor-pointer transition-all w-48 ${
                    isChecked ? "bg-amber-50/60 border-amber-300" : "bg-white border-border/80 opacity-60"
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                    <p className="text-xs font-black text-amber-600">৳{item.price}</p>
                  </div>
                </div>

                {idx < MOCK_BUNDLE_ITEMS.length - 1 && (
                  <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Total & Add Button */}
        <div className="flex flex-col items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border/80 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-bold">মোট প্যাকেজ মূল্য:</span>
            <p className="text-xl font-black text-amber-600">৳{(grandTotal / 100).toFixed(0)}</p>
          </div>
          <Button
            size="sm"
            onClick={handleAddBundle}
            className="h-10 px-5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
          >
            <ShoppingBag className="h-4 w-4 mr-1.5" />
            বান্ডেল কার্টে যোগ করুন
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FrequentlyBoughtTogether;
