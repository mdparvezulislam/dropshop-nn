"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, AlertTriangle, ShieldX, CheckCircle2, ArrowRight, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ResellerStatusGuardProps {
  status?: "pending" | "under_review" | "active" | "suspended" | "rejected" | "archived" | string;
  children: React.ReactNode;
}

export function ResellerStatusGuard({
  status = "active",
  children,
}: ResellerStatusGuardProps): React.ReactElement {
  if (status === "active") {
    return <>{children}</>;
  }

  if (status === "pending" || status === "under_review") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/30">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">
          আপনার রিসেলার আবেদন পর্যালোচনা করা হচ্ছে
        </h2>
        <p className="max-w-md text-sm text-muted-foreground mb-6 leading-relaxed">
          আপনার রিসেলার অ্যাকাউন্টটি এডমিন টিম রিভিউ করছে (সাধারণত ১-২ ঘণ্টার মধ্যে সম্পন্ন হয়)। অনুমোদন পাওয়া মাত্র আপনার সেলস ওয়ালেট ও ক্যাটালগ উন্মুক্ত হয়ে যাবে।
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/become-reseller">
            <Button variant="outline" className="gap-2 text-xs font-bold">
              আবেদনের স্ট্যাটাস দেখুন <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/reseller/support">
            <Button variant="ghost" className="gap-2 text-xs font-bold">
              <LifeBuoy className="w-4 h-4" /> সাপোর্ট হাবে যোগাযোগ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "suspended" || status === "archived") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mb-4 border border-destructive/30">
          <ShieldX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">
          রিসেলার অ্যাকাউন্ট স্থগিত করা হয়েছে
        </h2>
        <p className="max-w-md text-sm text-muted-foreground mb-6 leading-relaxed">
          নিরাপত্তা বা পলিসি রিভিউর কারণে আপনার রিসেলার সার্ভিসটি সাময়িকভাবে স্থগিত আছে। বিস্তারিত জানতে এডমিন সাপোর্ট টিমের সাথে যোগাযোগ করুন।
        </p>
        <Link href="/reseller/support">
          <Button className="gap-2 text-xs font-bold shadow-md">
            <LifeBuoy className="w-4 h-4" /> এডমিন সাপোর্টে কথা বলুন
          </Button>
        </Link>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center mb-4 border border-red-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">
          আবেদনটি অনুমোদন করা সম্ভব হয়নি
        </h2>
        <p className="max-w-md text-sm text-muted-foreground mb-6 leading-relaxed">
          আপনার জমা দেওয়া তথ্যে অসংগতি পাওয়া গেছে। সঠিক ও হালনাগাদ তথ্য প্রদান করে পুনরায় আবেদন করুন।
        </p>
        <Link href="/become-reseller">
          <Button className="gap-2 text-xs font-bold shadow-md">
            আবেদন সংশোধন করুন <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
