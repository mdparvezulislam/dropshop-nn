import { businessMembershipRepository } from "../repositories/business-membership-repository";
import { businessMembershipApplicationRepository } from "../repositories/business-membership-application-repository";
import { businessMembershipHistoryRepository } from "../repositories/business-membership-history-repository";
import { applicationNotesRepository } from "../repositories/application-notes-repository";
import { UserRepository } from "@/features/auth/repositories/user-repository";
import NotificationService from "@/features/notification/services/notification-service";
import {
  BusinessMembershipApplicationEntity,
  ApplicationStatus,
  CommonApplicationFields,
  ResellerApplicationFields,
  WholesalerApplicationFields,
} from "../domain/business-membership-entity";
import { ResellerRepository } from "@/features/reseller/repositories/reseller-repository";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/errors/app-error";

const notificationService = new NotificationService();

export class BusinessMembershipService {
  private readonly userRepository = new UserRepository();
  /**
   * Submit a new membership application (Reseller or Wholesaler)
   */
  public async submitApplication(input: {
    userId: string;
    userFullName: string;
    userPhone: string;
    userEmail: string;
    membershipType: string;
    commonFields: CommonApplicationFields;
    resellerFields?: ResellerApplicationFields;
    wholesalerFields?: WholesalerApplicationFields;
  }): Promise<BusinessMembershipApplicationEntity> {
    const existing = await businessMembershipApplicationRepository.findActiveByUserAndType(
      input.userId,
      input.membershipType,
    );

    if (existing && (existing.status === "pending" || existing.status === "under_review")) {
      throw new ValidationError(
        `আপনার একটি ${input.membershipType === "reseller" ? "রিসেলার" : "হোলসেলার"} আবেদন ইতোমধ্যে অপেক্ষমাণ রয়েছে।`,
      );
    }

    if (existing && existing.status === "approved") {
      throw new ValidationError(
        `আপনি ইতোমধ্যে একজন অনুমোদিত ${input.membershipType === "reseller" ? "রিসেলার" : "হোলসেলার"} মেম্বার।`,
      );
    }

    const app = await businessMembershipApplicationRepository.create({
      userId: input.userId,
      userFullName: input.userFullName,
      userPhone: input.userPhone,
      userEmail: input.userEmail,
      membershipType: input.membershipType,
      status: "pending",
      commonFields: input.commonFields,
      resellerFields: input.resellerFields,
      wholesalerFields: input.wholesalerFields,
    });

    // History Log
    await businessMembershipHistoryRepository.create({
      userId: input.userId,
      applicationId: app.id,
      membershipType: input.membershipType,
      action: "submitted",
      actorId: input.userId,
      actorRole: "applicant",
      newStatus: "pending",
      note: "আবেদন জমা দেওয়া হয়েছে",
    });

    // User Notification
    const typeLabel = input.membershipType === "reseller" ? "রিসেলার" : "হোলসেলার";
    try {
      await notificationService.notify({
        userId: input.userId,
        type: "membership.submitted",
        title: `${typeLabel} মেম্বারশিপ আবেদন জমা হয়েছে`,
        body: `আপনার ${typeLabel} মেম্বারশিপ আবেদনটি সফলভাবে জমা নেওয়া হয়েছে। পর্যালোচনা শেষে জানানো হবে।`,
        channels: ["in_app"],
      });

      // Admin & Super Admin Notifications
      const adminUsers = await this.userRepository.findAdminUsers();
      const applicantName = input.userFullName || input.commonFields.fullName;
      for (const admin of adminUsers) {
        await notificationService.notify({
          userId: admin.id,
          type: "membership.application_submitted",
          title: `নতুন ${typeLabel} মেম্বারশিপ আবেদন জমা হয়েছে`,
          body: `${applicantName} (${input.commonFields.phone}) একটি নতুন ${typeLabel} মেম্বারশিপ আবেদন জমা দিয়েছেন।`,
          href: "/dashboard/identity/applications",
          category: "account",
          channels: ["in_app"],
        });
      }
    } catch {
      // Non-blocking notification failure
    }

    return app;
  }

