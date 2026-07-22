import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { OrderNoteModel } from "./order-note-model";
import type { OrderNote, NoteType } from "../domain/note-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface OrderNoteDocument extends BaseDocument {
  orderId: string;
  type: string;
  content: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  isPinned?: boolean;
}

function toDomain(doc: any): OrderNote {
  return {
    id: doc.id ?? doc._id.toString(),
    orderId: doc.orderId,
    type: doc.type,
    content: doc.content,
    actorId: doc.actorId,
    actorName: doc.actorName,
    actorRole: doc.actorRole,
    isPinned: doc.isPinned ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
    metadata: doc.metadata,
  };
}

export class OrderNoteRepository extends BaseRepository<OrderNoteDocument, OrderNote> {
  constructor() {
    super(OrderNoteModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<OrderNote[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findByOrderAndType(orderId: string, type: NoteType): Promise<OrderNote[]> {
    return this.find({ orderId, type }, { sort: { createdAt: -1 } } as any);
  }
}

export default OrderNoteRepository;
