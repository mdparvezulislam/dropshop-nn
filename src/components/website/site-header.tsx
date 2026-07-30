"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, ChevronDown, Store, Building2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AnnouncementBar } from "./announcement-bar";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";
import { SearchInput } from "./search-input";
import { AccountMenu } from "./account-menu";
import { CartButton } from "./cart-button";
import { WishlistCounter } from "./wishlist/wishlist-counter";
import { Button } from "@/components/ui/button";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";

const BANGLA_NAV_ITEMS = [
  { label: "হোম", href: "/" },
  { label: "প্রোডাক্ট", href: "/products" },
  { label: "ক্যাটাগরি", href: "/categories", hasMega: true },
  { label: "ফ্ল্যাশ সেল", href: "/offers" },
  { label: "ব্র্যান্ড", href: "/brands" },
  { label: "ব্লগ", href: "/blog" },
  { label: "যোগাযোগ", href: "/contact" },
] as const;

const MEGA_MENU_ID = "site-mega-menu";

export interface SiteHeaderProps {
  /** Real taxonomy from the server layout; empty when the fetch failed. */
  categories?: PublicCategoryInfo[];
}

export function SiteHeader({ categories = [] }: SiteHeaderProps): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
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
        <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
          <div className="flex h-18 lg:h-20 items-center justify-between gap-4">
            {/* Mobile menu trigger */}
            <button
              type="button"
              className="lg:hidden -ml-1 p-2 text-slate-800 hover:text-slate-900 transition-colors touch-manipulation active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500 rounded-lg"
              onClick={() => setMobileOpen(true)}
              aria-label="মেনু খুলুন"
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                N
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  NN <span className="text-amber-500">Enterprise</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Commerce OS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-6 ml-6" aria-label="প্রধান নেভিগেশন">
              {BANGLA_NAV_ITEMS.map((item) =>
                "hasMega" in item && item.hasMega ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                    onBlur={(e) => {
                      // Close only when focus leaves the trigger AND the panel.
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setMegaOpen(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setMegaOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={megaOpen}
                      aria-haspopup="true"
                      aria-controls={MEGA_MENU_ID}
                      onFocus={() => setMegaOpen(true)}
                      onClick={() => setMegaOpen((open) => !open)}
                      className="flex items-center gap-1 py-2 text-xs sm:text-sm font-black text-slate-800 hover:text-amber-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "h-3.5 w-3.5 text-slate-500 transition-transform duration-200",
                          megaOpen && "rotate-180 text-amber-600",
                        )}
                      />
                    </button>
                    <MegaMenu
                      id={MEGA_MENU_ID}
                      isOpen={megaOpen}
                      onClose={() => setMegaOpen(false)}
                      categories={categories}
                    />
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="py-2 text-xs sm:text-sm font-black text-slate-800 hover:text-amber-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="flex-1" />

            {/* Search + Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100/80 border border-slate-300/80 rounded-xl hover:bg-white hover:border-amber-500 hover:text-slate-900 transition-all w-52 xl:w-64 shadow-2xs group focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <Search
                  className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-amber-500 transition-colors"
                  aria-hidden
                />
                <span className="truncate">প্রোডাক্ট সার্চ করুন...</span>
                <span className="ml-auto text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-300">
                  ⌘K
                </span>
              </button>

              <Link href="/become-reseller" className="hidden sm:inline-flex">
                <Button
                  size="sm"
                  className="h-9 px-4 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
                >
                  <Store className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                  রিসেলার হন
                </Button>
              </Link>

              <Link
                href="/become-wholesale-partner"
                className="hidden md:inline-flex items-center h-9 px-3.5 text-xs font-extrabold text-slate-800 bg-slate-100 border border-slate-300 hover:bg-slate-200 hover:border-slate-400 hover:text-slate-950 rounded-xl transition-all shadow-2xs focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <Building2 className="h-3.5 w-3.5 mr-1.5 text-slate-600" aria-hidden />
                হোলসেলার হন
              </Link>

              <WishlistCounter />

              <CartButton />

              <AccountMenu />
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <MobileNav
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          categories={categories}
        />
      )}

      {searchOpen && <SearchInput open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}

export default SiteHeader;
