import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import "@/features/public/styles/public-theme.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { SITE_URL } from "@/config/site";
import { BRAND } from "@/config/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.publicName} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.publicName}`,
  },
  description:
    "অরিজিনাল প্রোডাক্ট, পাইকারি ও খুচরা দামে — রিসেলার, হোলসেলার এবং ড্রপশিপারদের জন্য বাংলাদেশের অনলাইন শপ।",
};

const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.NEXT_PHASE === "phase-export";

const themeBootstrapScript = `
(function() {
  try {
    var stored = localStorage.getItem('dropshop-theme');
    var theme = (stored === 'light' || stored === 'dark') ? stored : 'light';
    var root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = theme;
    root.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window === "undefined" && !isBuildTime) {
    import("@/lib/platform/bootstrap-server").then(({ ensurePlatformInitialized }) => {
      ensurePlatformInitialized().catch(() => {});
    });
  }

  return (
    <html
      lang="en"
      className={`${hindSiliguri.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
