"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

const guestItems = [
  { label: "লগইন করুন", href: "/auth/login", icon: LogIn },
  { label: "অ্যাকাউন্ট খুলুন", href: "/auth/register", icon: UserPlus },
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
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const { isSuperAdmin } = usePermissions();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isLoading = status === "loading";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 hover:text-amber-600 hover:border-amber-400 transition-colors shadow-2xs disabled:opacity-60"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
        ) : (
          <User className="h-4.5 w-4.5" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute right-0 top-full mt-1.5 z-50 w-60 rounded-2xl border border-slate-300 bg-white shadow-xl overflow-hidden text-slate-900"
            >
              {isLoggedIn && (
                <div className="px-3.5 py-3 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {session?.user?.name}
                    </p>
                    {isSuperAdmin && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md shrink-0">
                        <Crown className="h-3 w-3 text-amber-600 fill-amber-500" /> Super Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 truncate mt-0.5">
                    {session?.user?.email}
                  </p>
                </div>
              )}

              {/* Admin All Workspace Quick Access */}
              {isLoggedIn && isSuperAdmin && (
                <div className="p-1.5 border-b border-slate-200 bg-amber-50/50 space-y-0.5">
                  <p className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900">
                    অল ওয়ার্কস্পেস অ্যাক্সেস
                  </p>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-extrabold text-slate-900 hover:bg-amber-100 transition-colors"
                  >
                    <Crown className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    এডমিন ড্যাশবোর্ড
                  </Link>
                  <Link
                    href="/reseller"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-extrabold text-slate-900 hover:bg-amber-100 transition-colors"
                  >
                    <Store className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    রিসেলার হাব
                  </Link>
                  <Link
                    href="/wholesale"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-extrabold text-slate-900 hover:bg-amber-100 transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    হোলসেল পোর্টাল
                  </Link>
                  <Link
                    href="/supplier"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-extrabold text-slate-900 hover:bg-amber-100 transition-colors"
                  >
                    <Factory className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    সাপ্লায়ার কনসোল
                  </Link>
                </div>
              )}

              <div className="p-1.5 space-y-0.5">
                {(isLoggedIn ? userItems : guestItems).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-slate-500" />
                    {item.label}
                  </Link>
                ))}
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    লগ আউট
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
