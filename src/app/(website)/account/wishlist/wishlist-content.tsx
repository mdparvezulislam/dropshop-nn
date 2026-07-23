"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/website/price-display";
import { removeWishlistItemAction } from "@/features/identity/actions/account-actions";

interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  retailPrice: number;
  comparePrice?: number;
  rating: number;
  stockStatus: string;
  wishlistId: string;
}

export function WishlistPageContent({ initialItems }: { initialItems: WishlistItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (productId: string, wishlistId: string) => {
    setRemovingId(productId);
    await removeWishlistItemAction(wishlistId);
    setItems((prev) => prev.filter((i) => i.id !== productId));
    setRemovingId(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length > 0
              ? `${items.length} item${items.length !== 1 ? "s" : ""} saved`
              : "Your wishlist is empty."}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Heart className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No items in your wishlist yet.</p>
            <Link href="/">
              <Button variant="outline" size="sm" className="mt-3">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group relative rounded-xl border border-border/40 bg-card overflow-hidden hover:shadow-md transition-all"
            >
              <Link href={`/product/${item.slug}`} className="block">
                <div className="aspect-square relative bg-muted">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/30">
                      <Heart className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </Link>

              <button
                type="button"
                onClick={() => handleRemove(item.id, item.wishlistId)}
                disabled={removingId === item.id}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors"
              >
                {removingId === item.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>

              <div className="p-3 space-y-1.5">
                <Link href={`/product/${item.slug}`}>
                  <h3 className="text-sm font-medium truncate hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <PriceDisplay retailPrice={item.retailPrice} comparePrice={item.comparePrice} />
                <div className="flex items-center gap-1.5 pt-1">
                  {item.stockStatus === "out_of_stock" ? (
                    <Badge variant="outline" className="text-[10px] text-rose-500 border-rose-200">
                      Out of Stock
                    </Badge>
                  ) : (
                    <Link href={`/product/${item.slug}`} className="w-full">
                      <Button size="sm" variant="soft" className="w-full gap-1 text-xs h-7">
                        <ShoppingCart className="h-3 w-3" />
                        Add to Cart
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
