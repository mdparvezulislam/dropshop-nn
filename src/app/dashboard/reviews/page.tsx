"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, CheckCircle2, XCircle, Eye, EyeOff, Search, ArrowUpDown, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  listReviewsForModerationAction,
  moderateReviewAction,
  getReviewCountsAction,
  type AdminReviewItem,
} from "@/features/reviews/actions/review-admin-actions";
import type { ReviewStatus } from "@/features/reviews/domain/review-entity";

const STATUS_LABELS: Record<ReviewStatus, string> = {
  published: "প্রকাশিত",
  pending: "অপেক্ষমাণ",
  rejected: "প্রত্যাখ্যাত",
  hidden: "লুকানো",
};

const STATUS_BADGE_VARIANTS: Record<ReviewStatus, string> = {
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  hidden: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

function StatusBadge({ status }: { status: ReviewStatus }): React.ReactElement {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_BADGE_VARIANTS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function ReviewRow({
  review,
  onModerate,
  moderating,
}: {
  review: AdminReviewItem;
  onModerate: (id: string, status: ReviewStatus, reason?: string) => void;
  moderating: string | null;
}): React.ReactElement {
  const [showRejectInput, setShowRejectInput] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">{review.authorName}</span>
              <StatusBadge status={review.status} />
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("bn-BD")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < review.rating ? "text-amber-400" : "text-muted-foreground/30"}`}
                >
                  ★
                </span>
              ))}
              <span className="text-xs text-muted-foreground ml-1">অর্ডার #{review.orderNumber}</span>
            </div>
            {review.title && (
              <p className="text-sm font-semibold text-foreground">{review.title}</p>
            )}
            {review.body && (
              <p className="text-sm text-muted-foreground line-clamp-3">{review.body}</p>
            )}
            {review.rejectionReason && (
              <p className="text-xs text-red-400 mt-1">
                কারণ: {review.rejectionReason}
              </p>
            )}
          </div>

          <div className="shrink-0 flex flex-col gap-1.5">
            {review.status !== "published" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => onModerate(review.id, "published")}
                disabled={moderating === review.id}
              >
                {moderating === review.id ? <Spinner size="sm" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                প্রকাশ
              </Button>
            )}
            {review.status !== "rejected" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => setShowRejectInput(!showRejectInput)}
                disabled={moderating === review.id}
              >
                <XCircle className="h-3.5 w-3.5" />
                প্রত্যাখ্যান
              </Button>
            )}
            {review.status !== "hidden" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1 border-slate-500/30 text-slate-400 hover:bg-slate-500/10"
                onClick={() => onModerate(review.id, "hidden")}
                disabled={moderating === review.id}
              >
                <EyeOff className="h-3.5 w-3.5" />
                লুকান
              </Button>
            )}
            {review.status !== "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                onClick={() => onModerate(review.id, "pending")}
                disabled={moderating === review.id}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                পেন্ডিং
              </Button>
            )}
          </div>
        </div>

        {showRejectInput && (
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="প্রত্যাখ্যানের কারণ (ঐচ্ছিক)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="flex-1 h-8 text-xs"
            />
            <Button
              size="sm"
              className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                onModerate(review.id, "rejected", rejectReason || undefined);
                setShowRejectInput(false);
                setRejectReason("");
              }}
              disabled={moderating === review.id}
            >
              নিশ্চিত
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReviewsModerationPage(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusFilter = (searchParams.get("status") as ReviewStatus | "all") || "pending";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [reviews, setReviews] = React.useState<AdminReviewItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [counts, setCounts] = React.useState({ published: 0, pending: 0, rejected: 0, hidden: 0 });
  const [loading, setLoading] = React.useState(true);
  const [moderating, setModerating] = React.useState<string | null>(null);

  async function loadReviews() {
    setLoading(true);
    const [listRes, countsRes] = await Promise.all([
      listReviewsForModerationAction({ status: statusFilter, page, limit: 20 }),
      getReviewCountsAction(),
    ]);

    if (listRes.success) {
      setReviews(listRes.data.items);
      setTotalCount(listRes.data.totalCount);
      setTotalPages(listRes.data.totalPages);
    }
    if (countsRes.success) {
      setCounts(countsRes.data);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadReviews();
  }, [statusFilter, page]);

  async function handleModerate(reviewId: string, status: ReviewStatus, reason?: string) {
    setModerating(reviewId);
    const res = await moderateReviewAction({ reviewId, status, rejectionReason: reason });
    if (res.success) {
      await loadReviews();
    }
    setModerating(null);
  }

  function setFilter(status: string) {
    const params = new URLSearchParams(searchParams);
    params.set("status", status);
    params.delete("page");
    router.push(`/dashboard/reviews?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    router.push(`/dashboard/reviews?${params.toString()}`);
  }

  const statusTabs = [
    { key: "all", label: "সব", count: counts.published + counts.pending + counts.rejected + counts.hidden },
    { key: "pending", label: "অপেক্ষমাণ", count: counts.pending },
    { key: "published", label: "প্রকাশিত", count: counts.published },
    { key: "rejected", label: "প্রত্যাখ্যাত", count: counts.rejected },
    { key: "hidden", label: "লুকানো", count: counts.hidden },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            রিভিউ মডারেশন
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            গ্রাহকের রিভিউ পর্যালোচনা ও মডারেট করুন
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
            <span className="opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">কোনো রিভিউ নেই</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {statusFilter === "all"
                ? "এখনও কোনো রিভিউ জমা পড়েনি"
                : `কোনো "${STATUS_LABELS[statusFilter as ReviewStatus]}" রিভিউ নেই`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
              onModerate={handleModerate}
              moderating={moderating}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            পূর্ববর্তী
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            পরবর্তী
          </Button>
        </div>
      )}
    </div>
  );
}
