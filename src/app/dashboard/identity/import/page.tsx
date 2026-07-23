"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportUsersCsvAction, importUsersCsvAction } from "@/features/identity/actions/identity-center-actions";
import { toast } from "sonner";
import { ArrowLeft, Download, Upload, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function ImportExportPage(): React.ReactElement {
  const [role, setRole] = React.useState("");
  const [csvText, setCsvText] = React.useState("");
  const [importResult, setImportResult] = React.useState<any>(null);
  const [importing, setImporting] = React.useState(false);

  const handleExport = async () => {
    const res = await exportUsersCsvAction(role || undefined);
    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "users-export.csv"; a.click();
      URL.revokeObjectURL(url);
      toast.success("এক্সপোর্ট সম্পন্ন");
    } else toast.error(res.error ?? "এক্সপোর্ট ব্যর্থ");
  };

  const handleImport = async () => {
    if (!csvText.trim()) { toast.error("CSV ডেটা দিন"); return; }
    setImporting(true);
    const res = await importUsersCsvAction(csvText);
    if (res.success && res.data) {
      setImportResult(res.data);
      toast.success(`${res.data.imported} জন ইম্পোর্ট হয়েছে`);
    } else toast.error(res.error ?? "ইম্পোর্ট ব্যর্থ");
    setImporting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCsvText(ev.target?.result as string); };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/identity" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">ইম্পোর্ট / এক্সপোর্ট</h1>
          <p className="text-sm text-muted-foreground">User Import & Export</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/50 bg-card">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Download className="h-4 w-4" /> এক্সপোর্ট</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">রোল ফিল্টার (ঐচ্ছিক)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                <option value="">সব রোল</option>
                <option value="customer">Customer</option>
                <option value="reseller">Reseller</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button className="w-full" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> CSV এক্সপোর্ট</Button>
            <div className="p-3 rounded-lg bg-muted/20 text-xs text-muted-foreground">
              <p>কলাম: Name, Email, Phone, Role, Status, Created At</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Upload className="h-4 w-4" /> ইম্পোর্ট</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <label className="cursor-pointer">
                <span className="text-sm text-primary font-medium">CSV ফাইল আপলোড করুন</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
              <p className="text-[10px] text-muted-foreground mt-1">অথবা নিচে পেস্ট করুন</p>
            </div>
            <textarea
              placeholder="Name,Email,Phone,Role,Status&#10;John Doe,john@example.com,01700000000,customer,active"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-background p-2 text-xs font-mono"
            />
            <Button className="w-full" onClick={handleImport} disabled={importing}>
              {importing ? "ইম্পোর্ট হচ্ছে..." : "ইম্পোর্ট করুন"}
            </Button>
            <div className="p-3 rounded-lg bg-muted/20 text-xs text-muted-foreground">
              <p>প্রত্যাশিত ফরম্যাট: Name, Email, Phone, Role (ঐচ্ছিক), Status (ঐচ্ছিক)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {importResult && (
        <Card className="border-border/50 bg-card">
          <CardHeader><CardTitle className="text-sm">ইম্পোর্ট ফলাফল</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Imported</p>
                <p className="text-lg font-bold text-emerald-400">{importResult.imported}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Skipped</p>
                <p className="text-lg font-bold text-amber-400">{importResult.skipped}</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-500/10 text-center">
                <XCircle className="h-5 w-5 text-rose-400 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Errors</p>
                <p className="text-lg font-bold text-rose-400">{importResult.errors?.length ?? 0}</p>
              </div>
            </div>
            {importResult.duplicates?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">ডুপ্লিকেট ইমেইল:</p>
                {importResult.duplicates.map((d: any, i: number) => (
                  <Badge key={i} variant="warning" className="text-[10px] mr-1">Row {d.row}: {d.email}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
