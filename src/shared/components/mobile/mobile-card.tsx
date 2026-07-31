"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
}

export function MobileCard({
  className,
  children,
  interactive = false,
  padded = true,
  ...props
}: MobileCardProps): React.ReactElement {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs transition-all",
        padded && "p-3.5 sm:p-5",
        interactive && "hover:border-amber-400 dark:hover:border-amber-600 active:scale-[0.98] cursor-pointer touch-manipulation",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default MobileCard;
