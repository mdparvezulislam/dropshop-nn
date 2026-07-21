"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ProductPaginationProps {
  hasMore: boolean;
  loading: boolean;
  totalCount: number;
  onLoadMore: () => void;
}

export function ProductPagination({
  hasMore,
  loading,
  totalCount,
  onLoadMore,
}: ProductPaginationProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-8">
      {hasMore ? (
        <Button
          variant="outline"
          size="lg"
          onClick={onLoadMore}
          disabled={loading}
          className="min-w-[160px]"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Loading..." : "Load More Products"}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          Showing all {totalCount} products
        </p>
      )}
    </div>
  );
}
