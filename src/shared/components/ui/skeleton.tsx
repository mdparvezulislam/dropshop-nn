import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text" | "card";
  shimmer?: boolean;
}

function Skeleton({
  className,
  variant = "rectangular",
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted/60 relative overflow-hidden",
        shimmer
          ? "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent"
          : "animate-pulse",
        {
          "rounded-md": variant === "rectangular",
          "rounded-full": variant === "circular",
          "h-4 w-full rounded": variant === "text",
          "h-32 w-full rounded-xl border border-border/40 p-4": variant === "card",
        },
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
export default Skeleton;
