"use client";

import * as React from "react";
import { X, MessageSquare, Save, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OrderNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    orderNumber?: string;
    notes?: string;
    shipping?: { deliveryNote?: string };
  } | null;
  onSuccess?: () => void;
}

const PRESET_NOTES = [
  "ডেলিভারির আগে কাস্টমারকে কল দিয়ে নিশ্চিত করুন",
  "ডোরস্টেপ ডেলিভারি নিশ্চিত করতে হবে",
  "প্যাকেট খুলে চেক করার অনুমতি দেওয়া হলো",
  "অফিস টাইমে (সকাল ১০টা - ৫টা) ডেলিভারি করবেন",
  "সন্ধ্যা ৬টার পর ডেলিভারি করুন",
];

export function OrderNoteModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: OrderNoteModalProps): React.ReactElement | null {
  const [noteText, setNoteText] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (order && open) {
      const raw = order.notes || order.shipping?.deliveryNote || "";
      const match = raw.match(/userNote:(.*)$/i);
      const clean = match ? match[1].trim() : (raw.includes("payment:") ? "" : raw.trim());
      setNoteText(clean);
    }
  }, [order, open]);

  if (!open || !order) return null;

  const handlePresetClick = (preset: string) => {
    if (!noteText.trim()) {
      setNoteText(preset);
    } else if (!noteText.includes(preset)) {
      setNoteText((prev) => `${prev.trim()} (${preset})`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { addOrderNoteAction } = await import("@/features/order/actions/order-actions");
      const res = await addOrderNoteAction({
        orderId: order.id,
        note: noteText.trim(),
        internal: false,
      });

      if (res.success) {
        toast.success("অর্ডার নোট সফলভাবে সংরক্ষণ করা হয়েছে!");
        if (onSuccess) onSuccess();
        onOpenChange(false);
      } else {
        // Fallback to updateResellerOrderAction if addOrderNoteAction permission checks fail
        const { updateResellerOrderAction } = await import("@/features/reseller/actions/reseller-order-actions");
        const rRes = await updateResellerOrderAction({
          orderId: order.id,
          customerName: (order as any).customerName || (order as any).shipping?.receiverName || "Customer",
          customerPhone: (order as any).customerPhone || (order as any).shipping?.phone || "01700000000",
          district: (order as any).district || (order as any).shipping?.district || "Dhaka",
          fullAddress: (order as any).fullAddress || (order as any).shipping?.address || "Address",
          notes: noteText.trim(),
          deliveryChargeCents: (order as any).deliveryChargeCents || 6000,
          items: (order as any).items || [],
        });

        if (rRes.success) {
          toast.success("অর্ডার নোট সফলভাবে আপডেট করা হয়েছে!");
          if (onSuccess) onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error || rRes.error || "নোট সংরক্ষণ করতে সমস্যা হয়েছে");
        }
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে, পুনরায় চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                বিশেষ নোট / কুরিয়ার নির্দেশিকা
              </h3>
              <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                অর্ডার নম্বর: #{order.orderNumber || order.id.slice(-6)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>কুরিয়ার ও ডেলিভারি নির্দেশিকা নোট:</span>
            </label>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="যেমন: কুরিয়ারে ডোরস্টেপ ডেলিভারি দিতে বলুন, কাস্টমার বিকাল ৪টার পর ফ্রি থাকবেন..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs font-semibold outline-none focus:border-amber-500 transition-all resize-none shadow-2xs"
            />
          </div>

          {/* Preset Quick Chips */}
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> দ্রুত নোট সিলেক্ট করুন (Quick Presets):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_NOTES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/80 dark:border-slate-700 transition-colors text-left"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs font-bold"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "সংরক্ষণ হচ্ছে..." : "নোট সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
