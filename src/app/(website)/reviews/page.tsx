import Link from "next/link";
import { Star, ShieldCheck, ThumbsUp, MessageSquare, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer Reviews & Ratings - DropshopNN Bangladesh",
  description:
    "Read real verified customer reviews and feedback for chargers, TWS earbuds, and tech accessories.",
};

const REVIEWS = [
  {
    id: "rev-1",
    author: "Mahmudul Hasan",
    location: "Dhaka",
    rating: 5,
    date: "2026-07-18",
    productName: "UGREEN Nexode 65W GaN Charger",
    content:
      "Original product! Delivered in 24 hours via Pathao. 65W fast charging works seamlessly with my MacBook Pro.",
    verified: true,
  },
  {
    id: "rev-2",
    author: "Sharmin Sultana",
    location: "Chattogram",
    rating: 5,
    date: "2026-07-15",
    productName: "Anker Soundcore Liberty 4 NC Earbuds",
    content:
      "Sound quality and ANC noise cancellation are top class. Official warranty card included inside packaging.",
    verified: true,
  },
  {
    id: "rev-3",
    author: "Tanvir Ahmed",
    location: "Sylhet",
    rating: 5,
    date: "2026-07-12",
    productName: "Logitech MX Master 3S Mouse",
    content:
      "Quiet click functionality is awesome for night productivity. Great reseller price margins too.",
    verified: true,
  },
  {
    id: "rev-4",
    author: "Rashedul Karim",
    location: "Rajshahi",
    rating: 5,
    date: "2026-07-10",
    productName: "Xiaomi Router AX3000T WiFi 6",
    content:
      "Full house coverage with 5GHz WiFi 6 speeds. Smooth experience ordering from DropshopNN.",
    verified: true,
  },
];

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Banner */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5" /> 100% Verified Buyer Ratings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-3">
            Customer Reviews & Feedback
          </h1>
          <p className="text-sm text-slate-400">
            Read real feedback from retail buyers, resellers, and wholesale traders across
            Bangladesh.
          </p>
        </div>

        {/* Rating Overview Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md mb-10 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="text-5xl font-extrabold text-white font-heading">4.9 / 5.0</div>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Based on 1,450+ verified customer purchases in BD
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-center">
              <span className="block text-lg text-emerald-400 font-bold">99.2%</span>
              <span className="text-slate-400 text-[10px] uppercase">Positive Rating</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-center">
              <span className="block text-lg text-amber-400 font-bold">24 Hours</span>
              <span className="text-slate-400 text-[10px] uppercase">Avg Delivery</span>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500">{rev.date}</span>
                </div>

                <h3 className="text-sm font-bold text-amber-300 mb-2">{rev.productName}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  &quot;{rev.content}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <strong className="text-white block">{rev.author}</strong>
                  <span className="text-[11px] text-slate-500">{rev.location}, Bangladesh</span>
                </div>
                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
