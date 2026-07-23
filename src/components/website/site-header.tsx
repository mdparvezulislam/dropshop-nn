"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingCart, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "./announcement-bar";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";
import { SearchInput } from "./search-input";
import { AccountMenu } from "./account-menu";
import { CartButton } from "./cart-button";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "Categories",
    href: "/categories",
    hasMega: true,
  },
  { label: "Products", href: "/products" },
  { label: "Flash Sale", href: "/flash-sale" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200",
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/80 shadow-xs"
            : "bg-background/70 backdrop-blur-md border-b border-border/40",
        )}
      >
        <div className="mx-auto flex h-16 max-w-(--content-max) items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden -ml-1 p-2 text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm shadow-glow group-hover:scale-105 transition-transform">
              D
            </div>
            <span className="hidden sm:inline text-lg font-extrabold tracking-tight text-foreground">
              Dropshop<span className="text-primary">NN</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-6" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasMega && setActiveMega(item.label)}
                onMouseLeave={() => setActiveMega(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                    "text-foreground/80 hover:text-foreground hover:bg-muted/70",
                  )}
                >
                  {item.label}
                  {item.hasMega && (
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      activeMega === item.label && "rotate-180 text-primary",
                    )} />
                  )}
                </Link>
                {item.hasMega && <MegaMenu isOpen={activeMega === item.label} onClose={() => setActiveMega(null)} />}
              </div>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-muted-foreground bg-card/80 border border-border/80 rounded-lg hover:bg-muted/70 hover:border-primary/40 hover:text-foreground transition-all w-36 sm:w-48 lg:w-60 shadow-2xs group"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              <span className="hidden sm:inline truncate">Search products...</span>
              <span className="hidden lg:inline ml-auto text-[10px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
                ⌘K
              </span>
            </button>

            <CartButton />
            <AccountMenu />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && <SearchInput open={searchOpen} onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

export default SiteHeader;
