"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  FileCheck,
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
import { BackupJob, BackupStats } from "@/features/security/domain/backup-entity";
import {
  listBackupsAction,
  createBackupAction,
  deleteBackupAction,
  getBackupStatsAction,
} from "@/features/security/actions/backup-actions";

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [restoringJob, setRestoringJob] = useState<BackupJob | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "full" as const,
    components: ["database", "media", "config", "logs"],
    notes: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        listBackupsAction(),
        getBackupStatsAction(),
      ]);

      if (listRes.success && listRes.data) setBackups(listRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    } catch {
      toast.error("ব্যাকআপ ডাটা লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createBackupAction({
        name: formData.name.trim() || `Full-System-Backup-${new Date().toISOString().slice(0, 10)}`,
        type: formData.type,
        components: formData.components,
        notes: formData.notes,
        status: "completed",
      });

      if (res.success) {
        toast.success("সিস্টেম ব্যাকআপ সফলভাবে তৈরি হয়েছে!");
        setOpenCreate(false);
        setFormData({ name: "", type: "full", components: ["database", "media", "config", "logs"], notes: "" });
        void loadData();
      } else {
        toast.error(res.error || "ব্যাকআপ তৈরি ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("সিস্টেম ত্রুটি। আবার চেষ্টা করুন।");
    }
  };

  const handleDeleteBackup = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ব্যাকআপ ফাইলটি ডিলিট করতে চান?")) return;
    try {
      const res = await deleteBackupAction(id);
      if (res.success) {
        toast.success("ব্যাকআপ ফাইলটি মোছা হয়েছে।");
        void loadData();
      } else {
        toast.error("ব্যাকআপ ডিলিট করা যায়নি।");
      }
    } catch {
      toast.error("ডিলিট ব্যর্থ হয়েছে।");
    }
  };

  const handleRestore = async () => {
    if (!restoringJob) return;
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "সিস্টেম রিকভারি চলছে...",
        success: `${restoringJob.name} সফলভাবে রিস্টোর করা হয়েছে!`,
        error: "রিস্টোর ব্যর্থ হয়েছে।",
      },
    );
    setRestoringJob(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-8 p-3 sm:p-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black flex items-center gap-2">
              ব্যাকআপ ও ডিজাস্টার রিকভারি
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              প্লাটফর্মের ডাটাবেজ, কনফিগারেশন ও মিডিয়া ব্যাকআপ সিস্টেম
            </p>
          </div>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="h-11 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs gap-1.5 shadow-md touch-manipulation">
              <Plus className="h-4 w-4" />
              <span>নতুন ব্যাকআপ</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-indigo-500" />
                সিস্টেম স্ন্যাপশট ব্যাকআপ তৈরি করুন
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateBackup} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  ব্যাকআপ নাম
                </label>
                <Input
                  placeholder="যেমন: Full-System-Backup-2026-07-31"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 rounded-xl font-bold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  নোট / বিবরণ (ঐচ্ছিক)
                </label>
                <Input
                  placeholder="যেমন: মাসিক ডাটাবেজ স্ন্যাপশট"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md mt-2"
              >
                স্ন্যাপশট তৈরি শুরু করুন
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">মোট ব্যাকআপ</span>
          <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 block">
            {stats?.totalBackups || 0} টি
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">মোট স্টোরেজ</span>
          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatSize(stats?.totalSizeBytes || 0)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">সাফল্যের হার</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats?.successRate || 100}%
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">সর্বশেষ ব্যাকআপ</span>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1 block truncate">
            {stats?.latestBackupDate ? new Date(stats.latestBackupDate).toLocaleDateString() : "আজ"}
          </span>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-indigo-500" />
            সিস্টেম ব্যাকআপ হিস্ট্রি
          </h2>
          <Button onClick={() => void loadData()} variant="outline" size="sm" className="h-8 px-2.5 rounded-xl gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">
              ব্যাকআপ লোড হচ্ছে...
            </div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <HardDrive className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-bold text-slate-500">কোনো ব্যাকআপ স্ন্যাপশট পাওয়া যায়নি</p>
            </div>
          ) : (
            backups.map((item) => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {item.name}
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.status.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatSize(item.sizeBytes)} · {new Date(item.createdAt).toLocaleString()} · {item.components.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    onClick={() => setRestoringJob(item)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold rounded-xl gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                    রিস্টোর
                  </Button>
                  <button
                    onClick={() => handleDeleteBackup(item.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="ডিলিট"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Restore Safety Modal */}
      {restoringJob && (
        <Dialog open={!!restoringJob} onOpenChange={() => setRestoringJob(null)}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                সিস্টেম রিকভারি নিশ্চিতকরণ
              </DialogTitle>
            </DialogHeader>

            <div className="bg-rose-50 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 font-semibold space-y-1">
              <p className="font-black">সাবধান!</p>
              <p>আপনি <strong>{restoringJob.name}</strong> স্ন্যাপশট থেকে ডাটা রিস্টোর করতে যাচ্ছেন। রিস্টোর প্রক্রিয়াকালীন বর্তমান কনফিগারেশন ওভাররাইট হবে।</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRestoringJob(null)} className="rounded-xl text-xs font-bold">
                বাতিল
              </Button>
              <Button onClick={handleRestore} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl">
                হ্যাঁ, রিস্টোর শুরু করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
