import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      <Link
        href="/"
        className="flex items-center gap-1 text-foreground/40 hover:text-foreground/70 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-foreground/20" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-foreground/50 hover:text-foreground/70 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground/80 font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
