"use client";

import { cn } from "@/lib/utils/cn";
import type { TocHeading } from "@/features/cms/utils/blog-utils";

interface BlogTocProps {
  headings: TocHeading[];
  activeId?: string;
}

export function BlogToc({ headings, activeId }: BlogTocProps): React.ReactElement | null {
  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border/60">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block border-l-2 border-transparent py-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
                heading.level === 3 ? "pl-5" : "pl-3",
                activeId === heading.id && "border-primary text-primary",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
