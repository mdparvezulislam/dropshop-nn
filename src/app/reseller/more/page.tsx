"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Wallet,
  BarChart3,
  Image as ImageIcon,
  Users,
  Settings,
  Headphones,
  FileText,
  Shield,
  ChevronRight,
  LogOut,
  Store,
  Sparkles,
  Package,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RESELLER_MENU_GROUPS = [
  {
    title: "ব্যবসা ও ফাইন্যান্স",
    items: [
      { label: "মাই ওয়ালেট ও পে-আউট", href: "/reseller/wallet", icon: Wallet, badge: "টাকা উত্তোলন" },
      { label: "সেলস রিপোর্টস ও এনালিটিক্স", href: "/reseller/reports", icon: BarChart3, badge: null },
      { label: "মার্কেটিং কিট ও ব্যানার", href: "/reseller/marketing-kit", icon: ImageIcon, badge: "নতুন" },
    ],
  },
  {
    title: "কাস্টমার ও ডেলিভারি",
    items: [
      { label: "কাস্টমার লিস্ট", href: "/reseller/customers", icon: Users, badge: null },
      { label: "আমার অর্ডারসমূহ", href: "/reseller/orders", icon: Package, badge: null },
    ],
  },
  {
    title: "দোকান ও সেটিংস",
    items: [
      { label: "রিসেলার শপ সেটিংস", href: "/reseller/settings", icon: Settings, badge: null },
      { label: "হেল্প সেন্টার ও সাপোর্ট", href: "/reseller/support", icon: Headphones, badge: "২৪/৭" },
      { label: "ওয়ার্কস্পেস পরিবর্তন", href: "/dashboard", icon: Store, badge: null },
    ],
  },
];

export default function ResellerMorePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-6">
      {/* Reseller Profile Overview Banner */}
      <div className="bg-linear-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <Avatar className="h-13 w-13 border-2 border-amber-500/50 shadow-xs">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "Reseller"} />
            <AvatarFallback className="bg-amber-500 text-slate-950 font-black text-base">
              {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-black truncate">
                {user?.name || "রিসেলার পার্টনার"}
              </h2>
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            </div>
            <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
              {user?.email || "ভেরিফাইড রিসেলার শপ"}
            </p>
          </div>
        </div>

        <Link
          href="/reseller/settings"
          className="text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/15 px-3 py-1.5 rounded-xl transition-all active:scale-95 touch-manipulation shrink-0 relative z-10"
        >
          সেটিংস
        </Link>
      </div>

      {/* Menu Groups */}
      {RESELLER_MENU_GROUPS.map((group) => (
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
                    <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
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
