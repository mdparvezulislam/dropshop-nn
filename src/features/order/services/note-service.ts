import { OrderNoteRepository } from "../repositories/order-note-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { generateUUID } from "@/lib/utils/id-utils";
import type { OrderNote, NoteType } from "../domain/note-entity";
import type { CreateOrderNoteInput } from "../types/validation";

export class NoteService {
  private readonly noteRepository: OrderNoteRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.noteRepository = new OrderNoteRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async addNote(input: CreateOrderNoteInput, actor?: { id: string; name?: string; role?: string }): Promise<OrderNote> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) throw new NotFoundError("Order not found");

    const note = await this.noteRepository.create({
      orderId: input.orderId,
      type: input.type,
      content: input.content,
      isPinned: input.isPinned,
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role,
    } as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: input.orderId,
      eventType: "order.note_added",
      action: "order.note_added",
      summary: `${input.type.charAt(0).toUpperCase() + input.type.slice(1)} note added`,
      actor,
      metadata: { noteId: note.id, noteType: input.type },
    });

    return note;
  }

  async getNotesByOrder(orderId: string): Promise<OrderNote[]> {
    return this.noteRepository.findByOrder(orderId);
  }

  async getNotesByOrderAndType(orderId: string, type: NoteType): Promise<OrderNote[]> {
    return this.noteRepository.findByOrderAndType(orderId, type);
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.noteRepository.delete(noteId);
  }
}

export default NoteService;
