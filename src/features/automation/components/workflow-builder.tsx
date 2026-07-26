"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { createWorkflowAction, updateWorkflowAction } from "../actions/automation-actions";
import type {
  WorkflowDefinition,
  WorkflowRule,
  WorkflowAction,
  RuleCondition,
  TriggerType,
  ActionType,
  TaskCategory,
  ConditionOperator,
} from "../domain/automation-entity";

const triggerOptions: { value: TriggerType; label: string }[] = [
  { value: "event", label: "Event Trigger" },
  { value: "schedule", label: "Schedule Trigger" },
  { value: "manual", label: "Manual Trigger" },
  { value: "webhook", label: "Webhook Trigger" },
  { value: "api", label: "API Trigger" },
];

const categoryOptions: { value: TaskCategory; label: string }[] = [
  { value: "notification", label: "Notification" },
  { value: "logistics", label: "Logistics" },
  { value: "finance", label: "Finance" },
  { value: "inventory", label: "Inventory" },
  { value: "order", label: "Order" },
  { value: "analytics", label: "Analytics" },
  { value: "communication", label: "Communication" },
  { value: "webhook", label: "Webhook" },
  { value: "system", label: "System" },
];

const actionOptions: { value: ActionType; label: string }[] = [
  { value: "send_notification", label: "Send Notification" },
  { value: "send_email", label: "Send Email" },
  { value: "send_sms", label: "Send SMS" },
  { value: "create_shipment", label: "Create Shipment" },
  { value: "update_order", label: "Update Order" },
  { value: "update_inventory", label: "Update Inventory" },
  { value: "create_wallet_transaction", label: "Wallet Transaction" },
  { value: "generate_invoice", label: "Generate Invoice" },
  { value: "generate_report", label: "Generate Report" },
  { value: "trigger_analytics_event", label: "Trigger Analytics" },
  { value: "execute_webhook", label: "Execute Webhook" },
  { value: "delay", label: "Delay" },
  { value: "stop_workflow", label: "Stop Workflow" },
];

