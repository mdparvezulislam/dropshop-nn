import { BaseRepository } from "@/lib/database/generic-repository";
import { ApplicationNotesModel } from "./application-notes-model";

function toDomain(doc: any) {
  return {
    id: doc.id ?? doc._id.toString(),
    applicationId: doc.applicationId,
    authorId: doc.authorId,
    authorName: doc.authorName,
    authorRole: doc.authorRole,
    note: doc.note,
    isInternalOnly: doc.isInternalOnly,
    createdAt: doc.createdAt,
  };
}

export class ApplicationNotesRepository extends BaseRepository<any, any> {
  constructor() {
    super(ApplicationNotesModel as any, toDomain);
  }

  async findByApplication(applicationId: string): Promise<any[]> {
    return this.find({ applicationId }, { sort: { createdAt: 1 } } as any);
  }
}

export const applicationNotesRepository = new ApplicationNotesRepository();
