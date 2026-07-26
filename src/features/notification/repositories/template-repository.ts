import { BaseRepository } from "@/lib/database/generic-repository";
import { NotificationTemplateModel, type TemplateMongoDocument } from "./template-model";
import type { NotificationTemplate } from "../domain/notification-entity";
import type { NotificationCategory } from "../domain/notification-entity";
import type { NotificationChannelType } from "../domain/notification-entity";

function toDomain(doc: any): NotificationTemplate {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    key: doc.key,
    name: doc.name,
    category: doc.category as NotificationCategory,
    description: doc.description,
    channels: (doc.channels ?? []) as NotificationChannelType[],
    subject: doc.subject,
    emailBody: doc.emailBody,
    smsBody: doc.smsBody,
    inAppTitle: doc.inAppTitle,
    inAppBody: doc.inAppBody,
    pushTitle: doc.pushTitle,
    pushBody: doc.pushBody,
    defaultHref: doc.defaultHref,
    variables: doc.variables ?? [],
    isActive: doc.isActive !== false,
    locale: doc.locale ?? "en",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
  };
}

export class NotificationTemplateRepository extends BaseRepository<
  TemplateMongoDocument,
  NotificationTemplate
> {
  constructor() {
    super(NotificationTemplateModel as any, toDomain);
  }

  async findByKey(key: string): Promise<NotificationTemplate | null> {
    return this.findOne({ key, isDeleted: { $ne: true } });
  }

  async listActive(): Promise<NotificationTemplate[]> {
    return this.find({ isActive: true, isDeleted: { $ne: true } });
  }

  async listAll(): Promise<NotificationTemplate[]> {
    return this.find({ isDeleted: { $ne: true } });
  }
}

export default NotificationTemplateRepository;
