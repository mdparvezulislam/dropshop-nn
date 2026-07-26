import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-md border border-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 border border-destructive/20",
        outline:
          "border border-border bg-card text-foreground shadow-2xs hover:bg-muted/70 hover:border-border/80",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/90",
        ghost: "hover:bg-muted/80 hover:text-foreground text-muted-foreground font-medium",
        link: "text-primary underline-offset-4 hover:underline font-semibold",
        success:
          "bg-success text-success-foreground shadow-xs hover:bg-success/90 border border-success/20",
        warning:
          "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90 border border-warning/20",
        soft: "bg-accent text-accent-foreground hover:bg-accent/80 border border-amber-200/50",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs sm:text-sm font-semibold",
        sm: "h-8 rounded-md px-3 text-xs font-semibold",
        lg: "h-10 rounded-lg px-5 text-sm font-semibold",
        xl: "h-11 rounded-xl px-7 text-base font-bold",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
