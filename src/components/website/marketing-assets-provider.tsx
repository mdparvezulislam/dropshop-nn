"use client";

import * as React from "react";
import { Download, Copy, Check, Share2, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MarketingAssetsProviderProps {
  productName: string;
  shortDescription?: string;
  resellerPrice: number;
  suggestedRetailPrice: number;
  images: Array<{ url: string; alt?: string }>;
}

export function MarketingAssetsProvider({
  productName,
  shortDescription,
  resellerPrice,
  suggestedRetailPrice,
  images,
}: MarketingAssetsProviderProps) {
  const [copied, setCopied] = React.useState(false);

  const generateFacebookCaption = () => {
    return `🔥 ${productName} 🔥
  
  ${shortDescription || "প্রিমিয়াম কোয়ালিটি এবং আধুনিক ডিজাইনের সাথে সেরা দামে!"}
  
  💰 স্পেশাল ক্যাশ অন ডেলিভারি মূল্য: ৳${suggestedRetailPrice || Math.round(resellerPrice * 1.3)}
  🚚 সারা বাংলাদেশে হোম ডেলিভারি সুব্যবস্থা!
  
  অর্ডার করতে এখনই ইনবক্স করুন অথবা কল করুন: 01XXXXXXXXX`;
  };

  const handleCopyCaption = () => {
    const caption = generateFacebookCaption();
    navigator.clipboard.writeText(caption);
    setCopied(true);
    toast.success("Facebook Caption copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadImages = () => {
    if (images.length === 0) return;
    images.forEach((img, idx) => {
      const a = document.createElement("a");
      a.href = img.url;
      a.download = `${productName.toLowerCase().replace(/\s+/g, "-")}-image-${idx + 1}.jpg`;
      a.target = "_blank";
      a.click();
    });
    toast.success(`Started download for ${images.length} HD images!`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-xl space-y-4 my-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
              <span>Reseller Marketing Kit (মার্কেটিং টুলস)</span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase">
                HD Assets
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Download banners and copy ready-to-post Facebook captions</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={handleCopyCaption}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-red-600/20"
        >
          {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
          <span>{copied ? "Copied!" : "Copy Facebook Caption (ক্যাপশন কপি)"}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadImages}
          className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800 font-bold text-xs py-2.5 rounded-xl"
        >
          <Download className="w-4 h-4 mr-1.5 text-red-400" />
          <span>Download {images.length} HD Banners (ছবি ডাউনলোড)</span>
        </Button>
      </div>

      {/* Preview Box */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">
        {generateFacebookCaption()}
      </div>
    </div>
  );
}
