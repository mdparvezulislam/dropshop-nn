"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Heart,
  Star,
  HelpCircle,
  Shield,
  FileText,
  MapPin,
  Lock,
  LogOut,
  ChevronRight,
  User,
  ShoppingBag,
  Bell,
  Headphones,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MENU_GROUPS = [
  {
    title: "শপিং ও কর্মকাণ্ড",
    items: [
      { label: "আমার উইশলিস্ট", href: "/account/wishlist", icon: Heart, badge: null },
      { label: "আমার রিভিউসমূহ", href: "/account/reviews", icon: Star, badge: null },
      { label: "ঠিকানা সমুহ", href: "/account/addresses", icon: MapPin, badge: null },
    ],
  },
  {
    title: "নিরাপত্তা ও অ্যাকাউন্ট",
    items: [
      { label: "মাই প্রোফাইল", href: "/account/profile", icon: User, badge: null },
      { label: "পাসওয়ার্ড ও সিকিউরিটি", href: "/account/security", icon: Lock, badge: null },
      { label: "নোটিফিকেশন সেটিং", href: "/account/notifications", icon: Bell, badge: "নতুন" },
    ],
  },
  {
    title: "সাহায্য ও অন্যান্য",
    items: [
      { label: "সাপোর্ট ও সহায়তা", href: "/contact", icon: Headphones, badge: "২৪/৭" },
      { label: "সচরাচর জিজ্ঞাসা (FAQ)", href: "/faq", icon: HelpCircle, badge: null },
      { label: "গোপনীয়তা নীতি (Privacy)", href: "/privacy", icon: Shield, badge: null },
      { label: "শর্তাবলী (Terms)", href: "/terms", icon: FileText, badge: null },
    ],
  },
];

export default function AccountMorePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-6">
      {/* Profile Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-amber-500/30">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
            <AvatarFallback className="bg-amber-500 text-slate-950 font-black">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
              {user?.name || "সম্মানিত গ্রাহক"}
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              {user?.email || (user as { phone?: string })?.phone || "অ্যাকাউন্ট ভেরিফাইড"}
            </p>
          </div>
        </div>

        <Link
          href="/account/profile"
          className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-3 py-1.5 rounded-xl transition-colors active:scale-95 touch-manipulation shrink-0"
        >
          এডিট
        </Link>
      </div>

      {/* Menu Groups */}
      {MENU_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 px-1 uppercase tracking-wider">
            {group.title}
          </h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors active:bg-slate-100 dark:active:bg-slate-800 touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-98 touch-manipulation"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span>লগআউট করুন</span>
        </button>
      </div>
    </div>
  );
}
