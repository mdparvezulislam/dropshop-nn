import { AuthProvider } from "@/providers/auth-provider";
import { SiteHeader } from "@/components/website/site-header";
import { SiteFooter } from "@/components/website/site-footer";
import { CookieBanner } from "@/components/website/cookie-banner";
import { FloatingActions } from "@/components/website/floating-actions";
import { StorefrontJsonLd } from "@/components/website/storefront-json-ld";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-layout="public">
      <AuthProvider>
        <StorefrontJsonLd />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <FloatingActions />
        <CookieBanner />
      </AuthProvider>
    </div>
  );
}

