import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps): React.ReactElement {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-3", className)}>
      <div>
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground mt-0.5">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default SectionHeader;
