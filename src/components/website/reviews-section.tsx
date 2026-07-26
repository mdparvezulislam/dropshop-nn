"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  avatar?: string;
  images?: string[];
}

interface ReviewsSectionProps {
  rating: number;
  totalCount: number;
  reviews: Review[];
  distribution?: { stars: number; count: number }[];
}

const defaultDistribution = [
  { stars: 5, count: 0 },
  { stars: 4, count: 0 },
  { stars: 3, count: 0 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

export function ReviewsSection({
  rating,
  totalCount,
  reviews,
  distribution = defaultDistribution,
}: ReviewsSectionProps) {
  if (totalCount === 0) {
    return (
      <section className="py-8 border-t border-border/40">
        <h2 className="text-lg font-semibold text-foreground mb-4">Customer Reviews</h2>
        <div className="text-center py-12 rounded-xl border border-border/60 bg-muted/20">
          <p className="text-sm text-foreground/50">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      </section>
    );
  }

  const totalInDistribution = distribution.reduce((sum, d) => sum + d.count, 0);
  const dist = totalInDistribution > 0 ? distribution : defaultDistribution;

  return (
    <section className="py-8 border-t border-border/40">
      <h2 className="text-lg font-semibold text-foreground mb-6">Customer Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 p-4 rounded-xl border border-border/60 bg-card text-center">
          <p className="text-4xl font-bold text-foreground">{rating.toFixed(1)}</p>
          <div className="flex justify-center gap-0.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(rating) ? "text-amber-500 fill-amber-500" : "text-foreground/20",
                )}
              />
            ))}
          </div>
          <p className="text-sm text-foreground/50">{totalCount} reviews</p>
        </div>

        <div className="md:col-span-2 space-y-2">
          {dist.map((d) => (
            <div key={d.stars} className="flex items-center gap-3">
              <span className="text-xs text-foreground/50 w-6 text-right">{d.stars}</span>
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{
                    width: `${totalCount > 0 ? (d.count / totalCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-foreground/50 w-6">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 rounded-xl border border-border/60 bg-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground/50">
                  {review.avatar ?? review.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.author}</p>
                  <p className="text-xs text-foreground/40">{review.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                ))}
              </div>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">{review.content}</p>
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.images.map((img, i) => (
                  <div
                    key={i}
                    className="h-16 w-16 rounded-lg bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