  /**
   * User edits & resubmits an existing application (if status is pending, need_info, or rejected)
   */
  public async updateApplication(input: {
    applicationId: string;
    userId: string;
    commonFields: CommonApplicationFields;
    resellerFields?: ResellerApplicationFields;
    wholesalerFields?: WholesalerApplicationFields;
    userAnswer?: string;
  }): Promise<BusinessMembershipApplicationEntity> {
    const app = await businessMembershipApplicationRepository.findById(input.applicationId);
    if (!app) {
      throw new NotFoundError("আবেদনটি পাওয়া যায়নি");
    }

    if (app.userId !== input.userId) {
      throw new ForbiddenError("অন্যের আবেদন পরিবর্তন করার অনুমতি নেই");
    }

    if (app.status === "approved") {
      throw new ValidationError("অনুমোদিত আবেদন পরিবর্তন করা সম্ভব নয়।");
    }

    const previousStatus = app.status;

    const updated = await businessMembershipApplicationRepository.update(input.applicationId, {
      commonFields: input.commonFields,
      resellerFields: input.resellerFields ?? app.resellerFields,
      wholesalerFields: input.wholesalerFields ?? app.wholesalerFields,
      userAnswer: input.userAnswer ?? app.userAnswer,
      status: "pending",
      rejectionReason: undefined,
    });

    if (!updated) throw new NotFoundError("আবেদন আপডেট করা যায়নি");

    // History Log
    await businessMembershipHistoryRepository.create({
      userId: input.userId,
      applicationId: input.applicationId,
      membershipType: app.membershipType,
      action: "edited",
      actorId: input.userId,
      actorRole: "applicant",
      previousStatus,
      newStatus: "pending",
      note: "আবেদন সংশোধন করে পুনঃজমাদান করা হয়েছে",
    });

    // User & Admin Notifications
    const typeLabel = app.membershipType === "reseller" ? "রিসেলার" : "হোলসেলার";
    const applicantName = input.commonFields.fullName || app.userFullName;
    try {
      await notificationService.notify({
        userId: input.userId,
        type: "membership.updated",
        title: `${typeLabel} আবেদন সংশোধিত হয়েছে`,
        body: `আপনার ${typeLabel} মেম্বারশিপ আবেদনটি সংশোধন করে পুনঃজমা নেওয়া হয়েছে।`,
        channels: ["in_app"],
      });

      const adminUsers = await this.userRepository.findAdminUsers();
      for (const admin of adminUsers) {
        await notificationService.notify({
          userId: admin.id,
          type: "membership.application_updated",
          title: `${typeLabel} মেম্বারশিপ আবেদন সংশোধিত হয়েছে`,
          body: `${applicantName} (${input.commonFields.phone}) তার ${typeLabel} মেম্বারশিপ আবেদনটি সংশোধন করে পুনঃজমা দিয়েছেন।`,
          href: "/dashboard/identity/applications",
          category: "account",
          channels: ["in_app"],
        });
      }
    } catch {
      // Non-blocking notification failure
    }

    return updated;
  }

