import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-8xl font-extrabold text-primary/20 select-none">404</div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-foreground/50 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground font-medium px-6 hover:bg-primary/90 transition-all"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 h-10 rounded-xl border border-border/60 text-foreground/70 font-medium px-6 hover:bg-muted/60 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse Products
        </Link>
      </div>
    </div>
  );
}
