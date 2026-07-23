import { PackageOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyListingProps {
  onReset?: () => void;
  message?: string;
}

export function EmptyListing({
  onReset,
  message = "No products match your filters. Try adjusting or clearing them.",
}: EmptyListingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No Products Found</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
