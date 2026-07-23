"use client";

import * as React from "react";
import { FileText, Upload, CheckCircle2, Clock, AlertTriangle, Building2, Shield, Award, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/workspace/section-header";

interface Document {
  id: string;
  type: string;
  label: string;
  status: "uploaded" | "pending" | "rejected" | "expired";
  fileName?: string;
  uploadedAt?: string;
  expiresAt?: string;
  icon: React.ElementType;
}

const DOCUMENT_TYPES: { type: string; label: string; required: boolean; icon: React.ElementType }[] = [
  { type: "trade_license", label: "Trade License", required: true, icon: Building2 },
  { type: "bin_vat", label: "BIN / VAT Certificate", required: true, icon: Shield },
  { type: "company_agreement", label: "Company Agreement", required: false, icon: FileText },
  { type: "product_certification", label: "Product Certifications", required: false, icon: Award },
  { type: "insurance", label: "Business Insurance", required: false, icon: Shield },
  { type: "bank_statement", label: "Bank Statement", required: false, icon: File },
];

const initialDocs: Document[] = DOCUMENT_TYPES.map((t) => ({
  id: t.type,
  type: t.type,
  label: t.label,
  status: "pending",
  icon: t.icon,
}));

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  uploaded: { label: "Uploaded", variant: "success" },
  pending: { label: "Not uploaded", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
  expired: { label: "Expired", variant: "warning" },
};

export default function SupplierDocumentsPage(): React.ReactElement {
  const [docs] = React.useState<Document[]>(initialDocs);

  const uploaded = docs.filter((d) => d.status === "uploaded").length;
  const required = DOCUMENT_TYPES.filter((d) => d.required).length;
  const requiredUploaded = docs.filter(
    (d) => d.status === "uploaded" && DOCUMENT_TYPES.find((t) => t.type === d.type)?.required,
  ).length;

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your business documents and certifications.
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{uploaded}</p>
              <p className="text-xs text-muted-foreground">Uploaded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2">
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{docs.length - uploaded}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{requiredUploaded}/{required}</p>
              <p className="text-xs text-muted-foreground">Required Done</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {docs.filter((d) => d.status === "rejected" || d.status === "expired").length}
              </p>
              <p className="text-xs text-muted-foreground">Issues</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionHeader
        title="Required Documents"
        description="These documents are required for supplier verification."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_TYPES.map((dt) => {
          const doc = docs.find((d) => d.type === dt.type);
          const status = doc?.status ?? "pending";
          const cfg = statusConfig[status];
          const Icon = dt.icon;

          return (
            <Card key={dt.type} className="relative">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{dt.label}</p>
                      {dt.required && (
                        <p className="text-[11px] text-destructive">Required</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>

                {doc?.fileName && (
                  <div className="rounded-md bg-muted/50 px-3 py-2">
                    <p className="truncate text-xs font-mono">{doc.fileName}</p>
                    {doc.uploadedAt && (
                      <p className="text-[11px] text-muted-foreground">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  {doc ? "Replace" : "Upload"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
