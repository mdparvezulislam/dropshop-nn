import mongoose, { Schema, Document } from "mongoose";
import { baseFieldsDefinition } from "@/lib/database/base-schema";
import type { ReviewStatus, QuestionStatus } from "../domain/review-entity";

export interface ReviewDocumentType extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId: string;
  orderId: string;
  orderNumber: string;
  variantSku?: string;
  authorName: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
  status: ReviewStatus;
  reply?: { body: string; repliedAt: Date; repliedBy?: string };
  moderatedAt?: Date;
  moderatedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

const { status: _reviewStatus, ...reviewBaseFields } = baseFieldsDefinition;

const reviewSchema = new Schema<ReviewDocumentType>(
  {
    ...reviewBaseFields,
    productId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    variantSku: { type: String, default: null },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: null, maxlength: 120 },
    body: { type: String, default: null, maxlength: 4000 },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["published", "pending", "rejected", "hidden"],
      default: "published",
      index: true,
    },
    reply: {
      type: new Schema(
        {
          body: { type: String, required: true },
          repliedAt: { type: Date, required: true },
          repliedBy: { type: String, default: null },
        },
        { _id: false },
      ),
      default: null,
    },
    moderatedAt: { type: Date, default: null },
    moderatedBy: { type: String, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true },
);

// One review per purchased order item — enforced by the database, not just code.
reviewSchema.index(
  { orderId: 1, productId: 1, variantSku: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);
// Published-review reads and the rating aggregation.
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

export const ReviewModel =
  mongoose.models.ProductReview ||
  mongoose.model<ReviewDocumentType>("ProductReview", reviewSchema);

export interface ProductQuestionDocumentType extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId: string;
  authorName: string;
  body: string;
  status: QuestionStatus;
  answer?: { body: string; answeredAt: Date; answeredBy?: string; answeredByName?: string };
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

const { status: _questionStatus, ...questionBaseFields } = baseFieldsDefinition;

const productQuestionSchema = new Schema<ProductQuestionDocumentType>(
  {
    ...questionBaseFields,
    productId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    body: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["published", "pending", "rejected"],
      default: "pending",
      index: true,
    },
    answer: {
      type: new Schema(
        {
          body: { type: String, required: true },
          answeredAt: { type: Date, required: true },
          answeredBy: { type: String, default: null },
          answeredByName: { type: String, default: null },
        },
        { _id: false },
      ),
      default: null,
    },
  },
  { timestamps: true },
);

productQuestionSchema.index({ productId: 1, status: 1, createdAt: -1 });

export const ProductQuestionModel =
  mongoose.models.ProductQuestion ||
  mongoose.model<ProductQuestionDocumentType>("ProductQuestion", productQuestionSchema);
