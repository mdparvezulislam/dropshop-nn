import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { LocalCartProvider } from "@/features/checkout/store/local-cart";
import { WishlistProvider } from "@/components/website/wishlist/wishlist-provider";
import { SiteHeader } from "@/components/website/site-header";
import { SiteFooter } from "@/components/website/site-footer";
import { CookieBanner } from "@/components/website/cookie-banner";
import { FloatingActions } from "@/components/website/floating-actions";
import { StorefrontJsonLd } from "@/components/website/storefront-json-ld";
import { SkipNavLink } from "@/components/website/skip-nav-link";
import { getPublicCategoriesAction } from "@/features/catalog/actions/public-actions";

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  // One taxonomy fetch feeds the header mega menu, mobile drawer, and footer.
  const categoriesRes = await getPublicCategoriesAction();
  const categories = categoriesRes.success ? categoriesRes.data : [];

  return (
    // Bangla-first storefront; the root layout stays lang="en" for the admin side.
    <div data-layout="public" lang="bn">
      <SkipNavLink />
      <AuthProvider>
        <LocalCartProvider>
          {/* One wishlist fetch per session feeds every heart + the header counter. */}
          <WishlistProvider>
            <StorefrontJsonLd />
            <SiteHeader categories={categories} />
            <main id="main-content" className="flex-1">{children}</main>
            <SiteFooter categories={categories} />
            <FloatingActions />
            <CookieBanner />
            {/* Storefront toast outlet — without this, cart/share confirmations render nowhere. */}
            <Toaster position="top-center" richColors closeButton />
          </WishlistProvider>
        </LocalCartProvider>
      </AuthProvider>
    </div>
  );
}