const conditionOperators: { value: ConditionOperator; label: string }[] = [
  { value: "eq", label: "Equals" },
  { value: "neq", label: "Not Equals" },
  { value: "gt", label: "Greater Than" },
  { value: "gte", label: "Greater or Equal" },
  { value: "lt", label: "Less Than" },
  { value: "lte", label: "Less or Equal" },
  { value: "in", label: "In" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts With" },
  { value: "exists", label: "Exists" },
];

interface WorkflowBuilderProps {
  workflow?: WorkflowDefinition;
  onSaved?: (workflow: WorkflowDefinition) => void;
}

export function WorkflowBuilder({ workflow, onSaved }: WorkflowBuilderProps): React.ReactElement {
  const [name, setName] = useState(workflow?.name ?? "");
  const [key, setKey] = useState(workflow?.key ?? "");
  const [description, setDescription] = useState(workflow?.description ?? "");
  const [category, setCategory] = useState<TaskCategory>(workflow?.category ?? "notification");
  const [triggerType, setTriggerType] = useState<TriggerType>(workflow?.trigger.type ?? "event");
  const [eventType, setEventType] = useState(workflow?.trigger.eventType ?? "");
  const [cron, setCron] = useState(workflow?.trigger.cron ?? "");
  const [rules, setRules] = useState<WorkflowRule[]>(workflow?.rules ?? []);
  const [saving, setSaving] = useState(false);

  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const addRule = () => {
    const rule: WorkflowRule = {
      id: generateId(),
      name: `Rule ${rules.length + 1}`,
      conditions: [{ field: "event.type", operator: "eq", value: "", source: "event" }],
      logicalOperator: "and",
      actions: [
        { id: generateId(), type: "send_notification", config: {}, label: "Action 1", order: 0 },
      ],
      priority: rules.length,
    };
    setRules([...rules, rule]);
  };

  const updateRule = (ruleId: string, updates: Partial<WorkflowRule>) => {
    setRules(rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)));
  };

  const removeRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  const addCondition = (ruleId: string) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              conditions: [
                ...r.conditions,
                {
                  field: "",
                  operator: "eq" as ConditionOperator,
                  value: "",
                  source: "event" as const,
                },
              ],
            }
          : r,
      ),
    );
  };

  const updateCondition = (ruleId: string, condIndex: number, updates: Partial<RuleCondition>) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              conditions: r.conditions.map((c, i) => (i === condIndex ? { ...c, ...updates } : c)),
            }
          : r,
      ),
    );
  };

  const removeCondition = (ruleId: string, condIndex: number) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId ? { ...r, conditions: r.conditions.filter((_, i) => i !== condIndex) } : r,
      ),
    );
  };

  const addAction = (ruleId: string) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              actions: [
                ...r.actions,
                {
                  id: generateId(),
                  type: "send_notification" as ActionType,
                  config: {},
                  label: `Action ${r.actions.length + 1}`,
                  order: r.actions.length,
                },
              ],
            }
          : r,
      ),
    );
  };

  const updateAction = (ruleId: string, actionIndex: number, updates: Partial<WorkflowAction>) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              actions: r.actions.map((a, i) => (i === actionIndex ? { ...a, ...updates } : a)),
            }
          : r,
      ),
    );
  };

  const removeAction = (ruleId: string, actionIndex: number) => {
    setRules(
      rules.map((r) =>
        r.id === ruleId ? { ...r, actions: r.actions.filter((_, i) => i !== actionIndex) } : r,
      ),
    );
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    const payload: Record<string, unknown> = {
      name,
      key,
      description,
      category,
      trigger: { type: triggerType, eventType: eventType || undefined, cron: cron || undefined },
      rules,
      steps: [],
      tags: [],
    };

    let res;
    if (workflow) {
      res = await updateWorkflowAction(workflow.id, payload);
    } else {
      res = await createWorkflowAction(payload);
    }

    setSaving(false);
    if (res.success && res.data) {
      onSaved?.(res.data);
    }
  }, [name, key, description, category, triggerType, eventType, cron, rules, workflow, onSaved]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Workflow Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Workflow"
              />
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="my_workflow"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this workflow do?"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select value={triggerType} onValueChange={(v) => setTriggerType(v as TriggerType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {triggerType === "event" && (
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Input
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="order.created"
                />
              </div>
            )}
            {triggerType === "schedule" && (
              <div className="space-y-2">
                <Label>Cron Expression</Label>
                <Input
                  value={cron}
                  onChange={(e) => setCron(e.target.value)}
                  placeholder="0 */6 * * *"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold">Rules</CardTitle>
          <Button size="sm" variant="outline" onClick={addRule} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No rules defined. Add a rule to define when this workflow executes.
            </p>
          ) : (
            rules.map((rule, ri) => (
              <Card key={rule.id} className="border border-border/60">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        className="h-7 w-48 text-sm font-medium"
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                      />
                      <Badge variant="outline" className="text-[10px]">
                        Priority: {rule.priority}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-500"
                      onClick={() => removeRule(rule.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Conditions</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 gap-1 text-xs"
                        onClick={() => addCondition(rule.id)}
                      >
                        <Plus className="h-3 w-3" /> Add Condition
                      </Button>
                    </div>
                    {rule.conditions.map((cond, ci) => (
                      <div key={ci} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                        <span className="w-10 text-[10px] font-medium text-muted-foreground">
                          {ci === 0 ? "IF" : rule.logicalOperator === "or" ? "OR" : "AND"}
                        </span>
                        <Input
                          className="h-7 w-36 text-xs"
                          placeholder="field"
                          value={cond.field}
                          onChange={(e) => updateCondition(rule.id, ci, { field: e.target.value })}
                        />
                        <Select
                          value={cond.operator}
                          onValueChange={(v) =>
                            updateCondition(rule.id, ci, { operator: v as ConditionOperator })
                          }
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionOperators.map((op) => (
                              <SelectItem key={op.value} value={op.value} className="text-xs">
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="h-7 w-28 text-xs"
                          placeholder="value"
                          value={String(cond.value ?? "")}
                          onChange={(e) => updateCondition(rule.id, ci, { value: e.target.value })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-rose-500"
                          onClick={() => removeCondition(rule.id, ci)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Actions</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 gap-1 text-xs"
                        onClick={() => addAction(rule.id)}
                      >
                        <Plus className="h-3 w-3" /> Add Action
                      </Button>
                    </div>
                    {rule.actions.map((action, ai) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-2 rounded-lg bg-muted/50 p-2"
                      >
                        <ArrowDown className="h-3 w-3 text-muted-foreground" />
                        <Select
                          value={action.type}
                          onValueChange={(v) =>
                            updateAction(rule.id, ai, { type: v as ActionType })
                          }
                        >
                          <SelectTrigger className="h-7 w-44 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="h-7 w-36 text-xs"
                          placeholder="Label"
                          value={action.label}
                          onChange={(e) => updateAction(rule.id, ai, { label: e.target.value })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-rose-500"
                          onClick={() => removeAction(rule.id, ai)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={saving || !name || !key} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : workflow ? "Update Workflow" : "Create Workflow"}
        </Button>
      </div>
    </motion.div>
  );
}

export default WorkflowBuilder;
