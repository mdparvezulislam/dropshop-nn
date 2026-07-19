import { Document, ClientSession } from "mongoose";

export interface BaseDBEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  isDeleted: boolean;
  status: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export type BaseDocument = Document & Omit<BaseDBEntity, "id">;

export interface DatabaseQueryOptions {
  session?: ClientSession;
  lean?: boolean;
  showDeleted?: boolean;
}
