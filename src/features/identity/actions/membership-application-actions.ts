"use server";

import { auth } from "@/lib/auth";
import { businessMembershipService } from "../services/business-membership-service";
import { businessMembershipApplicationRepository } from "../repositories/business-membership-application-repository";
import { businessMembershipRepository } from "../repositories/business-membership-repository";
import { CommonApplicationFields, ResellerApplicationFields, WholesalerApplicationFields } from "../domain/business-membership-entity";

export async function submitMembershipApplicationAction(input: {
  membershipType: "reseller" | "wholesaler";
  commonFields: CommonApplicationFields;
  resellerFields?: ResellerApplicationFields;
  wholesalerFields?: WholesalerApplicationFields;
}) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; name?: string | null; email?: string | null } | undefined;
    if (!user || !user.id) {
      return { success: false, error: "আবেদন করার জন্য প্রথমে লগইন করা আবশ্যক।" };
    }

    const app = await businessMembershipService.submitApplication({
      userId: user.id,
      userFullName: user.name || input.commonFields.fullName,
      userPhone: input.commonFields.phone,
      userEmail: user.email || "",
      membershipType: input.membershipType,
      commonFields: input.commonFields,
      resellerFields: input.resellerFields,
      wholesalerFields: input.wholesalerFields,
    });

    return { success: true, data: app };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "আবেদন সাবমিট করতে সমস্যা হয়েছে",
    };
  }
}

export async function updateMembershipApplicationAction(input: {
  applicationId: string;
  commonFields: CommonApplicationFields;
  resellerFields?: ResellerApplicationFields;
  wholesalerFields?: WholesalerApplicationFields;
  userAnswer?: string;
}) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | undefined;
    if (!user || !user.id) {
      return { success: false, error: "লগইন করা আবশ্যক" };
    }

    const updated = await businessMembershipService.updateApplication({
      applicationId: input.applicationId,
      userId: user.id,
      commonFields: input.commonFields,
      resellerFields: input.resellerFields,
      wholesalerFields: input.wholesalerFields,
      userAnswer: input.userAnswer,
    });

    return { success: true, data: updated };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "আবেদন আপডেট করতে সমস্যা হয়েছে",
    };
  }
}

export async function getUserMembershipStatusAction(membershipType: "reseller" | "wholesaler") {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | undefined;
    if (!user || !user.id) {
      return { success: true, data: { isLoggedIn: false, activeApplication: null, isMember: false } };
    }

    const [activeApp, memberships] = await Promise.all([
      businessMembershipApplicationRepository.findActiveByUserAndType(user.id, membershipType),
      businessMembershipRepository.findByUserId(user.id),
    ]);

    const isMember = memberships.some((m) => m.membershipType === membershipType && m.status === "active");

    return {
      success: true,
      data: {
        isLoggedIn: true,
        activeApplication: activeApp,
        isMember,
        userMemberships: memberships,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "স্ট্যাটাস লোড করা সম্ভব হয়নি",
    };
  }
}
