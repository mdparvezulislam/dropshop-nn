import type { Metadata } from "next";
import { getUserMembershipStatusAction } from "@/features/identity/actions/membership-application-actions";
import { WholesalerApplicationPageClient } from "./wholesaler-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a Wholesale Partner - DropshopNN Bangladesh",
  description: "বি২বি পাইকারি ও বাল্ক অর্ডারের জন্য হোলসেলার মেম্বারশিপ আবেদন করুন। সরাসরি ইম্পোর্টার রেট ও টিয়ার ডিসকাউন্ট।",
};

export default async function BecomeWholesalePartnerPage() {
  const res = await getUserMembershipStatusAction("wholesaler");
  const statusData = res.success ? res.data : null;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-10">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <WholesalerApplicationPageClient initialData={statusData} />
      </div>
    </div>
  );
}
