"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  ShieldAlert,
  BarChart3,
  Tag,
  Sliders,
  Image as ImageIcon,
  Settings,
  FileText,
  Key,
  LogOut,
  ChevronRight,
  Sparkles,
  Users,
  Package,
  Layers,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ADMIN_MENU_GROUPS = [
  {
    title: "অপারেশনস ও অ্যাপ্রুভাল",
    items: [
      { label: "অ্যাপ্রুভাল সেন্টার (Approvals)", href: "/dashboard/approvals", icon: ShieldAlert, badge: "নতুন রিকোয়েস্ট" },
      { label: "বিজনেস এনালিটিক্স ও রিপোর্ট", href: "/dashboard/analytics", icon: BarChart3, badge: null },
      { label: "ইনভেন্টরি স্টকিং এলার্ট", href: "/dashboard/inventory", icon: Layers, badge: "স্টক আপডেট" },
    ],
  },
  {
    title: "ক্যাটালগ ও মূল্য নির্ধারণ",
    items: [
      { label: "কুপন ও প্রমোশনাল কোড", href: "/dashboard/pricing", icon: Tag, badge: null },
      { label: "প্রাইসিং রুলস ও মার্জিন কনফিগ", href: "/dashboard/pricing", icon: Sliders, badge: null },
      { label: "মিডিয়া লাইব্রেরি", href: "/dashboard/content", icon: ImageIcon, badge: null },
    ],
  },
  {
    title: "সিস্টেম ও সিকিউরিটি",
    items: [
      { label: "অডিট লগ্স (Audit Logs)", href: "/dashboard/audit", icon: FileText, badge: null },
      { label: "সিস্টেম সেটিংস", href: "/dashboard/settings", icon: Settings, badge: null },
      { label: "ওয়ার্কস্পেস নির্বাচন", href: "/dashboard", icon: Sparkles, badge: null },
    ],
  },
];

export default function AdminMorePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-6">
      {/* Admin Profile Overview Banner */}
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <Avatar className="h-13 w-13 border-2 border-amber-500/50 shadow-xs">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "Admin"} />
            <AvatarFallback className="bg-amber-500 text-slate-950 font-black text-base">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-black truncate">
                {user?.name || "অ্যাডমিন সুপারভাইজার"}
              </h2>
              <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
              {user?.email || "অপারেশনস কন্ট্রোল সেন্টার"}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className="text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/15 px-3 py-1.5 rounded-xl transition-all active:scale-95 touch-manipulation shrink-0 relative z-10"
        >
          সেটিংস
        </Link>
      </div>

      {/* Menu Groups */}
      {ADMIN_MENU_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 px-1 uppercase tracking-wider">
            {group.title}
          </h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href + item.label}
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
