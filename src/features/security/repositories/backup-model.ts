import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBackupJobDocument extends Document {
  name: string;
  type: "full" | "database" | "media" | "config" | "logs";
  status: "completed" | "in_progress" | "failed" | "restored";
  sizeBytes: number;
  components: string[];
  notes?: string;
  storageLocation: string;
  verified: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BackupJobSchema = new Schema<IBackupJobDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["full", "database", "media", "config", "logs"],
      default: "full",
      index: true,
    },
    status: {
      type: String,
      enum: ["completed", "in_progress", "failed", "restored"],
      default: "completed",
      index: true,
    },
    sizeBytes: { type: Number, default: 0 },
    components: [{ type: String }],
    notes: { type: String },
    storageLocation: { type: String, default: "local_storage" },
    verified: { type: Boolean, default: true },
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

BackupJobSchema.index({ createdAt: -1 });

export const BackupJobModel: Model<IBackupJobDocument> =
  mongoose.models.BackupJob || mongoose.model<IBackupJobDocument>("BackupJob", BackupJobSchema);
