import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center border font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/15 text-destructive",
        outline: "border-border text-foreground",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        info: "border-transparent bg-info/15 text-info",
        muted: "border-transparent bg-muted text-muted-foreground",
        soft: "border-transparent bg-accent text-foreground font-bold",
      },
      size: {
        xs: "rounded px-1 py-px text-[9px]",
        sm: "rounded-md px-1.5 py-0.5 text-[10px]",
        default: "rounded-md px-2 py-0.5 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({
  className,
  variant,
  size,
  dot,
  dotColor,
  children,
  ...props
}: BadgeProps): React.ReactElement {
  return (
    <div className={cn(badgeVariants({ variant, size }), dot && "gap-1.5", className)} {...props}>
      {dot ? (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor || "bg-current")}
        />
      ) : null}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
export default Badge;
