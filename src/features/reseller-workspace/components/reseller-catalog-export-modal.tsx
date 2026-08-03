"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Share2, Check, Copy, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CatalogExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResellerCatalogExportModal({ open, onOpenChange }: CatalogExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  if (!open) return null;

  const sampleSocialCopy = `🔥 ট্রেন্ডিং সেরা মানের স্মার্টওয়াচ ও গ্যাজেট কালেকশন! 🔥
  
✓ ১০০% অরিজিনাল অফিশিয়াল ওয়ারেন্টি 
✓ সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)
✓ ২-৩ দিনে দ্রুত হোম ডেলিভারি

অর্ডার করতে সরাসরি ইনবক্স করুন অথবা কল করুন: 01700000000`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(sampleSocialCopy);
    setCopied(true);
    toast.success("ফেসবুক পোস্ট টেক্সট কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: "pdf" | "excel") => {
    setExportingFormat(format);
    setTimeout(() => {
      setExportingFormat(null);
      toast.success(`${format.toUpperCase()} ফাইল এক্সপোর্ট সম্পন্ন হয়েছে!`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                ক্যাটালগ ও মার্কেটিং কন্টেন্ট এক্সপোর্ট
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ফেসবুক পেজ বা ওয়াটসঅ্যাপে শেয়ারের জন্য ফাইল ও পোস্ট টেক্সট নিন।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* PDF Export */}
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={exportingFormat === "pdf"}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-left space-y-2 transition-all active:scale-95 touch-manipulation"
          >
            <FileText className="h-7 w-7 text-red-500" />
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">
                PDF ক্যাটালগ শীট
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                ছবি, বিবরণ ও পাইকারি দামসহ প্রিন্টযোগ্য PDF ফাইল।
              </p>
            </div>
          </button>

          {/* Excel Export */}
          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={exportingFormat === "excel"}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left space-y-2 transition-all active:scale-95 touch-manipulation"
          >
            <FileSpreadsheet className="h-7 w-7 text-emerald-600" />
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">
                Excel (CSV) ডাটা শীট
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                ইনভেন্টরি স্টক, SKU ও পাইকারি প্রাইস লিস্ট Excel এ।
              </p>
            </div>
          </button>
        </div>

        {/* Facebook Social Post Copy Box */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              রেডিমেড ফেসবুক পোস্ট কন্টেন্ট
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyText}
              className="h-8 gap-1.5 text-xs font-black text-amber-600 border-amber-300 dark:border-amber-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "কপি হয়েছে!" : "কপি করুন"}</span>
            </Button>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto">
            {sampleSocialCopy}
          </div>
        </div>

        <div className="pt-2 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 text-xs font-black"
          >
            বন্ধ করুন
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResellerCatalogExportModal;
