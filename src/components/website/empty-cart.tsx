import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-full bg-muted/60 mb-4">
        <ShoppingBag className="h-8 w-8 text-foreground/20" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
      <p className="text-sm text-foreground/50 max-w-sm mb-8">
        Looks like you haven&apos;t added anything yet. Browse our catalog and find something you love.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center justify-center h-11 rounded-xl bg-primary text-primary-foreground font-semibold px-8 hover:bg-primary/90 transition-all active:scale-[0.98]"
      >
        Browse Products
      </Link>
    </div>
  );
}
