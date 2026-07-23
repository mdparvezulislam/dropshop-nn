"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { X, Store, ShoppingBag, Tag, Zap, Phone, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MOBILE_LINKS = [
  { label: "Home", href: "/", icon: Store },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Categories", href: "/categories", icon: Tag },
  { label: "Flash Sale", href: "/flash-sale", icon: Zap },
  { label: "Contact", href: "/contact", icon: Phone },
];

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-xl lg:hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              D
            </div>
            <span className="text-sm font-semibold">
              Dropshop<span className="text-primary">NN</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-foreground/50 hover:text-foreground rounded-md hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Mobile navigation">
          {MOBILE_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                "text-foreground/70 hover:text-foreground hover:bg-muted",
              )}
            >
              <link.icon className="h-4 w-4 text-foreground/50" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/60">
          <div className="space-y-2">
            <Link
              href="/auth/login"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <User className="h-4 w-4" />
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}
