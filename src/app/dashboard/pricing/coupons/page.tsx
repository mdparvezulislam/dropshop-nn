"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Percent,
  CircleDollarSign,
  Sparkles,
  RefreshCw,
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
import { Coupon } from "@/features/pricing/domain/coupon-entity";
import {
  listCouponsAction,
  createCouponAction,
  deleteCouponAction,
} from "@/features/pricing/actions/coupon-actions";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCreate, setOpenCreate] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "fixed" as "fixed" | "percentage",
    value: 100, // BDT or %
    maxDiscountBDT: 0,
    minOrderBDT: 500,
    usageLimit: 100,
    status: "active" as Coupon["status"],
  });

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCouponsAction({ status: statusFilter, search });
      if (res.success && res.data) {
        setCoupons(res.data);
      }
    } catch {
      toast.error("কুপন তালিকা লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("কুপন কোড লিখুন।");
      return;
    }

    try {
      const res = await createCouponAction({
        code: formData.code.trim().toUpperCase(),
        description: formData.description,
        type: formData.type,
        value: formData.type === "fixed" ? formData.value * 100 : formData.value,
        maxDiscountCents: formData.maxDiscountBDT > 0 ? formData.maxDiscountBDT * 100 : undefined,
        minOrderCents: formData.minOrderBDT * 100,
        usageLimit: formData.usageLimit,
        status: formData.status,
      });

      if (res.success) {
        toast.success("কুপন সফলভাবে তৈরি হয়েছে!");
        setOpenCreate(false);
        setFormData({
          code: "",
          description: "",
          type: "fixed",
          value: 100,
          maxDiscountBDT: 0,
          minOrderBDT: 500,
          usageLimit: 100,
          status: "active",
        });
        void loadCoupons();
      } else {
        toast.error(res.error || "কুপন তৈরি ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("সিস্টেম ত্রুটি। আবার চেষ্টা করুন।");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই কুপনটি ডিলিট করতে চান?")) return;
    try {
      const res = await deleteCouponAction(id);
      if (res.success) {
        toast.success("কুপনটি সফলভাবে মোছা হয়েছে।");
        void loadCoupons();
      } else {
        toast.error("কুপন ডিলিট করা যায়নি।");
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
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black flex items-center gap-2">
              কুপন ও ডিসকাউন্ট ম্যানেজমেন্ট
              <Sparkles className="h-4 w-4 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              পাবলিক চেকআউটের জন্য প্রোমো কুপন তৈরি ও নিয়ন্ত্রণ করুন
            </p>
          </div>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-1.5 shadow-md touch-manipulation">
              <Plus className="h-4 w-4" />
              <span>নতুন কুপন</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-500" />
                নতুন প্রোমো কুপন তৈরি করুন
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  কুপন কোড <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="যেমন: WELCOME100"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="uppercase h-11 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  বিবরণ
                </label>
                <Input
                  placeholder="যেমন: নতুন কাস্টমারদের জন্য ৳১০০ বিশেষ ছাড়"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    ছাড়ের ধরন
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold px-3 text-slate-900 dark:text-slate-100"
                  >
                    <option value="fixed">Fixed (৳ নির্দিষ্ট টাকা)</option>
                    <option value="percentage">Percentage (% শতাংশ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    ছাড়ের পরিমাণ {formData.type === "fixed" ? "(৳)" : "(%)"}
                  </label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="h-11 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    সর্বনিম্ন অর্ডার (৳)
                  </label>
                  <Input
                    type="number"
                    value={formData.minOrderBDT}
                    onChange={(e) => setFormData({ ...formData, minOrderBDT: Number(e.target.value) })}
                    className="h-11 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    ব্যবহারের সর্বোচ্চ সীমা
                  </label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="h-11 rounded-xl font-bold"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md mt-2"
              >
                কুপন যুক্ত করুন
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="কুপন কোড খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold px-3 text-slate-900 dark:text-slate-100"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="active">Active (সক্রিয়)</option>
            <option value="paused">Paused (সাময়িক বন্ধ)</option>
            <option value="expired">Expired (মেয়াদউত্তীর্ণ)</option>
          </select>

          <Button
            onClick={() => void loadCoupons()}
            variant="outline"
            size="sm"
            className="h-10 px-3 rounded-xl gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Coupon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs font-bold text-slate-400">
            কুপন তথ্য লোড হচ্ছে...
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-2">
            <Tag className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-500">কোনো কুপন কোড পাওয়া যায়নি</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                    {coupon.type === "fixed" ? <CircleDollarSign className="h-5 w-5" /> : <Percent className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {coupon.code}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          coupon.status === "active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {coupon.status.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {coupon.description || "প্রোমোশনাল কুপন"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="ডিলিট করুন"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-bold">
                <div>
                  <span className="text-[10px] text-slate-400 block">ছাড়ের পরিমাণ</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">
                    {coupon.type === "fixed" ? `৳${Math.round(coupon.value / 100)} Off` : `${coupon.value}% Off`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ব্যবহার করা হয়েছে</span>
                  <span>{coupon.usageCount} / {coupon.usageLimit || "অসীম"} বার</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
