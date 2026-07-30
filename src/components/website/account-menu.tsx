"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  LogIn,
  UserPlus,
  Package,
  Heart,
  Settings,
  LogOut,
  LayoutDashboard,
  MapPin,
  Shield,
  Store,
  Building2,
  Factory,
  Crown,
  ChevronRight,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

const guestItems = [
  { label: "লগইন করুন", href: "/auth/login", icon: LogIn, primary: true },
  { label: "নতুন অ্যাকাউন্ট খুলুন", href: "/auth/register", icon: UserPlus, primary: false },
];

const userItems = [
  { label: "অ্যাকাউন্ট ওভারভিউ", href: "/account", icon: LayoutDashboard },
  { label: "আমার অর্ডারসমূহ", href: "/account/orders", icon: Package },
  { label: "উইশলিস্ট", href: "/account/wishlist", icon: Heart },
  { label: "ঠিকানাসমূহ", href: "/account/addresses", icon: MapPin },
  { label: "সিকিউরিটি", href: "/account/security", icon: Shield },
  { label: "প্রোফাইল সেটিংস", href: "/account/profile", icon: Settings },
];

export function AccountMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const { isSuperAdmin, hasRole } = usePermissions();
  const menuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isReseller = hasRole("reseller") || (session?.user as any)?.role === "reseller";
  const isWholesaler = hasRole("wholesaler") || (session?.user as any)?.role === "wholesaler";

  // Close menu on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left z-50">
      <button
        type="button"
        onClick={handleIconClick}
        className={`flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 rounded-xl border transition-all shadow-2xs touch-manipulation active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
          open || isLoggedIn
            ? "bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-amber-600 hover:border-amber-400"
        }`}
        aria-label="অ্যাকাউন্ট মেনু"
        aria-expanded={open}
      >
        <User className="h-4.5 w-4.5" />
      </button>

      {open && (
        <>
          {/* Backdrop overlay for reliable outside tap handling */}
          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] md:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />

          <div
            className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {isLoggedIn ? (
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                    {session?.user?.name || "ইউজার"}
                  </p>
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md shrink-0">
                      <Crown className="h-3 w-3 text-amber-600 fill-amber-500" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {session?.user?.email}
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/40">
                <p className="text-xs font-black text-slate-900 dark:text-slate-100">অ্যাকাউন্টে অ্যাক্সেস করুন</p>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                  অর্ডার ও প্রোফাইল ট্র্যাক করতে লগইন করুন
                </p>
              </div>
            )}

            {/* Admin All Workspace Quick Access */}
            {isLoggedIn && isSuperAdmin && (
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/30 space-y-0.5">
                <p className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  অল ওয়ার্কস্পেস অ্যাক্সেস
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-900 dark:text-slate-100 hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Crown className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  এডমিন ড্যাশবোর্ড
                </Link>
                <Link
                  href="/reseller"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-900 dark:text-slate-100 hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Store className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  রিসেলার হাব
                </Link>
                <Link
                  href="/wholesale"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-900 dark:text-slate-100 hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  হোলসেল পোর্টাল
                </Link>
              </div>
            )}

            {/* Reseller Portal Quick Link */}
            {isLoggedIn && !isSuperAdmin && isReseller && (
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20">
                <Link
                  href="/reseller"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Store className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  রিসেলার পোর্টাল (প্রোডাক্ট ও সেলস)
                </Link>
              </div>
            )}

            {/* Wholesaler Portal Quick Link */}
            {isLoggedIn && !isSuperAdmin && isWholesaler && (
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20">
                <Link
                  href="/wholesale"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  হোলসেল পোর্টাল
                </Link>
              </div>
            )}

            <div className="p-2 space-y-1">
              {!isLoggedIn
                ? guestItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${
                        item.primary
                          ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    </Link>
                  ))
                : userItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item.label}</span>
                    </Link>
                  ))}

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors mt-1"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>লগ আউট</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AccountMenu;
