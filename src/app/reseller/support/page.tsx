"use client";

import * as React from "react";
import { LifeBuoy, Phone, Mail, MessageSquare, Send, ChevronDown, HelpCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FAQS = [
  {
    q: "আমার রিসেলিং প্রফিট কীভাবে বিকাশ/ব্যাংকে উইথড্র করব?",
    a: "রিসেলার ওয়ালেট পেইজে প্রবেশ করে 'উইথড্র রিকুয়েস্ট' বাটনে ক্লিক করুন। আপনার বিকাশ নম্বর নির্বাচন করে ন্যূনতম ৫০০ টাকা ব্যালেন্স হলে উইথড্র রিকুয়েস্ট দিতে পারবেন। ১-২৪ ঘণ্টার মধ্যে প্রফিট ট্রান্সফার সম্পন্ন হবে।",
  },
  {
    q: "কাস্টমারের ডেলিভারি চার্জ কে দেবে?",
    a: "অর্ডার ক্রিয়েটের সময় ডেলিভারি চার্জ নির্ধারিত থাকে (যেমন ঢাকার ভেতরে ৮০ টাকা, ঢাকার বাইরে ১৫০ টাকা)। এই পরিমাণ কাস্টমারের মোট বিলের সাথে সংযুক্ত হয়।",
  },
  {
    q: "কাস্টমার রিটার্ন দিলে প্রফিট বা চার্জ হিসাব কীভাবে হবে?",
    a: "কাস্টমার পণ্য রিটার্ন দিলে অথবা ডেলিভারি ব্যর্থ হলে রিটার্ন চার্জ নীতি অনুযায়ী প্রসেসিং করা হবে। ড্যাশবোর্ডের প্রফিট রিপোর্ট সেকশনে সম্পূর্ণ ডেবিট ও ক্রেডিট বিবরণী রিয়েলটাইমে আপডেট দেখতে পাবেন।",
  },
  {
    q: "পণ্য বিক্রির জন্য ছবি ও কন্টেন্ট কোথায় পাব?",
    a: "মার্কেটিং কিট (Marketing Kit) মেনুতে সরাসরি প্রবেশ করে প্রতিটি পণ্যের হাই-কোয়ালিটি ব্যানার, প্রমোশনাল ভিডিও ও রিভিউ ছবি ডাউনলোড করতে পারবেন।",
  },
];

export default function ResellerSupportPage(): React.ReactElement {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("অনুগ্রহ করে বিষয় ও বার্তার বিস্তারিত লিখুন।");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubject("");
      setMessage("");
      toast.success("আপনার সাপোর্ট টিকেটটি সফলভাবে জমা নেওয়া হয়েছে। এডমিন টিম শীঘ্রই যোগাযোগ করবে।");
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
          Reseller Support &amp; Help Desk
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
          সাপোর্ট ও হেল্প সেন্টার
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
          অর্ডার, ওয়ালেট উইথড্রয়াল বা প্ল্যাটফর্ম ব্যবহারে কোনো সাহায্য প্রয়োজন হলে সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      {/* Support Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-5 text-center space-y-2">
            <Phone className="w-8 h-8 text-primary mx-auto" />
            <h3 className="text-sm font-black text-foreground">হেল্পলাইন কল কেন্দ্র</h3>
            <p className="text-xs font-bold text-primary">+880 9610-000000</p>
            <p className="text-[11px] text-muted-foreground">সকাল ১০টা - রাত ১০টা (প্রতিদিন)</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-5 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-black text-foreground">হোয়াটসঅ্যাপ সাপোর্ট</h3>
            <p className="text-xs font-bold text-emerald-600">+880 1700-000000</p>
            <p className="text-[11px] text-muted-foreground">ইনস্ট্যান্ট রিসেলার চ্যাট হেল্প</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-5 text-center space-y-2">
            <Mail className="w-8 h-8 text-blue-500 mx-auto" />
            <h3 className="text-sm font-black text-foreground">ইমেইল ডেস্ক</h3>
            <p className="text-xs font-bold text-blue-600">reseller@dropshop.com.bd</p>
            <p className="text-[11px] text-muted-foreground">অফিসিয়াল প্রশ্ন ও অভিযোগ</p>
          </CardContent>
        </Card>
      </div>

      {/* Form & FAQ Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Ticket Form */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-primary" /> সাপোর্ট টিকেট জমা দিন
            </h3>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  বিষয় / ক্যাটাগরি <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="যেমন: উইথড্রয়াল প্রসেসিং বা অর্ডার ট্র্যাকিং সমস্যা"
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-muted/40 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  বিস্তারিত বর্ণনা <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার সমস্যার বিবরণ ও অর্ডার নম্বর (প্রযোজ্য হলে) লিখুন..."
                  className="w-full p-3.5 rounded-xl border border-border bg-muted/40 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-black text-xs gap-2 shadow-md"
              >
                <Send className="w-4 h-4" />
                {loading ? "জমা দেওয়া হচ্ছে..." : "টিকেট সাবমিট করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reseller FAQ Accordion */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" /> সাধারণ জিজ্ঞাসাবলী (FAQ)
            </h3>
            <div className="space-y-2">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="border border-border/80 rounded-xl overflow-hidden bg-card"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left font-bold text-xs text-foreground flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-3.5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/20 font-semibold">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
