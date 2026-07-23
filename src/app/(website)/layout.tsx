import { AuthProvider } from "@/providers/auth-provider";
import { SiteHeader } from "@/components/website/site-header";
import { SiteFooter } from "@/components/website/site-footer";
import { CookieBanner } from "@/components/website/cookie-banner";

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
