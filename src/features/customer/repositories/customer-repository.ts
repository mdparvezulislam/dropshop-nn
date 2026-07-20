import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { CustomerModel } from "./customer-model";
import type { Customer } from "../domain/customer-entity";
import type { DatabaseQueryOptions } from "@/shared/lib/database/types";

export class CustomerRepository extends BaseRepository<any, Customer> {
  constructor() {
    super(CustomerModel, (doc) => ({
      id: doc.id,
      workspaceId: doc.workspaceId,
      name: doc.name,
      phone: doc.phone,
      alternativePhone: doc.alternativePhone,
      email: doc.email,
      gender: doc.gender,
      birthDate: doc.birthDate,
      profileImage: doc.profileImage,
      status: doc.status,
      source: doc.source,
      addresses: doc.addresses ? doc.addresses.map((a: any) => ({
        id: a.id,
        type: a.type,
        division: a.division,
        district: a.district,
        upazila: a.upazila,
        area: a.area,
        postalCode: a.postalCode,
        landmark: a.landmark,
        isDefault: a.isDefault,
      })) : [],
      notes: doc.notes ? doc.notes.map((n: any) => ({
        id: n.id,
        note: n.note,
        authorId: n.authorId,
        createdAt: n.createdAt,
        isPrivate: n.isPrivate,
      })) : [],
      tags: doc.tags || [],
      timeline: doc.timeline ? doc.timeline.map((t: any) => ({
        eventType: t.eventType,
        timestamp: t.timestamp,
        message: t.message,
        actorId: t.actorId,
      })) : [],
      statistics: doc.statistics ? {
        totalOrders: doc.statistics.totalOrders || 0,
        completedOrders: doc.statistics.completedOrders || 0,
        cancelledOrders: doc.statistics.cancelledOrders || 0,
        totalSpend: doc.statistics.totalSpend || 0,
        averageOrderValue: doc.statistics.averageOrderValue || 0,
        lastOrderDate: doc.statistics.lastOrderDate,
      } : {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalSpend: 0,
        averageOrderValue: 0,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata) : undefined,
    }));
  }

  async findByPhone(phone: string, workspaceId: string, options?: DatabaseQueryOptions): Promise<Customer | null> {
    return this.findOne({ phone, workspaceId }, options);
  }

  async findByEmail(email: string, workspaceId: string, options?: DatabaseQueryOptions): Promise<Customer | null> {
    return this.findOne({ email, workspaceId }, options);
  }
}
export default CustomerRepository;
