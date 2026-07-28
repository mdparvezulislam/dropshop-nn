import Link from "next/link";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `যোগাযোগ ও কাস্টমার সাপোর্ট - ${BRAND.publicName}`,
  description: `${BRAND.publicName} কাস্টমার কেয়ার, রিসেলার সাপোর্ট ও করপোরেট এড্রেস।`,
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> সাপোর্ট & ইনকোয়ারি
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            যোগাযোগ করুন
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            রিসেলার অনবোর্ডিং, পাইকারি রেট বা অর্ডার ট্র্যাকিং নিয়ে যেকোনো তথ্যের জন্য আমাদের টিম
            সবসময় প্রস্তুত।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-300 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase">কাস্টমার সাপোর্ট</h3>
                  <p className="text-sm font-black text-slate-900 mt-0.5">01410777606</p>
                  <p className="text-[11px] font-bold text-slate-600">
                    শনিবার - বৃহস্পতিবার: ৯:০০ AM - ৯:০০ PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase">ইমেইল</h3>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    support@dropshop.com.bd
                  </p>
                  <p className="text-[11px] font-bold text-slate-600">
                    ২ ঘন্টার মধ্যে দ্রুত রেসপন্স
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase">হেড অফিস</h3>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                    লেভেল ৮, ওয়েস্টিন টাওয়ার, গুলশান ২, ঢাকা ১২১২, বাংলাদেশ
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-black text-slate-900 mb-6">মেসেজ পাঠান</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    আপনার নাম
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার পুরো নাম"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01711..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">বিষয়</label>
                <select className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 cursor-pointer">
                  <option value="general">সাধারণ সাপোর্ট জিজ্ঞাসা</option>
                  <option value="reseller">রিসেলার অ্যাকাউন্ট অনবোর্ডিং</option>
                  <option value="wholesale">পাইকারি বাল্ক অর্ডার সম্পর্কিত</option>
                  <option value="supplier">সাপ্লায়ার রেজিস্ট্রেশন</option>
                  <option value="order">অর্ডার ট্র্যাকিং ও ডেলিভারি</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  আপনার মেসেজ
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="আমরা কিভাবে সাহায্য করতে পারি বিস্তারিত লিখুন..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98] inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> সাবমিট করুন
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
