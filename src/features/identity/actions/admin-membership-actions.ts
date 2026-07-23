"use server";

import { auth } from "@/lib/auth";
import { checkAnyRole } from "@/lib/check-permission";
import { businessMembershipService } from "../services/business-membership-service";
import BusinessMembershipTypeService from "../services/business-membership-type-service";
import { businessMembershipApplicationRepository } from "../repositories/business-membership-application-repository";
import { ApplicationStatus, MembershipBenefits } from "../domain/business-membership-entity";

const typeService = new BusinessMembershipTypeService();

export async function adminGetMembershipTypesAction() {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin", "manager", "staff"]);

    const types = await typeService.getAllTypes();
    return { success: true, data: types };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "মেম্বারশিপ টাইপ তালিকা লোড করা যায়নি",
    };
  }
}

export async function adminCreateMembershipTypeAction(input: {
  slug: string;
  name: string;
  banglaName: string;
  description: string;
  icon?: string;
  color?: string;
  priority?: number;
  approvalRequired?: boolean;
  isActive?: boolean;
  benefits?: Partial<MembershipBenefits>;
}) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin"]);

    const created = await typeService.createType(input);
    return { success: true, data: created };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "মেম্বারশিপ টাইপ তৈরি করা যায়নি",
    };
  }
}

export async function adminUpdateMembershipTypeAction(
  id: string,
  updates: {
    name?: string;
    banglaName?: string;
    description?: string;
    icon?: string;
    color?: string;
    priority?: number;
    approvalRequired?: boolean;
    isActive?: boolean;
    benefits?: Partial<MembershipBenefits>;
  },
) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin"]);

    const updated = await typeService.updateType(id, updates as never);
    return { success: true, data: updated };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "মেম্বারশিপ টাইপ আপডেট করা যায়নি",
    };
  }
}

export async function adminArchiveMembershipTypeAction(id: string) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin"]);

    const archived = await typeService.archiveType(id);
    return { success: true, data: archived };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "মেম্বারশিপ টাইপ আরকাইভ করা যায়নি",
    };
  }
}

export async function adminToggleMembershipTypeActiveAction(id: string, isActive: boolean) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin"]);

    const toggled = await typeService.toggleActive(id, isActive);
    return { success: true, data: toggled };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "মেম্বারশিপ স্ট্যাটাস পরিবর্তন করা যায়নি",
    };
  }
}

export async function adminGetMembershipApplicationsAction(params: {
  status?: ApplicationStatus;
  membershipType?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin", "manager", "staff"]);

    const data = await businessMembershipApplicationRepository.listApplications(params);
    const analytics = await businessMembershipApplicationRepository.getAnalytics();

    return { success: true, data: { ...data, analytics } };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "আবেদন তালিকা লোড করা যায়নি",
    };
  }
}

export async function adminReviewApplicationAction(input: {
  applicationId: string;
  action: "approve" | "reject" | "need_info" | "under_review";
  rejectionReason?: string;
  adminQuestion?: string;
  reviewNotes?: string;
}) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin", "manager"]);
    const user = session?.user as { id?: string; name?: string | null; role?: string } | undefined;

    const updated = await businessMembershipService.reviewApplication({
      applicationId: input.applicationId,
      adminId: user?.id || "admin",
      adminRole: user?.role || "admin",
      action: input.action,
      rejectionReason: input.rejectionReason,
      adminQuestion: input.adminQuestion,
      reviewNotes: input.reviewNotes,
    });

    return { success: true, data: updated };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "আবেদন রিভিউ করতে সমস্যা হয়েছে",
    };
  }
}

export async function adminManageUserMembershipsAction(input: {
  targetUserId: string;
  memberships: string[];
  actionNote?: string;
}) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin", "manager"]);
    const user = session?.user as { id?: string; role?: string } | undefined;

    const result = await businessMembershipService.adminManageUserMemberships({
      targetUserId: input.targetUserId,
      memberships: input.memberships,
      adminId: user?.id || "admin",
      adminRole: user?.role || "admin",
      actionNote: input.actionNote,
    });

    return { success: true, data: result };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "মেম্বারশিপ আপডেট করতে সমস্যা হয়েছে",
    };
  }
}

export async function adminGetApplicationDetailsAction(applicationId: string) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin", "manager", "staff"]);

    const app = await businessMembershipApplicationRepository.findById(applicationId);
    if (!app) return { success: false, error: "আবেদন পাওয়া যায়নি" };

    const [notes, history] = await Promise.all([
      businessMembershipService.getApplicationNotes(applicationId),
      businessMembershipService.getUserMembershipHistory(app.userId),
    ]);

    return {
      success: true,
      data: {
        application: app,
        notes,
        history,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "আবেদনের বিস্তারিত লোড করতে সমস্যা হয়েছে",
    };
  }
}

export async function adminAddApplicationNoteAction(input: {
  applicationId: string;
  note: string;
}) {
  try {
    const session = await auth();
    checkAnyRole(session, ["super_admin", "admin", "manager", "staff"]);
    const user = session?.user as { id?: string; name?: string | null } | undefined;

    const note = await businessMembershipService.addApplicationNote({
      applicationId: input.applicationId,
      authorId: user?.id || "admin",
      authorName: user?.name || "Admin",
      note: input.note,
      isInternal: true,
    });

    return { success: true, data: note };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "নোট যুক্ত করতে সমস্যা হয়েছে",
    };
  }
}
