import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { PageHeader, type PageHeaderProps } from "./page-header";

export interface DetailsLayoutProps {
  header: PageHeaderProps;
  tabs?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DetailsLayout({
  header,
  tabs,
  sidebar,
  children,
  className,
}: DetailsLayoutProps): React.ReactElement {
  return (
    <div className={cn("space-y-5 animate-[fade-in_0.2s_ease-out]", className)}>
      <PageHeader {...header} />
      {tabs}
      <div
        className={cn(
          "grid gap-5",
          sidebar ? "lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]" : "",
        )}
      >
        <div className="min-w-0 space-y-5">{children}</div>
        {sidebar ? (
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">{sidebar}</aside>
        ) : null}
      </div>
    </div>
  );
}

export default DetailsLayout;
