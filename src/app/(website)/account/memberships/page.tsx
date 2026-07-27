import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { businessMembershipRepository } from "@/features/identity/repositories/business-membership-repository";
import { businessMembershipApplicationRepository } from "@/features/identity/repositories/business-membership-application-repository";
import { businessMembershipService } from "@/features/identity/services/business-membership-service";
import { UserMembershipsClient } from "./memberships-client";

export const metadata: Metadata = {
  title: "বিজনেস মেম্বারশিপ হাব - DropshopNN Bangladesh",
  description: "আপনার বিজনেস মেম্বারশিপ স্ট্যাটাস, লাইভ অ্যাপ্লিকেশন ট্র্যাকিং ও ইতিহাস দেখুন।",
};

export default async function UserMembershipsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?redirect=/account/memberships");
  }

  const [memberships, applications, history] = await Promise.all([
    businessMembershipRepository.findByUserId(session.user.id),
    businessMembershipApplicationRepository.findByUserId(session.user.id),
    businessMembershipService.getUserMembershipHistory(session.user.id),
  ]);

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <UserMembershipsClient
          userMemberships={memberships}
          applications={applications}
          history={history}
        />
      </div>
    </div>
  );
}
