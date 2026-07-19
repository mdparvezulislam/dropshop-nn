import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface ToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function Toolbar({ left, right, className }: ToolbarProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs",
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">{left}</div>
      {right ? <div className="flex flex-wrap items-center gap-2 shrink-0">{right}</div> : null}
    </div>
  );
}

export default Toolbar;
