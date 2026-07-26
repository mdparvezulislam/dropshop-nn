"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Loader2, Pause, Play, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  getSchedulesAction,
  createScheduleAction,
  disableScheduleAction,
  enableScheduleAction,
  getWorkflowsAction,
} from "../actions/automation-actions";
import type { ScheduledJob, WorkflowDefinition } from "../domain/automation-entity";

const cn = (...inputs: (string | undefined | null | false)[]): string =>
  inputs.filter(Boolean).join(" ");

export function ScheduleManager(): React.ReactElement {
  const [schedules, setSchedules] = useState<ScheduledJob[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cron, setCron] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [schedRes, wfRes] = await Promise.all([getSchedulesAction(), getWorkflowsAction()]);
    if (schedRes.success && schedRes.data) setSchedules(schedRes.data);
    if (wfRes.success && wfRes.data) setWorkflows(wfRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!name || !cron || !selectedWorkflowId) return;
    setSaving(true);
    await createScheduleAction({ workflowId: selectedWorkflowId, name, cron });
    setSaving(false);
    setOpen(false);
    setName("");
    setCron("");
    setSelectedWorkflowId("");
    load();
  };

  const handleToggle = async (job: ScheduledJob) => {
    if (job.enabled) {
      await disableScheduleAction(job.id);
    } else {
      await enableScheduleAction(job.id);
    }
    load();
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Scheduled Jobs</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Schedule
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 sm:w-96">
            <SheetHeader>
              <SheetTitle>Create Scheduled Job</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Daily stock report"
                />
              </div>
              <div className="space-y-2">
                <Label>Cron Expression</Label>
                <Input
                  value={cron}
                  onChange={(e) => setCron(e.target.value)}
                  placeholder="0 6 * * *"
                />
                <p className="text-xs text-muted-foreground">minute hour day month weekday</p>
              </div>
              <div className="space-y-2">
                <Label>Workflow</Label>
                <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreate}
                disabled={saving || !name || !cron || !selectedWorkflowId}
                className="w-full"
              >
                {saving ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No scheduled jobs</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {schedules.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{job.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          job.enabled
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-gray-500/10 text-gray-600",
                        )}
                      >
                        {job.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <code className="rounded bg-muted px-1 py-0.5 text-[10px]">{job.cron}</code>
                      {job.nextRunAt && ` · Next: ${new Date(job.nextRunAt).toLocaleString()}`}
                      {job.lastRunAt && ` · Last: ${new Date(job.lastRunAt).toLocaleString()}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggle(job)}
                  >
                    {job.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default ScheduleManager;
