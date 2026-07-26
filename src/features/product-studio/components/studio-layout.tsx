"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface StudioLayoutProps {
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
  mobileFooter?: React.ReactNode;
}

export function StudioLayout({
  header,
  main,
  sidebar,
  mobileFooter,
}: StudioLayoutProps): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground select-none pb-20 lg:pb-6">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md shadow-2xs">
        {header}
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col md:flex-row mx-auto w-full max-w-[94rem] px-3 sm:px-6 lg:px-8 py-5 gap-6">
        {/* Main Content Area: Desktop 72%, Tablet 65%, Mobile 100% */}
        <main className="w-full md:w-[65%] lg:w-[72%] min-w-0 space-y-6 animate-fade-in">
          {main}
        </main>

        {/* Sticky Sidebar: Desktop 28%, Tablet 35%, Mobile hidden/below */}
        <aside className="hidden md:block w-[35%] lg:w-[28%] shrink-0">
          <div className="md:sticky md:top-18 md:max-h-[calc(100vh-5.5rem)] md:overflow-y-auto ws-scroll space-y-4 pr-0.5">
            {sidebar}
          </div>
        </aside>

        {/* Mobile Sidebar Fallback */}
        <div className="md:hidden w-full space-y-4 pt-4 border-t border-border">{sidebar}</div>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      {mobileFooter ? (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-md p-3 shadow-xl">
          {mobileFooter}
        </div>
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
  action?: React.ReactNode;
}

export function StudioSection({
  id,
  title,
  description,
  children,
  className,
  action,
}: StudioSectionProps): React.ReactElement {
  return (
    <section
      id={`studio-${id}`}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-2xs transition-all duration-200 hover:shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6 space-y-5">{children}</div>
    </section>
  );
}
