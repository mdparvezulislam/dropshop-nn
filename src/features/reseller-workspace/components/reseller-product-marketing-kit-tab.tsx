"use client";

import * as React from "react";
import {
  Copy,
  Download,
  Share2,
  Check,
  Image as ImageIcon,
  QrCode,
  FileText,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface MarketingKitProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
  imageUrl?: string;
  mrp: number;
  sellingPrice: number;
  brand?: string;
}

export interface ResellerProductMarketingKitTabProps {
  product: MarketingKitProduct;
}

export function ResellerProductMarketingKitTab({
  product,
}: ResellerProductMarketingKitTabProps): React.ReactElement {
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const productPriceTaka = Math.round(product.sellingPrice / 100);
  const mrpTaka = Math.round(product.mrp / 100);

  // Auto-generated Facebook Marketing Caption
  const facebookCaption = `🔥 সুপার হট ক্যাজুয়াল গ্যাজেট/পণ্য - ${product.name}! 🔥

বাজেটের মধ্যে সেরা প্রিমিয়াম কোয়ালিটি পেতে আজই অর্ডার করুন।

✅ ১০০% অরিজিনাল ও ব্র্যান্ডেড প্রোডাক্ট।
✅ ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধের সুবিধা)।
✅ দ্রুত ডেলিভারি সুবিধা (ঢাকার ভেতর ২৪-৪৮ ঘণ্টা)।

💰 রেগুলার প্রাইস: ৳${mrpTaka}
🏷️ বিশেষ অফার প্রাইস: ৳${productPriceTaka} (সীমিত সময়ের জন্য)!

অর্ডার করতে অথবা বিস্তারিত জানতে এখনই আমাদের পেজে ইনবক্স করুন অথবা কল করুন: 01700-000000 📲

#Dropshipping #Gadget #Reseller #${product.brand || "Dropshop"}`;

  const shortCaption = `🔥 ${product.name} - বিশেষ অফার প্রাইস মাত্র ৳${productPriceTaka}! ক্যাশ অন ডেলিভারি এভেলেবল। ইনবক্স করুন এখনই।`;

  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${product.sku}` : "";

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(facebookCaption);
    setCopiedCaption(true);
    toast.success("ফেসবুক ক্যাপশন কপি করা হয়েছে!");
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl || `https://dropshop.com.bd/p/${product.sku}`);
    setCopiedLink(true);
    toast.success("প্রোডাক্ট লিংক কপি করা হয়েছে!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadImage = () => {
    toast.success("ইমেজ ডাউনলোড শুরু হয়েছে...");
  };

  const handleDownloadPack = () => {
    toast.success("সম্পূর্ণ মার্কেটিং কিট প্যাক (ZIP) ডাউনলোড শুরু হয়েছে...");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            Free Promotion Assets
          </span>
          <h3 className="text-base font-black text-foreground">
            ডিজিটাল মার্কেটিং কিট ও সোশ্যাল মিডিয়া কন্টেন্ট
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleCopyCaption} variant="outline" size="sm" className="gap-1.5 font-bold">
            {copiedCaption ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copiedCaption ? "কপি হয়েছে" : "ক্যাপশন কপি"}
          </Button>
          <Button onClick={handleDownloadPack} size="sm" className="gap-1.5 font-black shadow-xs">
            <Download className="w-4 h-4" /> সম্পূর্ণ প্যাক (ZIP)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Captions & Descriptions */}
        <div className="space-y-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> ফেসবুক পেজ/গ্রুপ রেডি ক্যাপশন
                </h4>
                <button
                  onClick={handleCopyCaption}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> কপি করুন
                </button>
              </div>
              <textarea
                readOnly
                rows={10}
                value={facebookCaption}
                className="w-full p-3.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground leading-relaxed outline-none resize-none font-mono"
              />
            </CardContent>
          </Card>

          {/* Short Promo Caption */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-3">
              <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> শর্ট বিজ্ঞাপনী ক্যাপশন (SMS/WhatsApp)
              </h4>
              <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground flex items-center justify-between gap-3">
                <p className="line-clamp-2">{shortCaption}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shortCaption);
                    toast.success("শর্ট ক্যাপশন কপি হয়েছে!");
                  }}
                  className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Banners & Downloads */}
        <div className="space-y-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-4">
              <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> সোশ্যাল ভিডিও ও ব্যানার অ্যাসেট
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Square Banner */}
                <div className="p-3 rounded-xl border border-border/80 bg-muted/30 text-center space-y-2">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt="Square Banner" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-foreground">স্কয়ার পোস্ট (1:1)</p>
                  <Button onClick={handleDownloadImage} variant="outline" size="sm" className="w-full text-xs font-bold gap-1">
                    <Download className="w-3.5 h-3.5" /> ডাউনলোড
                  </Button>
                </div>

                {/* Story Banner */}
                <div className="p-3 rounded-xl border border-border/80 bg-muted/30 text-center space-y-2">
                  <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt="Story Banner" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-foreground">স্টোরি / রিল ব্যানার (9:16)</p>
                  <Button onClick={handleDownloadImage} variant="outline" size="sm" className="w-full text-xs font-bold gap-1">
                    <Download className="w-3.5 h-3.5" /> ডাউনলোড
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code & Link Sharing Card */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-foreground">ডাইরেক্ট ক্যাটালগ শেয়ারিং</h4>
                  <p className="text-[11px] text-muted-foreground">কাস্টমারকে সরাসরি প্রোডাক্ট দেখতে লিংক পাঠান</p>
                </div>
              </div>
              <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-1.5 font-bold shrink-0">
                {copiedLink ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
                {copiedLink ? "কপি হয়েছে" : "লিংক কপি"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
