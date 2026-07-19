import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface CreateLayoutProps {
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function CreateLayout({
  header,
  main,
  sidebar,
  footer,
  className,
}: CreateLayoutProps): React.ReactElement {
  return (
    <div className={cn("flex flex-col min-h-[calc(100vh-4rem)]", className)}>
      <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md px-0 py-3 -mx-0">
        {header}
      </div>
      <div
        className={cn(
          "flex-1 grid gap-5 py-5",
          sidebar ? "lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]" : "",
        )}
      >
        <div className="min-w-0 space-y-5 pb-24">{main}</div>
        {sidebar ? (
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start pb-24">{sidebar}</aside>
        ) : null}
      </div>
      {footer ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-md lg:left-[var(--sidebar-current,0px)]">
          <div className="mx-auto max-w-[var(--content-max)] px-4 sm:px-6 py-3">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}

export default CreateLayout;
