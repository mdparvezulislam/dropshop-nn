"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface StudioCollapsibleSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function StudioCollapsibleSection({
  id,
  title,
  description,
  children,
  defaultExpanded = true,
  action,
  badge,
  className,
}: StudioCollapsibleSectionProps): React.ReactElement {
  const storageKey = `studio-section-expanded-${id}`;
  const [expanded, setExpanded] = React.useState<boolean>(defaultExpanded);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setExpanded(saved === "true");
      }
    } catch {
      // Fallback to default
    }
  }, [storageKey]);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <section
      id={`studio-${id}`}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-2xs transition-all duration-200 hover:shadow-xs overflow-hidden",
        className,
      )}
    >
      <div
        className="flex items-center justify-between border-b border-border px-5 py-4 cursor-pointer select-none bg-card hover:bg-muted/30 transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground transition-transform duration-200"
            aria-expanded={expanded}
            aria-label={`Toggle ${title}`}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180 text-primary")} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">{title}</h2>
              {badge}
            </div>
            {description ? (
              <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">{description}</p>
            ) : null}
          </div>
        </div>

        {action ? <div onClick={(e) => e.stopPropagation()}>{action}</div> : null}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 space-y-5 border-t border-border/40">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
