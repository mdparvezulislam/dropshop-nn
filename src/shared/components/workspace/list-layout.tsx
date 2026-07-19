import * as React from "react";
import { cn } from "@/shared/utils/cn";
import { PageHeader, type PageHeaderProps } from "./page-header";

export interface ListLayoutProps {
  header: PageHeaderProps;
  toolbar?: React.ReactNode;
  stats?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ListLayout({
  header,
  toolbar,
  stats,
  children,
  className,
}: ListLayoutProps): React.ReactElement {
  return (
    <div className={cn("space-y-5 animate-[fade-in_0.2s_ease-out]", className)}>
      <PageHeader {...header} />
      {stats ? <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">{stats}</div> : null}
      {toolbar}
      <div>{children}</div>
    </div>
  );
}

export default ListLayout;
