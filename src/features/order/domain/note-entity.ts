import { BaseDBEntity } from "@/lib/database/types";

export type NoteType = "internal" | "customer" | "courier";

export interface OrderNote extends BaseDBEntity {
  orderId: string;
  type: NoteType;
  content: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  isPinned?: boolean;
}

export const NOTE_TYPES: NoteType[] = ["internal", "customer", "courier"];

export default OrderNote;
