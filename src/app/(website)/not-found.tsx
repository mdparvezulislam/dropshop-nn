import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center bg-[hsl(0_0%_98%)] text-foreground py-16">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-amber-300 bg-amber-50 text-amber-600 shadow-sm mb-6">
        <span className="text-4xl font-black">404</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
        পৃষ্ঠাটি পাওয়া যায়নি (Page Not Found)
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed font-medium">
        আপনি যে পেজটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা অ্যাড্রেসটি ভুল লেখা হয়েছে।
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link href="/">
          <Button
            size="lg"
            className="h-11 px-6 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
          >
            <Home className="h-4 w-4 mr-2" />
            হোম পেজে ফিরে যান
          </Button>
        </Link>
        <Link href="/products">
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-6 text-xs font-extrabold border-border/80 text-foreground hover:bg-muted"
          >
            <Search className="h-4 w-4 mr-2 text-amber-600" />
            প্রোডাক্ট ক্যাটালগ দেখুন
          </Button>
        </Link>
      </div>
    </div>
  );
}
