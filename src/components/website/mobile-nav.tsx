"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  X,
  Store,
  ShoppingBag,
  Tag,
  Zap,
  Phone,
  User,
  LogIn,
  LayoutDashboard,
  Package,
  Heart,
  LogOut,
  Building2,
  Crown,
  ChevronRight,
  HelpCircle,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { usePermissions } from "@/hooks/use-permissions";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";

const MOBILE_PRIMARY_LINKS = [
  { label: "হোম", href: "/", icon: Store },
  { label: "প্রোডাক্টসমূহ", href: "/products", icon: ShoppingBag },
  { label: "ক্যাটাগরি", href: "/categories", icon: Tag },
  { label: "ফ্ল্যাশ সেল ও অফার", href: "/offers", icon: Zap },
  { label: "অর্ডার ট্র্যাকিং", href: "/track-order", icon: Truck },
  { label: "যোগাযোগ ও হেল্প", href: "/contact", icon: Phone },
] as const;

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: PublicCategoryInfo[];
}

export function MobileNav({
  isOpen,
  onClose,
  categories = [],
}: MobileNavProps): React.ReactElement | null {
  const { data: session, status } = useSession();
  const { isSuperAdmin, hasRole } = usePermissions();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isReseller = hasRole("reseller") || (session?.user as any)?.role === "reseller";
  const isWholesaler = hasRole("wholesaler") || (session?.user as any)?.role === "wholesaler";

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const topLevelCategories = categories.filter((c) => c.parentCategoryId === null).slice(0, 10);

  return (
    <div className="relative z-[100]">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="মূল নেভিগেশন মেনু"
        className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-left duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-base shadow-sm">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 dark:text-slate-100 leading-none">
                NN <span className="text-amber-500">Enterprise</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Commerce OS
              </span>
            </div>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="মেনু বন্ধ করুন"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 p-3 text-xs">
          {/* User Profile Summary */}
          {isLoggedIn ? (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-black text-slate-900 dark:text-slate-100 text-sm truncate">
                  {session?.user?.name || "ইউজার"}
                </p>
                {isSuperAdmin && (
                  <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-300/60 dark:border-amber-900/60 space-y-2">
              <p className="font-black text-slate-900 dark:text-slate-100">স্বাগতম NN Enterprise এ</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                অর্ডার করতে বা পোর্টাল এক্সেস করতে প্রবেশ করুন।
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5" /> লগইন
                </Link>
                <Link
                  href="/auth/register"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs"
                >
                  <User className="h-3.5 w-3.5" /> রেজিস্টার
                </Link>
              </div>
            </div>
          )}

          {/* Quick Business Portals */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
              বিজনেস পোর্টালসমূহ
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/become-reseller"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-800 flex flex-col justify-between hover:bg-amber-500/20 transition-colors"
              >
                <Store className="h-4 w-4 text-amber-600" />
                <span className="font-black text-slate-900 dark:text-slate-100 mt-1">
                  {isReseller ? "রিসেলার হাব" : "রিসেলার হন"}
                </span>
              </Link>
              <Link
                href="/become-wholesale-partner"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                <span className="font-black text-slate-900 dark:text-slate-100 mt-1">
                  {isWholesaler ? "হোলসেল হাব" : "হোলসেলার হন"}
                </span>
              </Link>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              মূল নেভিগেশন
            </p>
            {MOBILE_PRIMARY_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="h-4 w-4 text-slate-400" />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 opacity-60" />
              </Link>
            ))}
          </nav>

          {/* Logged in User Menu Options */}
          {isLoggedIn && (
            <nav className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                আমার অ্যাকাউন্ট
              </p>
              {isSuperAdmin && (
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-black text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40"
                >
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span>এডমিন ড্যাশবোর্ড</span>
                </Link>
              )}
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                <span>অ্যাকাউন্ট ওভারভিউ</span>
              </Link>
              <Link
                href="/account/orders"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Package className="h-4 w-4 text-slate-400" />
                <span>আমার অর্ডারসমূহ</span>
              </Link>
              <Link
                href="/account/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Heart className="h-4 w-4 text-slate-400" />
                <span>উইশলিস্ট</span>
              </Link>
            </nav>
          )}

          {/* Categories List */}
          {topLevelCategories.length > 0 && (
            <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                পপুলার ক্যাটাগরি
              </p>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {topLevelCategories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    onClick={onClose}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 font-bold truncate text-[11px] hover:border-amber-400 transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {isLoggedIn && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center justify-center gap-2 h-10 rounded-xl text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              লগ আউট করুন
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default MobileNav;
