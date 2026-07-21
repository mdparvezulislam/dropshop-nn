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
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

const guestItems = [
  { label: "Sign In", href: "/auth/login", icon: LogIn },
  { label: "Create Account", href: "/auth/register", icon: UserPlus },
];

const userItems = [
  { label: "Account Overview", href: "/account", icon: LayoutDashboard },
  { label: "My Orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Settings", href: "/account/profile", icon: Settings },
];

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center h-9 w-9 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="Account menu"
      >
        <User className="h-4.5 w-4.5" />
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
              className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden"
            >
              {isLoggedIn && (
                <div className="px-3 py-2.5 border-b border-border/40">
                  <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{session?.user?.email}</p>
                </div>
              )}
              <div className="p-1.5 space-y-0.5">
                {(isLoggedIn ? userItems : guestItems).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
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
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
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
