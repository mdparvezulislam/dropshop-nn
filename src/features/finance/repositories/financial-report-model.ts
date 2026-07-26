import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const financialReportSchema = new Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "pnl_summary",
        "revenue_analysis",
        "daily_report",
        "weekly_report",
        "monthly_report",
        "settlement_report",
        "ledger_report",
        "wallet_report",
        "adjustment_report",
      ],
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    summaryData: { type: Schema.Types.Mixed, required: true },
    format: { type: String, enum: ["csv", "excel", "pdf", "json"], default: "csv" },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "financial_reports" },
);

financialReportSchema.index({ type: 1, createdAt: -1 });

export const FinancialReportModel =
  mongoose.models.FinancialReport || mongoose.model("FinancialReport", financialReportSchema);
export default FinancialReportModel;
