import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/15 to-primary/5 text-primary shadow-glow mb-6">
        <span className="text-4xl font-black">404</span>
        <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl -z-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
        The page you are looking for does not exist, has been moved, or is temporarily unavailable.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link href="/">
          <Button size="lg" className="gap-2 shadow-sm">
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" size="lg" className="gap-2 border-border/80">
            <Search className="h-4 w-4" />
            Browse Products
          </Button>
        </Link>
      </div>
    </div>
  );
}
