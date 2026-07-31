import type { Metadata } from "next";
import { BusinessMembershipApprovalCenter } from "@/features/identity/components/business-membership-approval-center";

export const metadata: Metadata = {
  title: "Membership Application Approvals - NN Enterprise",
  robots: { index: false },
};

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <BusinessMembershipApprovalCenter />
    </div>
  );
}
