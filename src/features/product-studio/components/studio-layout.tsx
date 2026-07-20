"use client";

import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface StudioLayoutProps {
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
}

export function StudioLayout({ header, main, sidebar, footer }: StudioLayoutProps): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        {header}
      </header>
      <div className="flex-1 flex flex-col lg:flex-row mx-auto w-full max-w-[var(--content-max)] px-4 sm:px-6 lg:px-8 py-5 gap-6">
        <main className="flex-1 min-w-0 space-y-5">
          {main}
        </main>
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto ws-scroll space-y-4">
            {sidebar}
          </div>
        </aside>
      </div>
      {footer ? (
        <footer className="sticky bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}

export interface StudioSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function StudioSection({ id, title, description, children, className }: StudioSectionProps): React.ReactElement {
  return (
    <section id={`studio-${id}`} className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground mt-0.5">{description}</p> : null}
      </div>
      <div className="px-5 py-4 space-y-4">
        {children}
      </div>
    </section>
  );
}