  /**
   * Admin reviews an application: Approve, Reject, Request Info, or Set Under Review
   */
  public async reviewApplication(input: {
    applicationId: string;
    adminId: string;
    adminRole: string;
    action: "approve" | "reject" | "need_info" | "under_review";
    rejectionReason?: string;
    adminQuestion?: string;
    reviewNotes?: string;
  }): Promise<BusinessMembershipApplicationEntity> {
    const app = await businessMembershipApplicationRepository.findById(input.applicationId);
    if (!app) {
      throw new NotFoundError("আবেদনটি পাওয়া যায়নি");
    }

    const previousStatus = app.status;
    let newStatus: ApplicationStatus = "pending";

    if (input.action === "approve") newStatus = "approved";
    if (input.action === "reject") newStatus = "rejected";
    if (input.action === "need_info") newStatus = "need_info";
    if (input.action === "under_review") newStatus = "under_review";

    if (input.action === "reject" && !input.rejectionReason?.trim()) {
      throw new ValidationError("আবেদন প্রত্যাখ্যানের কারণ উল্লেখ করা আবশ্যক।");
    }

    if (input.action === "need_info" && !input.adminQuestion?.trim()) {
      throw new ValidationError("অতিরিক্ত তথ্যের প্রশ্নটি লিখুন।");
    }

    const updated = await businessMembershipApplicationRepository.update(input.applicationId, {
      status: newStatus,
      reviewedBy: input.adminId,
      reviewedAt: new Date(),
      reviewNotes: input.reviewNotes ?? app.reviewNotes,
      rejectionReason: input.action === "reject" ? input.rejectionReason : app.rejectionReason,
      adminQuestion: input.action === "need_info" ? input.adminQuestion : app.adminQuestion,
    });

    if (!updated) throw new NotFoundError("আবেদন আপডেট ব্যর্থ হয়েছে");

    const typeLabel = app.membershipType === "reseller" ? "রিসেলার" : "হোলসেলার";

    // If Approved, assign membership & update user record
    // If Approved, assign membership & update user record
    if (input.action === "approve") {
      await businessMembershipRepository.upsertMembership(
        app.userId,
        app.membershipType,
        input.adminId,
        "active",
      );

      // Add to user's memberships array via userRepository
      const existingUser = await this.userRepository.findById(app.userId);
      if (existingUser) {
        const memberships = Array.from(new Set([...(existingUser.memberships || []), app.membershipType]));
        await this.userRepository.update(app.userId, { memberships } as any);
      }

      // Auto-provision or activate Reseller profile entity
      if (app.membershipType === "reseller") {
        try {
          const resellerRepo = new ResellerRepository();
          const existingReseller = await resellerRepo.findByUserId(app.userId);
          if (!existingReseller) {
            const count = await resellerRepo.countAll({});
            const code = `RSL-${String(count + 1).padStart(4, "0")}`;
            await resellerRepo.create({
              businessName: app.commonFields.facebookPage || app.commonFields.fullName,
              ownerName: app.commonFields.fullName,
              email: app.userEmail || `${app.userPhone}@dropshop.internal`,
              phone: app.commonFields.phone,
              alternativePhone: app.commonFields.altPhone,
              address: {
                street: app.commonFields.fullAddress,
                upazila: app.commonFields.upazila,
                district: app.commonFields.district,
                country: "Bangladesh",
              },
              code,
              userId: app.userId,
              status: "active",
              nidVerified: false,
              tradeLicenseVerified: false,
              collections: [],
              tags: [],
              createdBy: input.adminId,
              updatedBy: input.adminId,
            } as any);
          } else {
            await resellerRepo.update(existingReseller.id, { status: "active" } as any);
          }
        } catch {
          // Non-blocking reseller profile provision failure
        }
      }

      // History Log for approval
      await businessMembershipHistoryRepository.create({
        userId: app.userId,
        applicationId: app.id,
        membershipType: app.membershipType,
        action: "approved",
        actorId: input.adminId,
        actorRole: input.adminRole,
        previousStatus,
        newStatus: "approved",
        note: input.reviewNotes || `${typeLabel} আবেদন অনুমোদন করা হয়েছে`,
      });

      await businessMembershipHistoryRepository.create({
        userId: app.userId,
        applicationId: app.id,
        membershipType: app.membershipType,
        action: "membership_assigned",
        actorId: input.adminId,
        actorRole: input.adminRole,
        newStatus: "active",
        note: `ব্যবহারকারীকে ${typeLabel} মেম্বারশিপ প্রদান করা হয়েছে`,
      });

      // Notify User
      try {
        await notificationService.notify({
          userId: app.userId,
          type: "membership.approved",
          title: `🎉 অভিনন্দন! ${typeLabel} মেম্বারশিপ অনুমোদিত`,
          body: `আপনার ${typeLabel} মেম্বারশিপ আবেদনটি অনুমোদিত হয়েছে। এখন আপনি সকল সুবিধা ব্যবহার করতে পারবেন।`,
          channels: ["in_app"],
        });
      } catch {
        // Non-blocking
      }
    } else if (input.action === "reject") {
      await businessMembershipHistoryRepository.create({
        userId: app.userId,
        applicationId: app.id,
        membershipType: app.membershipType,
        action: "rejected",
        actorId: input.adminId,
        actorRole: input.adminRole,
        previousStatus,
        newStatus: "rejected",
        note: input.rejectionReason,
      });

      try {
        await notificationService.notify({
          userId: app.userId,
          type: "membership.rejected",
          title: `${typeLabel} মেম্বারশিপ আবেদন অগ্রাহ্য করা হয়েছে`,
          body: `আপনার ${typeLabel} আবেদনটি অনুমোদন করা সম্ভব হয়নি। কারণ: ${input.rejectionReason}`,
          channels: ["in_app"],
        });
      } catch {
        // Non-blocking
      }
    } else if (input.action === "need_info") {
      await businessMembershipHistoryRepository.create({
        userId: app.userId,
        applicationId: app.id,
        membershipType: app.membershipType,
        action: "need_info_requested",
        actorId: input.adminId,
        actorRole: input.adminRole,
        previousStatus,
        newStatus: "need_info",
        note: input.adminQuestion,
      });

      try {
        await notificationService.notify({
          userId: app.userId,
          type: "membership.need_info",
          title: `${typeLabel} আবেদনে অতিরিক্ত তথ্য প্রয়োজন`,
          body: `এডমিন টিম আপনার আবেদনে তথ্য জানতে চেয়েছেন: ${input.adminQuestion}`,
          channels: ["in_app"],
        });
      } catch {
        // Non-blocking
      }
    } else {
      await businessMembershipHistoryRepository.create({
        userId: app.userId,
        applicationId: app.id,
        membershipType: app.membershipType,
        action: "review_started",
        actorId: input.adminId,
        actorRole: input.adminRole,
        previousStatus,
        newStatus: "under_review",
        note: "আবেদন পর্যালোচনা শুরু করা হয়েছে",
      });
    }

    return updated;
  }

