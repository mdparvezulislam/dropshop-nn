import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-xs font-bold text-slate-600", className)}>
      <Link
        href="/"
        className="flex items-center gap-1 text-slate-600 hover:text-amber-600 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-slate-600 hover:text-amber-600 transition-colors font-bold"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-black" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
