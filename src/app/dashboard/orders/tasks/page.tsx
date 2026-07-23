"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listTasksAction,
  createTaskAction,
  updateTaskStatusAction,
} from "@/features/order/actions/task-actions";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Plus, Play, CheckCircle, XCircle } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/features/order/domain/task-entity";

const STATUS_OPTIONS: { value: TaskStatus | ""; label: string; en: string }[] = [
  { value: "", label: "সবগুলো", en: "All" },
  { value: "open", label: "ওপেন", en: "Open" },
  { value: "in_progress", label: "প্রগতিশীল", en: "In Progress" },
  { value: "completed", label: "সম্পন্ন", en: "Completed" },
  { value: "cancelled", label: "বাতিল", en: "Cancelled" },
];

const PRIORITY_OPTIONS: { value: TaskPriority | ""; label: string; en: string }[] = [
  { value: "", label: "সবগুলো", en: "All" },
  { value: "low", label: "লো", en: "Low" },
  { value: "normal", label: "নরমাল", en: "Normal" },
  { value: "high", label: "উচ্চ", en: "High" },
  { value: "urgent", label: "জরুরি", en: "Urgent" },
];

const STATUS_LABEL: Record<string, string> = {
  open: "ওপেন",
  in_progress: "প্রগতিশীল",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "লো",
  normal: "নরমাল",
  high: "উচ্চ",
  urgent: "জরুরি",
};

const PRIORITY_VARIANT: Record<string, "default" | "destructive" | "success" | "warning" | "outline"> = {
  low: "default",
  normal: "outline",
  high: "warning",
  urgent: "destructive",
};

export default function TasksPage(): React.ReactElement {
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("");
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const load = async () => {
    setLoading(true);
    const res = await listTasksAction(
      1, 50,
      (statusFilter || undefined) as TaskStatus,
      (priorityFilter || undefined) as TaskPriority,
    );
    if (res.success) setTasks(res.data?.items ?? []);
    setLoading(false);
  };

  React.useEffect(() => { load(); }, [statusFilter, priorityFilter]);

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    const res = await updateTaskStatusAction({ taskId, status });
    if (res.success) { toast.success("স্ট্যাটাস আপডেট হয়েছে"); load(); }
    else toast.error(res.error || "ব্যর্থ");
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const form = new FormData(e.currentTarget);
    const data = {
      orderId: form.get("orderId") as string,
      title: form.get("title") as string,
      priority: form.get("priority") as TaskPriority,
      assignedTo: form.get("assignedTo") as string,
      assignedToName: form.get("assignedToName") as string,
      dueDate: form.get("dueDate") as string || undefined,
      description: form.get("description") as string || undefined,
    };
    const res = await createTaskAction(data);
    if (res.success) { toast.success("টাস্ক তৈরি হয়েছে"); setShowCreateForm(false); load(); }
    else toast.error(res.error || "ব্যর্থ");
    setCreating(false);
  };

  const getStatusVariant = (status: string) => {
    if (status === "completed") return "success" as const;
    if (status === "cancelled") return "destructive" as const;
    if (status === "in_progress") return "default" as const;
    return "outline" as const;
  };

  const formatDate = (d: string | Date | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ইন্টারনাল টাস্ক</h1>
            <p className="text-sm text-muted-foreground">Internal Tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Task
          </Button>
          <Button variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">নতুন টাস্ক তৈরি</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
              <Input name="orderId" placeholder="Order ID" required className="h-9" />
              <Input name="title" placeholder="Task Title" required className="h-9 sm:col-span-2" />
              <select name="priority" required className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                <option value="normal">নরমাল (Normal)</option>
                <option value="low">লো (Low)</option>
                <option value="high">উচ্চ (High)</option>
                <option value="urgent">জরুরি (Urgent)</option>
              </select>
              <Input name="assignedTo" placeholder="Assignee ID" className="h-9" />
              <Input name="assignedToName" placeholder="Assignee Name" className="h-9" />
              <Input name="dueDate" type="date" className="h-9" />
              <Input name="description" placeholder="Description (optional)" className="h-9 sm:col-span-2" />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Task"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">টাস্ক</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">অর্ডার #</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">প্রায়োরিটি</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">স্ট্যাটাস</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">অ্যাসাইন করা হয়েছে</th>
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground">ডিউ ডেট</th>
                <th className="p-3 text-right text-xs font-semibold text-muted-foreground">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">কোনো তথ্য নেই</td></tr>
              ) : tasks.map((t: any) => (
                <tr key={t.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3 font-medium text-sm max-w-[200px] truncate">{t.title}</td>
                  <td className="p-3 text-sm">{t.orderNumber}</td>
                  <td className="p-3">
                    <Badge variant={PRIORITY_VARIANT[t.priority] ?? "default"}>
                      {PRIORITY_LABEL[t.priority] ?? t.priority}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusVariant(t.status)}>{STATUS_LABEL[t.status] ?? t.status}</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{t.assignedToName || t.assignedTo || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{formatDate(t.dueDate)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {t.status === "open" && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(t.id, "in_progress")}>
                          <Play className="h-3.5 w-3.5 mr-1" /> Start
                        </Button>
                      )}
                      {t.status === "in_progress" && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(t.id, "completed")}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Complete
                        </Button>
                      )}
                      {!["completed", "cancelled"].includes(t.status) && (
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(t.id, "cancelled")}>
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
