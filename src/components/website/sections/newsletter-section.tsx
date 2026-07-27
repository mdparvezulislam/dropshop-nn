"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MessageSquare, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NewsletterSection(): React.ReactElement {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("নিউজলেটারে সাবস্ক্রিপশন সম্পন্ন হয়েছে!");
    setEmail("");
  };

  return (
    <section
      className="py-8 sm:py-12 lg:py-16 bg-white border-b border-slate-200"
      aria-label="Newsletter & Contact"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Box - Newsletter Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="p-6 sm:p-8 rounded-3xl bg-slate-100 border border-slate-300 flex flex-col justify-between space-y-6 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Mail className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-wider">নিউজলেটার</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                সর্বশেষ অফার & আপডেট পেতে নিউজলেটারে সাবস্ক্রাইব করুন
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                নতুন প্রোডাক্ট, বিশেষ অফার এবং ব্যবসায়িক টিপস পান
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল দিন..."
                className="flex-1 h-11 px-4 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500 transition-colors shadow-2xs"
              />
              <Button
                size="sm"
                type="submit"
                className="h-11 px-6 text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                সাবস্ক্রাইব করুন
              </Button>
            </form>
          </motion.div>

          {/* Right Box - Contact Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="p-6 sm:p-8 rounded-3xl bg-slate-100 border border-slate-300 flex flex-col justify-between space-y-6 shadow-xs"
          >
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                আমাদের সাথে যোগাযোগ করুন
              </h2>
              <p className="text-xs text-slate-600 font-bold">আমরা ২৪/৭ আপনার সেবায় নিয়োজিত</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Call Button */}
              <a
                href="tel:01410777606"
                className="flex items-center justify-center gap-2 h-12 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 hover:border-amber-500 hover:shadow-xs transition-all text-xs font-bold"
              >
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 leading-none">01410777606</p>
                  <p className="font-black text-slate-900 leading-snug">কল করুন</p>
                </div>
              </a>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/8801410777606"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 hover:bg-emerald-100 transition-all text-xs font-bold"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-emerald-700 leading-none">01410777606</p>
                  <p className="font-black text-emerald-950 leading-snug">হোয়াটসঅ্যাপ</p>
                </div>
              </a>

              {/* Messenger Button */}
              <a
                href="https://m.me/dropshopnn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 px-3 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 hover:bg-blue-100 transition-all text-xs font-bold"
              >
                <Send className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-blue-700 leading-none">m.me/dropshopnn</p>
                  <p className="font-black text-blue-950 leading-snug">মেসেঞ্জারে নক</p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
