"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, ChevronDown, Store } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AnnouncementBar } from "./announcement-bar";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";
import { SearchInput } from "./search-input";
import { AccountMenu } from "./account-menu";
import { CartButton } from "./cart-button";
import { Button } from "@/components/ui/button";

const BANGLA_NAV_ITEMS = [
  { label: "হোম", href: "/" },
  { label: "প্রোডাক্ট", href: "/products" },
  { label: "ক্যাটাগরি", href: "/categories", hasMega: true },
  { label: "ফ্ল্যাশ সেল", href: "/offers" },
  { label: "ব্র্যান্ড", href: "/brands" },
  { label: "ব্লগ", href: "/blog" },
  { label: "যোগাযোগ", href: "/contact" },
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
          "sticky top-0 z-50 w-full transition-all duration-200 bg-white",
          scrolled ? "border-b border-slate-200 shadow-xs" : "border-b border-slate-200/70",
        )}
      >
        <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 lg:h-20 items-center justify-between gap-4">
            {/* Mobile menu trigger */}
            <button
              type="button"
              className="lg:hidden -ml-1 p-2 text-slate-800 hover:text-slate-900 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                D
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  Dropshop<span className="text-amber-500">NN</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Commerce OS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden xl:flex items-center gap-6 ml-6"
              role="navigation"
              aria-label="Main navigation"
            >
              {BANGLA_NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => item.hasMega && setActiveMega(item.label)}
                  onMouseLeave={() => setActiveMega(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 py-2 text-xs sm:text-sm font-black text-slate-800 hover:text-amber-600 transition-colors",
                    )}
                  >
                    {item.label}
                    {item.hasMega && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-slate-500 transition-transform duration-200",
                          activeMega === item.label && "rotate-180 text-amber-600",
                        )}
                      />
                    )}
                  </Link>
                  {item.hasMega && (
                    <MegaMenu
                      isOpen={activeMega === item.label}
                      onClose={() => setActiveMega(null)}
                    />
                  )}
                </div>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Search + Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Enterprise Search Input Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100/80 border border-slate-300/80 rounded-xl hover:bg-white hover:border-amber-500 hover:text-slate-900 transition-all w-52 xl:w-64 shadow-2xs group"
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-amber-500 transition-colors" />
                <span className="truncate">প্রোডাক্ট সার্চ করুন...</span>
                <span className="ml-auto text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-300">
                  ⌘K
                </span>
              </button>

              {/* Reseller Become CTA (Golden Amber Button) */}
              <Link href="/become-reseller" className="hidden sm:inline-flex">
                <Button
                  size="sm"
                  className="h-9 px-4 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                >
                  <Store className="h-3.5 w-3.5 mr-1.5" />
                  রিসেলার হন
                </Button>
              </Link>

              {/* Wholesale Login Link */}
              <Link
                href="/become-wholesale-partner"
                className="hidden md:inline-block text-xs font-extrabold text-slate-800 hover:text-amber-600 transition-colors px-2 py-1"
              >
                হোলসেলার লগইন
              </Link>

              {/* Cart Button */}
              <CartButton />

              {/* Account Menu */}
              <AccountMenu />
            </div>
          </div>
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
