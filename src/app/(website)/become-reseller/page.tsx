import type { Metadata } from "next";
import { getUserMembershipStatusAction } from "@/features/identity/actions/membership-application-actions";
import { ResellerApplicationPageClient } from "./reseller-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a Reseller Partner - DropshopNN Bangladesh",
  description:
    "জিরো ইনভেস্টমেন্টে ড্রপশিপিং রিসেলিং শুরু করুন। ক্যাটালগ অ্যাক্সেস, ফাস্ট ডেলিভারি ও প্রফিট উইথড্র সুবিধা।",
};

export default async function BecomeResellerPage() {
  const res = await getUserMembershipStatusAction("reseller");
  const statusData = res.success ? res.data : null;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-10">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <ResellerApplicationPageClient initialData={statusData} />
      </div>
    </div>
  );
}
