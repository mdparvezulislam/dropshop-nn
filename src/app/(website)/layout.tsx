import { AuthProvider } from "@/shared/components/auth-provider";
import { SiteHeader } from "@/shared/components/website/site-header";
import { SiteFooter } from "@/shared/components/website/site-footer";
import { CookieBanner } from "@/shared/components/website/cookie-banner";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieBanner />
    </AuthProvider>
  );
}
