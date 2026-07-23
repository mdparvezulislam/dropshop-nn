import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

const navItemSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    href: { type: String, required: true },
    icon: { type: String },
    openInNewTab: { type: Boolean, default: false },
    roles: [{ type: String }],
    children: [{ type: Schema.Types.Mixed }],
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false },
);

const { status: _, ...baseFields } = baseFieldsDefinition;

const navigationSchema = new Schema(
  {
    name: { type: String, required: true },
    location: {
      type: String,
      enum: ["header", "footer", "sidebar", "mega_menu"],
      required: true,
      index: true,
    },
    items: { type: [navItemSchema], default: [] },
    isActive: { type: Boolean, default: true },
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "cms_navigations" },
);

navigationSchema.index({ location: 1, isActive: 1 });
navigationSchema.plugin(softDeletePlugin);

export type NavigationMongoDocument = BaseDocument & {
  name: string;
  location: string;
  items: unknown[];
  isActive: boolean;
};

export const NavigationMenuModel =
  mongoose.models.CmsNavigationMenu ||
  mongoose.model<NavigationMongoDocument>("CmsNavigationMenu", navigationSchema);

export default NavigationMenuModel;
