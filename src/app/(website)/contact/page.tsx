import Link from "next/link";
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Us & Customer Support - DropshopNN Bangladesh",
  description: "Get in touch with DropshopNN customer support, corporate headquarters, or reseller support.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <MessageSquare className="w-3.5 h-3.5" /> Support & Inquiries
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-2">
            Contact DropshopNN
          </h1>
          <p className="text-xs text-slate-400">
            Have questions about reseller onboarding, wholesale MOQ rates, or order tracking? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase">Customer Support</h3>
                  <p className="text-sm font-extrabold text-white mt-0.5">+880 9612-000111</p>
                  <p className="text-[11px] text-slate-500">Sat - Thu: 9:00 AM - 9:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase">Email Inquiries</h3>
                  <p className="text-sm font-extrabold text-white mt-0.5">support@dropshop.com.bd</p>
                  <p className="text-[11px] text-slate-500">Fast response within 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase">Corporate Headquarters</h3>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">
                    Level 8, Westin Tower, Gulshan 2, Dhaka 1212, Bangladesh
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-6 font-heading">Send Us a Message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="01711..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Subject / Category</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-amber-500">
                  <option value="general">General Support Inquiry</option>
                  <option value="reseller">Reseller Account Onboarding</option>
                  <option value="wholesale">B2B Wholesale Bulk Pricing</option>
                  <option value="supplier">Supplier Registration</option>
                  <option value="order">Order Tracking & Delivery</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/10 inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