  /**
   * Directly assign, remove, suspend, or restore user business memberships (Admin Manual Action)
   */
  public async adminManageUserMemberships(input: {
    targetUserId: string;
    memberships: string[];
    adminId: string;
    adminRole: string;
    actionNote?: string;
  }): Promise<{ userId: string; updatedMemberships: string[] }> {
    const user = await this.userRepository.findById(input.targetUserId);
    if (!user) {
      throw new NotFoundError("ব্যবহারকারীকে পাওয়া যায়নি");
    }

    const previousMemberships: string[] = user.memberships || ["customer"];
    const newMemberships = Array.from(
      new Set(input.memberships.length > 0 ? input.memberships : ["customer"]),
    );

    // Update User Document
    await this.userRepository.update(input.targetUserId, { memberships: newMemberships } as any);

    // Sync BusinessMembership DB Records
    for (const type of newMemberships) {
      await businessMembershipRepository.upsertMembership(
        input.targetUserId,
        type as any,
        input.adminId,
        "active",
      );
    }

    // Log History
    await businessMembershipHistoryRepository.create({
      userId: input.targetUserId,
      membershipType: newMemberships.join(", "),
      action: "membership_assigned",
      actorId: input.adminId,
      actorRole: input.adminRole,
      previousStatus: previousMemberships.join(", "),
      newStatus: newMemberships.join(", "),
      note: input.actionNote || "এডমিন কর্তৃক ম্যানুয়ালি মেম্বারশিপ আপডেট করা হয়েছে",
    });

    // Send Notification
    try {
      await notificationService.notify({
        userId: input.targetUserId,
        type: "membership.updated",
        title: "আপনার মেম্বারশিপ তালিকা আপডেট করা হয়েছে",
        body: `আপনার বর্তমান সক্রিয় মেম্বারশিপসমূহ: ${newMemberships.join(", ")}`,
        channels: ["in_app"],
      });
    } catch {
      // Non-blocking
    }

    return {
      userId: input.targetUserId,
      updatedMemberships: newMemberships,
    };
  }

  /**
   * Add internal review note to application
   */
  public async addApplicationNote(input: {
    applicationId: string;
    authorId: string;
    authorName: string;
    note: string;
    isInternal?: boolean;
  }) {
    return await applicationNotesRepository.create({
      applicationId: input.applicationId,
      authorId: input.authorId,
      authorName: input.authorName,
      note: input.note,
      isInternal: input.isInternal ?? true,
    });
  }

  /**
   * Fetch application notes
   */
  public async getApplicationNotes(applicationId: string) {
    return await applicationNotesRepository.findByApplication(applicationId);
  }

  /**
   * Fetch membership history for user
   */
  public async getUserMembershipHistory(userId: string) {
    return await businessMembershipHistoryRepository.findByUser(userId);
  }
}

export const businessMembershipService = new BusinessMembershipService();
