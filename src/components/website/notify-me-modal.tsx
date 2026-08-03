"use client";

import { useState, type ReactElement } from "react";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export function NotifyMeModal({
  isOpen,
  onClose,
  productName,
}: NotifyMeModalProps): ReactElement | null {
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!contact.trim()) {
      toast.error("অনুগ্রহ করে আপনার ফোন নম্বর বা ইমেইল লিখুন");
      return;
    }
    setSubmitted(true);
    toast.success("ধন্যবাদ! প্রোডাক্টটি স্টকে আসলে আপনাকে অবহিত করা হবে।");
    setTimeout(() => {
      setSubmitted(false);
      setContact("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black">স্টক এলেই নোটিফিকেশন পান</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
              {productName}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              আপনার অনুরোধ সংরক্ষিত হয়েছে!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label htmlFor="notify-contact" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                আপনার ফোন নম্বর / ইমেইল ঠিকানা
              </label>
              <input
                id="notify-contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="017XXXXXXXX বা info@example.com"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus-visible:outline-2 focus-visible:outline-amber-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shadow-xs active:scale-95 touch-manipulation"
            >
              নোটিফিকেশন সাবমিট করুন
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default NotifyMeModal;
