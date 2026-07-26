"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/* ────────────────────────────── List Variants ─────────────────────────────── */

const tabsListVariants = cva("inline-flex items-center gap-px", {
  variants: {
    variant: {
      default: "border-b border-border bg-transparent",
      pills: "rounded-xl bg-muted p-1.5",
      enclosed: "rounded-t-xl border border-border border-b-0 bg-muted/30 px-3 pt-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-semibold transition-all duration-150 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "data-[state=active]:text-foreground data-[state=active]:shadow-2xs",
  {
    variants: {
      variant: {
        default:
          "px-4 py-2.5 text-muted-foreground border-b-2 border-transparent " +
          "data-[state=active]:border-primary data-[state=active]:font-bold " +
          "hover:text-foreground hover:border-border",
        pills:
          "px-4 py-2 rounded-lg text-muted-foreground " +
          "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs " +
          "hover:text-foreground",
        enclosed:
          "px-5 py-2.5 rounded-t-lg text-muted-foreground border border-transparent border-b-0 " +
          "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border-border " +
          "data-[state=active]:shadow-2xs " +
          "hover:text-foreground hover:bg-card/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/* ─────────────────────────────── Badge ────────────────────────────────────── */

function TabBadge({
  count,
  variant,
}: {
  count: number;
  variant: "error" | "warning" | "info";
}): React.ReactElement {
  const colorClass =
    variant === "error"
      ? "bg-destructive text-destructive-foreground"
      : variant === "warning"
        ? "bg-warning text-warning-foreground"
        : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold leading-none tabular-nums",
        colorClass,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ─────────────────────────────── Tab Item ─────────────────────────────────── */

export interface StudioTabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badgeCount?: number;
  badgeVariant?: "error" | "warning" | "info";
  disabled?: boolean;
}

/* ─────────────────────────────── Tab List ─────────────────────────────────── */

export interface StudioTabListProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "children">,
    VariantProps<typeof tabsListVariants> {
  tabs: StudioTabItem[];
  /** If true, the tab bar scrolls horizontally (use on narrow containers) */
  scrollable?: boolean;
  /** Accessible name for the tab list. */
  label?: string;
}

/**
 * Navigation-only tab bar.
 *
 * Use when the panels are laid out elsewhere in the page (e.g. beside a sidebar).
 * `StudioTabs` renders both the bar and the panels; pairing that with a separate
 * panel region renders every panel twice.
 */
export function StudioTabList({
  tabs,
  variant,
  scrollable = false,
  className,
  label,
  ...props
}: StudioTabListProps): React.ReactElement {
  return (
    <TabsPrimitive.Root className={cn("flex flex-col", className)} {...props}>
      <TabsPrimitive.List
        aria-label={label}
        className={cn(tabsListVariants({ variant }), scrollable && "overflow-x-auto ws-scroll")}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(tabsTriggerVariants({ variant }))}
          >
            {tab.icon ? <span className="h-4 w-4 shrink-0">{tab.icon}</span> : null}
            <span className="truncate">{tab.label}</span>
            {tab.badgeCount !== undefined && tab.badgeCount > 0 ? (
              <TabBadge count={tab.badgeCount} variant={tab.badgeVariant ?? "info"} />
            ) : null}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

/* ─────────────────────────────── Root ─────────────────────────────────────── */

export interface StudioTabsProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsListVariants> {
  tabs: StudioTabItem[];
  /** If true, the tab bar scrolls horizontally (use on narrow containers) */
  scrollable?: boolean;
  /** Content rendered per active tab — keyed by tab value */
  children: React.ReactNode;
}

export function StudioTabs({
  tabs,
  variant,
  scrollable = false,
  className,
  children,
  ...props
}: StudioTabsProps): React.ReactElement {
  return (
    <TabsPrimitive.Root className={cn("flex flex-col", className)} {...props}>
      <TabsPrimitive.List
        className={cn(tabsListVariants({ variant }), scrollable && "overflow-x-auto ws-scroll")}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(tabsTriggerVariants({ variant }))}
          >
            {tab.icon ? <span className="h-4 w-4 shrink-0">{tab.icon}</span> : null}
            <span className="truncate">{tab.label}</span>
            {tab.badgeCount !== undefined && tab.badgeCount > 0 ? (
              <TabBadge count={tab.badgeCount} variant={tab.badgeVariant ?? "info"} />
            ) : null}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child) || !child.props) return null;
        const props = child.props as { value?: string };
        return (
          <TabsPrimitive.Content
            value={props.value ?? ""}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset mt-0"
          >
            {child}
          </TabsPrimitive.Content>
        );
      })}
    </TabsPrimitive.Root>
  );
}

/* ─────────────────────────────── Convenience Panel ────────────────────────── */

export interface StudioTabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Convenience wrapper — its `value` prop is read by StudioTabs to
 * associate content with the correct tab.
 * Renders nothing itself; the StudioTabs Root wraps it in TabsPrimitive.Content.
 */
export function StudioTabPanel({ children, className }: StudioTabPanelProps): React.ReactElement {
  return <div className={cn("pt-5", className)}>{children}</div>;
}

export default StudioTabs;
