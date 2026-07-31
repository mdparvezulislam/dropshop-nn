"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GiftVoucher } from "@/features/finance/domain/gift-voucher-entity";
import {
  listVouchersAction,
  createVoucherAction,
  deleteVoucherAction,
} from "@/features/finance/actions/voucher-actions";

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<GiftVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCreate, setOpenCreate] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    amountBDT: 500,
    singleUse: true,
    notes: "",
  });

  const loadVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listVouchersAction({ status: statusFilter, search });
      if (res.success && res.data) {
        setVouchers(res.data);
      }
    } catch {
      toast.error("গिफ्ट ভাউচার তালিকা লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    void loadVouchers();
  }, [loadVouchers]);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("ভাউচার কোড লিখুন।");
      return;
    }

    try {
      const res = await createVoucherAction({
        code: formData.code.trim().toUpperCase(),
        amountCents: formData.amountBDT * 100,
        singleUse: formData.singleUse,
        notes: formData.notes,
        status: "active",
      });

      if (res.success) {
        toast.success("গिफ्ट ভাউচার সফলভাবে তৈরি হয়েছে!");
        setOpenCreate(false);
        setFormData({ code: "", amountBDT: 500, singleUse: true, notes: "" });
        void loadVouchers();
      } else {
        toast.error(res.error || "ভাউচার তৈরি ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("সিস্টেম ত্রুটি। আবার চেষ্টা করুন।");
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ভাউচারটি ডিলিট করতে চান?")) return;
    try {
      const res = await deleteVoucherAction(id);
      if (res.success) {
        toast.success("ভাউচারটি মোছা হয়েছে।");
        void loadVouchers();
      } else {
        toast.error("ভাউচার ডিলিট করা যায়নি।");
      }
    } catch {
      toast.error("ডিলিট ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-8 p-3 sm:p-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black flex items-center gap-2">
              গिफ्ट ভাউচার ও স্টোর ক্রেডিট
              <Sparkles className="h-4 w-4 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              প্লাটফর্মের ডিজিটাল ভাউচার ও গিফট কার্ড ব্যালেন্স নিয়ন্ত্রণ করুন
            </p>
          </div>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-1.5 shadow-md touch-manipulation">
              <Plus className="h-4 w-4" />
              <span>নতুন ভাউচার</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-amber-500" />
                নতুন গিফট ভাউচার তৈরি করুন
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateVoucher} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  ভাউচার কোড <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="যেমন: GIFT500"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="uppercase h-11 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  ভাউচার ব্যালেন্স (৳) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="500"
                  value={formData.amountBDT}
                  onChange={(e) => setFormData({ ...formData, amountBDT: Number(e.target.value) })}
                  className="h-11 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  নোট / বিবরণ (ঐচ্ছিক)
                </label>
                <Input
                  placeholder="যেমন: রেফারেল কাস্টমার বোনাস ভাউচার"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md mt-2"
              >
                ভাউচার তৈরি করুন
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ভাউচার কোড সার্চ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>

        <Button
          onClick={() => void loadVouchers()}
          variant="outline"
          size="sm"
          className="h-10 px-3 rounded-xl gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs font-bold text-slate-400">
            ভাউচার লোড হচ্ছে...
          </div>
        ) : vouchers.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-2">
            <Ticket className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-500">কোনো ভাউচার পাওয়া যায়নি</p>
          </div>
        ) : (
          vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {voucher.code}
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {voucher.status.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {voucher.notes || "ডিজিটাল গিফট ভাউচার"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteVoucher(voucher.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="ডিলিট"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                <div>
                  <span className="text-[10px] text-slate-400 block">মূল্যমান (BDT)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black text-sm">
                    ৳{Math.round(voucher.amountCents / 100)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">অবশিষ্ট ব্যালেন্স</span>
                  <span className="text-slate-900 dark:text-slate-100 font-black text-sm">
                    ৳{Math.round(voucher.remainingCents / 100)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
