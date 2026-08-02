"use client";

import * as React from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Check,
  Ban,
  Loader2,
  ArrowUpRight,
  Filter,
  Building2,
  Phone,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  listAdminWithdrawalsAction,
  processAdminWithdrawalAction,
} from "@/features/finance/actions/finance-actions";
import { cn } from "@/lib/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface PayoutRequestItem {
  id: string;
  resellerName: string;
  resellerPhone: string;
  amountTaka: number;
  method: string;
  accountNumber: string;
  status: string;
  requestedAt: string;
  comment?: string;
  transactionId?: string;
}

export default function AdminPayoutsPage(): React.ReactElement {
  const [loading, setLoading] = React.useState(true);
  const [mutatingId, setMutatingId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [items, setItems] = React.useState<PayoutRequestItem[]>([]);
  const [counts, setCounts] = React.useState({ all: 0, pending: 0, completed: 0, rejected: 0 });

  // Modal states for action inputs
  const [selectedRequest, setSelectedRequest] = React.useState<PayoutRequestItem | null>(null);
  const [actionType, setActionType] = React.useState<"completed" | "rejected" | null>(null);
  const [transactionIdInput, setTransactionIdInput] = React.useState("");
  const [rejectionReasonInput, setRejectionReasonInput] = React.useState("");

  const fetchPayouts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminWithdrawalsAction(statusFilter);
      if (res.success && res.data) {
        setItems(res.data.items);
        setCounts(res.data.counts);
      } else {
        toast.error(res.error || "উইথড্রয়াল রিকোয়েস্ট লোড করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleOpenProcessModal = (req: PayoutRequestItem, type: "completed" | "rejected") => {
    setSelectedRequest(req);
    setActionType(type);
    setTransactionIdInput("");
    setRejectionReasonInput("");
  };

  const handleConfirmProcess = async () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "rejected" && !rejectionReasonInput.trim()) {
      toast.error("অনুগ্রহ করে বাতিলের সঠিক কারণ উল্লেখ করুন।");
      return;
    }

    setMutatingId(selectedRequest.id);
    try {
      const res = await processAdminWithdrawalAction({
        withdrawalId: selectedRequest.id,
        status: actionType,
        transactionId: transactionIdInput.trim() || undefined,
        rejectionReason: rejectionReasonInput.trim() || undefined,
      });

      if (res.success) {
        toast.success(
          actionType === "completed"
            ? "পে-আউট পেমেন্ট সফলভাবে সম্পন্ন করা হয়েছে!"
            : "উইথড্রয়াল রিকোয়েস্ট বাতিল করে টাকা ব্যালেন্সে ফেরত দেওয়া হয়েছে।",
        );
        setSelectedRequest(null);
        setActionType(null);
        fetchPayouts();
      } else {
        toast.error(res.error || "প্রসেস করতে ব্যর্থ হয়েছে");
      }
    } catch {
      toast.error("সার্ভার সমস্যা হয়েছে");
    } finally {
      setMutatingId(null);
    }
  };

  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.resellerName.toLowerCase().includes(q) ||
        item.resellerPhone.includes(q) ||
        item.accountNumber.includes(q) ||
        item.method.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-foreground flex items-center gap-2.5">
            <Wallet className="h-7 w-7 text-amber-500" />
            রিসেলার পে-আউট ও উইথড্রয়াল ম্যানেজমেন্ট
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            রিসেলারদের টাকা উত্তোলনের আবেদন পর্যালোচনা, ম্যানুয়াল পেমেন্ট কনফার্মেশন ও ব্যালেন্স ট্র্যাকিং।
          </p>
        </div>

        <Button
          onClick={fetchPayouts}
          variant="outline"
          disabled={loading}
          className="h-10 text-xs font-bold gap-1.5 rounded-xl self-start sm:self-auto"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          রিফ্রেশ
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-3xl border-border bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">
              পেন্ডিং উইথড্রয়াল
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-foreground mt-2">
            {counts.pending} টি
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">এডমিন অনুমোদনের অপেক্ষায়</p>
        </Card>

        <Card className="rounded-3xl border-border bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
              পরিশোধিত পে-আউট
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-foreground mt-2">
            {counts.completed} টি
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">পেমেন্ট সম্পন্ন ও পেইড</p>
        </Card>

        <Card className="rounded-3xl border-border bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-rose-600 dark:text-rose-400">
              বাতিলকৃত রিকোয়েস্ট
            </span>
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-foreground mt-2">
            {counts.rejected} টি
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">ব্যালেন্সে টাকা ফেরত দেওয়া হয়েছে</p>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="rounded-3xl border-border bg-card">
        <CardHeader className="p-5 border-b border-border/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Status Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: `সব রিকোয়েস্ট (${counts.all})` },
              { id: "pending", label: `পেন্ডিং (${counts.pending})` },
              { id: "completed", label: `পেইড (${counts.completed})` },
              { id: "rejected", label: `বাতিল (${counts.rejected})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer",
                  statusFilter === tab.id
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="রিসেলার নাম, ফোন বা নম্বর দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-border bg-background"
            />
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
              <p className="text-xs font-bold text-muted-foreground">উইথড্রয়াল ডেটা লোড হচ্ছে...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-xs font-bold text-muted-foreground">
              কোনো উইথড্রয়াল আবেদন পাওয়া যায়নি।
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredItems.map((item) => {
                const st = item.status.toLowerCase();
                const isPending = st === "pending";
                const isCompleted = ["completed", "paid", "approved"].includes(st);
                const isRejected = st === "rejected";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-muted/20 hover:bg-muted/30 p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-foreground truncate">
                          {item.resellerName}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          ({item.resellerPhone})
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5",
                            isPending && "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300",
                            isCompleted && "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300",
                            isRejected && "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300",
                          )}
                        >
                          {isPending && "পেন্ডিং (প্রসেসিং)"}
                          {isCompleted && "পেইড (অনুমোদিত)"}
                          {isRejected && "বাতিল (ফেরত)"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground flex-wrap pt-1">
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          মেথড: <span className="text-amber-600 dark:text-amber-400">{item.method}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono font-bold text-foreground">
                          নম্বর: {item.accountNumber}
                        </span>
                        <span>•</span>
                        <span>{item.requestedAt ? new Date(item.requestedAt).toLocaleString("bn-BD") : "আজ"}</span>
                      </div>

                      {item.comment && (
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-0.5">
                          মন্তব্য: {item.comment}
                        </p>
                      )}
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ৳ {item.amountTaka.toLocaleString("bn-BD")}
                      </p>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={mutatingId === item.id}
                            onClick={() => handleOpenProcessModal(item, "completed")}
                            className="h-8 px-3 text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 gap-1 rounded-xl shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" /> পেমেন্ট কনফার্ম
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={mutatingId === item.id}
                            onClick={() => handleOpenProcessModal(item, "rejected")}
                            className="h-8 px-3 text-xs font-bold border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                          >
                            <Ban className="h-3.5 w-3.5 mr-1" /> বাতিল
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation & Processing Modal */}
      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setActionType(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              {actionType === "completed" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" /> পে-আউট পেমেন্ট কনফার্ম করুন
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-rose-500" /> উইথড্রয়াল রিকোয়েস্ট বাতিল করুন
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedRequest?.resellerName} এর ৳{selectedRequest?.amountTaka} উত্তোলনের আবেদন (
              {selectedRequest?.method} - {selectedRequest?.accountNumber})।
            </DialogDescription>
          </DialogHeader>

          {actionType === "completed" ? (
            <div className="space-y-3 py-2">
              <label className="text-xs font-bold text-foreground block">
                ট্রানজেকশন আইডি / পেমেন্ট রেফারেন্স (ঐচ্ছিক):
              </label>
              <Input
                type="text"
                placeholder="যেমন: DFN2MBC84U বা BKASH-998822"
                value={transactionIdInput}
                onChange={(e) => setTransactionIdInput(e.target.value)}
                className="h-10 text-xs font-mono rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                ম্যানুয়ালি টাকা পাঠানোর পর ট্রানজেকশন আইডি প্রদান করুন। এটি রিসেলারের হিস্ট্রিতে পেইড হিসেবে প্রদর্শিত হবে।
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <label className="text-xs font-bold text-foreground block">
                বাতিল করার কারণ <span className="text-rose-500">*</span>:
              </label>
              <Input
                type="text"
                required
                placeholder="যেমন: ভুল অ্যাকাউন্ট নম্বর প্রদান করা হয়েছে"
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                বাতিল করা হলে ৳{selectedRequest?.amountTaka} টাকা আবার স্বয়ংক্রিয়ভাবে রিসেলারের অ্যাকাউন্টে ফেরত যাবে।
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedRequest(null)}
              className="h-9 text-xs font-bold rounded-xl"
            >
              বাতিল
            </Button>
            <Button
              type="button"
              disabled={Boolean(mutatingId)}
              onClick={handleConfirmProcess}
              className={cn(
                "h-9 text-xs font-black rounded-xl text-white gap-1.5",
                actionType === "completed" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700",
              )}
            >
              {mutatingId && <Loader2 className="h-4 w-4 animate-spin" />}
              {actionType === "completed" ? "কনফার্ম ও পেইড মার্ক করুন" : "কনফার্ম বাতিল করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
