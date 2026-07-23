import { Schema, Query } from "mongoose";

export interface BaseFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  isDeleted: boolean;
  status: string;
  metadata?: Record<string, any>;
}

export const baseFieldsDefinition = {
  createdBy: { type: String, required: false },
  updatedBy: { type: String, required: false },
  deletedAt: { type: Date, default: null, required: false },
  isDeleted: { type: Boolean, default: false, index: true },
  status: { type: String, default: "active", index: true },
  metadata: { type: Map, of: Schema.Types.Mixed, required: false },
};

export const baseSchemaOptions = {
  timestamps: true, // Handles createdAt and updatedAt automatically
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

export function softDeletePlugin(schema: Schema) {
  (schema.query as any).isDeleted = function (this: any, showDeleted: boolean = true) {
    if (showDeleted) {
      return this;
    }
    return this.where({ isDeleted: { $ne: true } });
  };

  const excludeDeleted = function (this: Query<any, any>) {
    const options = this.getOptions();
    if (options.showDeleted === true) {
      return;
    }
    this.where({ isDeleted: { $ne: true } });
  };

  const findQueries = [
    "find",
    "findOne",
    "findOneAndUpdate",
    "updateOne",
    "updateMany",
    "countDocuments",
  ];

  for (const query of findQueries) {
    schema.pre(query as any, excludeDeleted);
  }
}
export default softDeletePlugin;
