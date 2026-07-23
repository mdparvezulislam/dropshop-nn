"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Loader2, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  getWorkflowsAction,
  enableWorkflowAction,
  disableWorkflowAction,
  deleteWorkflowAction,
  duplicateWorkflowAction,
} from "../actions/automation-actions";
import type { WorkflowDefinition } from "../domain/automation-entity";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  draft: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  archived: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const categoryColors: Record<string, string> = {
  notification: "bg-blue-500/10 text-blue-600",
  logistics: "bg-violet-500/10 text-violet-600",
  finance: "bg-emerald-500/10 text-emerald-600",
  inventory: "bg-orange-500/10 text-orange-600",
  order: "bg-cyan-500/10 text-cyan-600",
  analytics: "bg-purple-500/10 text-purple-600",
  communication: "bg-pink-500/10 text-pink-600",
  webhook: "bg-slate-500/10 text-slate-600",
  system: "bg-gray-500/10 text-gray-600",
  cms: "bg-indigo-500/10 text-indigo-600",
};

interface WorkflowListProps {
  onSelect?: (workflow: WorkflowDefinition) => void;
  onNew?: () => void;
}

export function WorkflowList({ onSelect, onNew }: WorkflowListProps): React.ReactElement {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getWorkflowsAction();
    if (res.success && res.data) setWorkflows(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? workflows.filter(
        (w) =>
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          w.key.toLowerCase().includes(search.toLowerCase())
      )
    : workflows;

  const handleToggle = async (w: WorkflowDefinition) => {
    if (w.status === "active") {
      await disableWorkflowAction(w.id);
    } else {
      await enableWorkflowAction(w.id);
    }
    load();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateWorkflowAction(id);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteWorkflowAction(id);
    load();
  };

  if (loading && workflows.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {onNew && (
          <Button size="sm" onClick={onNew} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Workflow
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {search ? "No workflows match your search" : "No workflows created yet"}
            </p>
            {onNew && !search && (
              <Button variant="outline" size="sm" onClick={onNew} className="mt-3 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Create your first workflow
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card
                className="cursor-pointer transition-all hover:border-primary/30"
                onClick={() => onSelect?.(w)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{w.name}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors[w.status] ?? ""}`}>
                        {w.status}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryColors[w.category] ?? ""}`}>
                        {w.category}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {w.key} &middot; v{w.version} &middot; Trigger: {w.trigger.type}
                      {w.totalRuns > 0 && ` · ${w.totalRuns} runs`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleToggle(w); }} title={w.status === "active" ? "Disable" : "Enable"}>
                      {w.status === "active" ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDuplicate(w.id); }} title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default WorkflowList;
