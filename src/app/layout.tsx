import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/features/public/styles/public-theme.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { SITE_URL } from "@/config/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DropshopNN — বাংলাদেশের অনলাইন শপ",
    template: "%s | DropshopNN",
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
    var theme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = resolved;
    root.setAttribute('data-theme', resolved);
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Extensions (password managers, anti-trackers) inject attributes such as
          `bis_register` onto <body> before React hydrates, which otherwise reports a
          hydration mismatch on every page load. */}
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        {/* Must stay the first node in <body>: it runs before any content is
            painted, so the saved theme is applied with no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
