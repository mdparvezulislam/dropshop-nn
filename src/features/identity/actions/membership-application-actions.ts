"use server";

import { auth } from "@/lib/auth";
import { businessMembershipService } from "../services/business-membership-service";
import { businessMembershipApplicationRepository } from "../repositories/business-membership-application-repository";
import { businessMembershipRepository } from "../repositories/business-membership-repository";
import {
  CommonApplicationFields,
  ResellerApplicationFields,
  WholesalerApplicationFields,
} from "../domain/business-membership-entity";

export async function submitMembershipApplicationAction(input: {
  membershipType: string;
  commonFields: CommonApplicationFields;
  resellerFields?: ResellerApplicationFields;
  wholesalerFields?: WholesalerApplicationFields;
}) {
  try {
    const session = await auth();
    const user = session?.user as
      { id?: string; name?: string | null; email?: string | null } | undefined;
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

export async function getUserMembershipStatusAction(membershipType: string) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | undefined;
    if (!user || !user.id) {
      return {
        success: true,
        data: { isLoggedIn: false, activeApplication: null, isMember: false },
      };
    }

    const [activeApp, memberships] = await Promise.all([
      businessMembershipApplicationRepository.findActiveByUserAndType(user.id, membershipType),
      businessMembershipRepository.findByUserId(user.id),
    ]);

    const isMember = memberships.some(
      (m) => m.membershipType === membershipType && m.status === "active",
    );

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

export async function submitApplicationWithRegistrationAction(input: {
  email: string;
  password?: string;
  membershipType: string;
  commonFields: CommonApplicationFields;
  resellerFields?: ResellerApplicationFields;
  wholesalerFields?: WholesalerApplicationFields;
}) {
  try {
    const session = await auth();
    let userId = (session?.user as { id?: string })?.id;
    let userEmail = (session?.user as { email?: string })?.email || input.email;

    if (!userId) {
      if (!input.password || input.password.length < 6) {
        return { success: false, error: "সর্বনিম্ন ৬ অক্ষরের একটি পাসওয়ার্ড লিখুন।" };
      }
      const { AuthService } = await import("@/features/auth/services/auth-service");
      const authService = new AuthService();
      const cleanEmail = input.email.trim().toLowerCase();
      const baseUsername = cleanEmail.split("@")[0] || "reseller";
      const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser = await authService.register({
        username,
        email: cleanEmail,
        phone: input.commonFields.phone,
        fullName: input.commonFields.fullName,
        password: input.password,
      });

      userId = newUser.id;
      userEmail = cleanEmail;
    }

    const app = await businessMembershipService.submitApplication({
      userId,
      userFullName: input.commonFields.fullName,
      userPhone: input.commonFields.phone,
      userEmail,
      membershipType: input.membershipType,
      commonFields: input.commonFields,
      resellerFields: input.resellerFields,
      wholesalerFields: input.wholesalerFields,
    });

    return { success: true, data: app, userId };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "নিবন্ধন ও আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে",
    };
  }
}

