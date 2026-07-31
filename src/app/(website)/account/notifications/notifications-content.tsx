"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Megaphone,
  Loader2,
  CheckCircle2,
  CheckCheck,
  Package,
  Sparkles,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateNotificationPreferencesAction } from "@/features/identity/actions/account-actions";

interface NotificationPrefs {
  orderUpdates: boolean;
  marketingMessages: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  type: "order" | "promo" | "system";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "অর্ডার কনফার্ম হয়েছে",
    message: "আপনার অর্ডার #ORD-89234 সফলভাবে প্লেস করা হয়েছে। ক্যাশ অন ডেলিভারিতে প্রসেসিং চলছে।",
    time: "১০ মিনিট আগে",
    read: false,
    link: "/account/orders",
    type: "order",
  },
  {
    id: "2",
    title: "নতুন অফার সতর্কবার্তা!",
    message: "সকল ইলেকট্রনিক্স আইটেমে চলছে ১০% মূল্যছাড়! কুপন কোড WELCOME10 ব্যবহার করুন।",
    time: "২ ঘণ্টা আগে",
    read: false,
    link: "/products",
    type: "promo",
  },
  {
    id: "3",
    title: "ডেলিভারি আপডেট",
    message: "আপনার বিগত অর্ডারটি ডেলিভারিম্যানের নিকট হস্তান্তর করা হয়েছে।",
    time: "১ দিন আগে",
    read: true,
    link: "/account/orders",
    type: "order",
  },
];

const PREF_ITEMS = [
  {
    key: "orderUpdates" as const,
    label: "অর্ডার আপডেট",
    description: "আপনার অর্ডারের বর্তমান স্ট্যাটাস ও ডেলিভারি আপডেট দিন।",
    icon: Bell,
  },
  {
    key: "marketingMessages" as const,
    label: "অফার ও ডিসকাউন্ট",
    description: "বিশেষ ছাড়, প্রোমো কোড ও ক্যাম্পেইন নোটিফিকেশন গ্রহণ করুন।",
    icon: Megaphone,
  },
  {
    key: "emailNotifications" as const,
    label: "ইমেইল বার্তা",
    description: "গুরুত্বপূর্ণ আপডেটসমূহ ইমেইলে পান।",
    icon: Mail,
  },
  {
    key: "smsNotifications" as const,
    label: "এসএমএস এলার্ট",
    description: "ডেলিভারির সর্বশেষ খবর এসএমএসে পান।",
    icon: MessageSquare,
  },
  {
    key: "pushNotifications" as const,
    label: "পুশ নোটিফিকেশন",
    description: "ব্রাউজার ও ডিভাইসে নোটিফিকেশন এলাউ করুন।",
    icon: Smartphone,
  },
];

export function NotificationsPageContent({ initialPrefs }: { initialPrefs: NotificationPrefs }) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "settings">("timeline");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await updateNotificationPreferencesAction(prefs);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl mx-auto pb-6">
      {/* Header Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 flex gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all touch-manipulation flex items-center justify-center gap-1.5 ${
            activeTab === "timeline"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Bell className="h-4 w-4" aria-hidden />
          <span>নোটিফিকেশন</span>
          {unreadCount > 0 && (
            <span className="h-5 px-1.5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-extrabold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all touch-manipulation flex items-center justify-center gap-1.5 ${
            activeTab === "settings"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Smartphone className="h-4 w-4" aria-hidden />
          <span>সেটিংস</span>
        </button>
      </div>

      {/* Tab 1: Activity Timeline */}
      {activeTab === "timeline" && (
        <div className="space-y-3">
          {unreadCount > 0 && (
            <div className="flex justify-end px-1">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 active:scale-95"
              >
                <CheckCheck className="h-4 w-4" aria-hidden />
                <span>সবগুলো পঠিত মার্ক করুন</span>
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 transition-colors ${
                  !item.read ? "bg-amber-50/50 dark:bg-amber-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.type === "order"
                          ? "bg-amber-500/10 text-amber-600"
                          : item.type === "promo"
                            ? "bg-pink-500/10 text-pink-600"
                            : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {item.type === "order" ? (
                        <Package className="h-4.5 w-4.5" />
                      ) : (
                        <Sparkles className="h-4.5 w-4.5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h3>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-1.5">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </span>
                    </div>
                  </div>

                  {item.link && (
                    <Link
                      href={item.link}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Notification Preferences Settings */}
      {activeTab === "settings" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">
              নোটিফিকেশন চ্যানেল নির্বাচন
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              আপনি কোন মাধ্যমে নোটিফিকেশন পেতে চান তা নির্বাচন করুন।
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {PREF_ITEMS.map((item) => {
              const Icon = item.icon;
              const value = prefs[item.key];
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3.5 px-1 rounded-xl"
                >
                  <div className="flex items-center gap-3 pr-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                        {item.label}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={value}
                    onClick={() => handleToggle(item.key)}
                    className={`relative h-6 w-11 rounded-full transition-colors shrink-0 touch-manipulation ${
                      value ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
                        value ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs touch-manipulation"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading ? "সংরক্ষণ হচ্ছে..." : "সেটিংস সেভ করুন"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                সেভ হয়েছে!
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default NotificationsPageContent;
