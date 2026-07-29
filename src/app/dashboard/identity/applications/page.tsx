"use client";

import { BusinessMembershipApprovalCenter } from "@/features/identity/components/business-membership-approval-center";

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <BusinessMembershipApprovalCenter />
    </div>
  );
}
