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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";

const MOBILE_LINKS = [
  { label: "হোম", href: "/", icon: Store },
  { label: "প্রোডাক্ট", href: "/products", icon: ShoppingBag },
  { label: "ক্যাটাগরি", href: "/categories", icon: Tag },
  { label: "ফ্ল্যাশ সেল", href: "/offers", icon: Zap },
  { label: "যোগাযোগ", href: "/contact", icon: Phone },
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
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const topLevelCategories = categories.filter((c) => c.parentCategoryId === null).slice(0, 8);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="মূল মেনু"
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl lg:hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-slate-950 text-xs font-black">
              N
            </div>
            <span className="text-sm font-black text-slate-900">
              NN <span className="text-amber-500">Enterprise</span>
            </span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
            aria-label="মেনু বন্ধ করুন"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoggedIn && (
            <div className="p-3 border-b border-slate-200 bg-amber-50/50">
              <p className="text-xs font-black text-slate-900 truncate">
                {session?.user?.name ?? "User"}
              </p>
              <p className="text-[11px] font-bold text-slate-500 truncate">
                {session?.user?.email ?? ""}
              </p>
            </div>
          )}

          <nav className="p-3 space-y-1" aria-label="মোবাইল নেভিগেশন">
            {MOBILE_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors",
                  "text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-amber-500",
                )}
              >
                <link.icon className="h-4 w-4 text-slate-500" aria-hidden />
                {link.label}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-500" aria-hidden />
                  অ্যাকাউন্ট ওভারভিউ
                </Link>
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Package className="h-4 w-4 text-slate-500" aria-hidden />
                  আমার অর্ডারসমূহ
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Heart className="h-4 w-4 text-slate-500" aria-hidden />
                  উইশলিস্ট
                </Link>
              </>
            )}
          </nav>

          {topLevelCategories.length > 0 && (
            <nav className="p-3 border-t border-slate-200" aria-label="ক্যাটাগরি">
              <p className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                ক্যাটাগরি
              </p>
              <ul className="space-y-1">
                {topLevelCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      onClick={onClose}
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 shrink-0">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              লগ আউট
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                href="/auth/login"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                লগইন
              </Link>
              <Link
                href="/auth/register"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                <User className="h-4 w-4" aria-hidden />
                অ্যাকাউন্ট খুলুন
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MobileNav;
