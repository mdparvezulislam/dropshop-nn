"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AnnouncementBar } from "./announcement-bar";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";
import { SearchInput } from "./search-input";
import { AccountMenu } from "./account-menu";
import { CartButton } from "./cart-button";

const MAIN_NAV = [
  { label: "Browse Products", href: "/products" },
  { label: "Categories", href: "/categories", hasMega: true },
  { label: "Collections", href: "/collections" },
  { label: "Brands", href: "/brands" },
];

const BUSINESS_NAV = [
  { label: "Become a Reseller", href: "/become-reseller" },
  { label: "Wholesale Partner", href: "/become-wholesale-partner" },
  { label: "Supplier Program", href: "/become-supplier" },
];

const SUPPORT_NAV = [
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
  { label: "Support", href: "/support" },
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

      {/* Top Info Bar */}
      <div className="hidden sm:block bg-white border-b border-[hsl(0_0%_91%)] text-[10px] text-[hsl(215_16%_47%)]">
        <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="tel:+8801700000000"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>+880 1700-000000</span>
            </a>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              24/7 Business Support
            </span>
          </div>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-white transition-all duration-200",
          scrolled
            ? "border-b border-[hsl(0_0%_91%)] shadow-sm"
            : "border-b border-[hsl(0_0%_91%)]",
        )}
      >
        <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
          {/* Top Row: Logo + Search */}
          <div className="flex h-20 items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                D
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-foreground leading-tight">
                  Dropshop<span className="text-primary">NN</span>
                </span>
                <span className="text-[10px] text-[hsl(215_16%_47%)] font-medium">Commerce OS</span>
              </div>
            </Link>

            {/* Search - Desktop */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex flex-1 max-w-md items-center gap-3 px-4 py-2.5 text-sm text-[hsl(215_16%_47%)] bg-[hsl(0_0%_96%)] border border-[hsl(0_0%_91%)] rounded-lg hover:border-primary/40 hover:bg-white transition-all shadow-xs"
            >
              <Search className="h-4 w-4 shrink-0 text-[hsl(215_16%_47%)]" />
              <span className="truncate">Search products, brands, categories...</span>
              <span className="hidden lg:inline ml-auto text-[10px] font-mono font-medium text-[hsl(215_16%_47%)] bg-white px-2 py-1 rounded border border-[hsl(0_0%_91%)]">
                ⌘K
              </span>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Mobile Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 text-[hsl(222_47%_11%/0.7)] hover:text-primary hover:bg-[hsl(0_0%_96%)] rounded-lg transition-all"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Cart */}
              <CartButton />

              {/* Account */}
              <AccountMenu />

              {/* Mobile Menu */}
              <button
                type="button"
                className="lg:hidden p-2 text-[hsl(222_47%_11%/0.7)] hover:text-primary hover:bg-[hsl(0_0%_96%)] rounded-lg transition-all"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Navigation - Desktop Only */}
          <nav className="hidden lg:flex h-12 items-center gap-8 border-t border-[hsl(0_0%_91%)] border-opacity-50">
            {/* Main Navigation */}
            <div className="flex items-center gap-1">
              {MAIN_NAV.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.hasMega && setActiveMega(item.label)}
                  onMouseLeave={() => setActiveMega(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      "text-[hsl(215_16%_47%)] hover:text-foreground hover:bg-[hsl(0_0%_96%)]",
                    )}
                  >
                    {item.label}
                    {item.hasMega && <ChevronDown className="h-4 w-4 transition-transform" />}
                  </Link>
                  {item.hasMega && (
                    <MegaMenu
                      isOpen={activeMega === item.label}
                      onClose={() => setActiveMega(null)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1" />

            {/* Business Navigation */}
            <div className="flex items-center gap-1">
              <div className="px-2 py-2 border-l border-[hsl(0_0%_91%)] pl-3 flex gap-1">
                {BUSINESS_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-primary hover:bg-[hsl(0_85%_96%)] rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && <SearchInput open={searchOpen} onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

export default SiteHeader;
