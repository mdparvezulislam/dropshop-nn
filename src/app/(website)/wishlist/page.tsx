import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Saved Wishlist - DropshopNN Bangladesh",
  description: "View and manage your saved electronics, chargers, and audio accessories.",
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-heading flex items-center gap-2.5">
              <Heart className="w-7 h-7 text-amber-400 fill-amber-400" /> Saved Wishlist
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Items saved for future purchase or quick wholesale ordering.
            </p>
          </div>
          <Link
            href="/account/wishlist"
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Manage in Account →
          </Link>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your wishlist is ready</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Log in to access synchronized wishlist items across your devices or explore our catalog
            to add products.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
            >
              Sign In to View Saved Items
            </Link>
            <Link
              href="/products"
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
