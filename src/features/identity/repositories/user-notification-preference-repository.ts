import { BaseRepository } from "@/shared/lib/database/generic-repository";
import {
  UserNotificationPreferenceModel,
  type NotificationPrefDocument,
} from "./user-notification-preference-model";
import type { UserNotificationPreference } from "../domain/user-notification-preference-entity";

export class UserNotificationPreferenceRepository extends BaseRepository<
  NotificationPrefDocument,
  UserNotificationPreference
> {
  constructor() {
    super(UserNotificationPreferenceModel, (doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      orderUpdates: doc.orderUpdates,
      marketingMessages: doc.marketingMessages,
      emailNotifications: doc.emailNotifications,
      smsNotifications: doc.smsNotifications,
      pushNotifications: doc.pushNotifications,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    }));
  }

  async findByUser(userId: string): Promise<UserNotificationPreference | null> {
    return this.findOne({ userId });
  }
}
export default UserNotificationPreferenceRepository;
