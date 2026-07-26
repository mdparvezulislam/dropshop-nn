"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Download, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getReportsAction,
  generateReportAction,
  exportReportAction,
} from "../actions/analytics-actions";
import type { AnalyticsReport, ReportFrequency } from "../domain/analytics-entity";

export function ReportCenter(): React.ReactElement {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateTitle, setGenerateTitle] = useState("");
  const [generateType, setGenerateType] = useState<ReportFrequency>("daily");
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getReportsAction(filterType !== "all" ? { type: filterType } : undefined);
    if (res.success && res.data) {
      setReports(res.data as AnalyticsReport[]);
    }
    setLoading(false);
  }, [filterType]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    if (!generateTitle.trim()) return;
    setGenerating(true);
    await generateReportAction({
      title: generateTitle,
      type: generateType,
    });
    setGenerating(false);
    setShowGenerate(false);
    setGenerateTitle("");
    load();
  };

  const handleExport = async (reportId: string) => {
    const res = await exportReportAction({ reportId, format: "csv" });
    if (!res.success || !res.data) return;
    const { content, filename, mimeType } = res.data;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const frequencyColors: Record<string, "default" | "info" | "success" | "warning" | "muted"> = {
    daily: "info",
    weekly: "default",
    monthly: "success",
    quarterly: "warning",
    yearly: "muted",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Report Center</h1>
          <p className="text-sm text-muted-foreground">Generate and manage analytics reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Report Title</Label>
                  <Input
                    placeholder="Monthly Sales Report"
                    value={generateTitle}
                    onChange={(e) => setGenerateTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={generateType}
                    onValueChange={(v) => setGenerateType(v as ReportFrequency)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !generateTitle.trim()}
                  className="w-full gap-1.5"
                >
                  {generating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Generate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No reports generated yet</p>
            <p className="text-sm text-muted-foreground">
              Click Generate Report to create your first report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={frequencyColors[report.type] ?? "muted"} size="xs">
                        {report.type}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                      <span>{report.metrics?.length ?? 0} metrics</span>
                      <span>{report.charts?.length ?? 0} charts</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleExport(report.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default ReportCenter;
