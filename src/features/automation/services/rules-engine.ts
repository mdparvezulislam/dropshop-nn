import type {
  RuleCondition,
  WorkflowRule,
  WorkflowAction,
  LogicalOperator,
} from "../domain/automation-entity";

export interface ConditionContext {
  event: Record<string, unknown>;
  payload: Record<string, unknown>;
  context: Record<string, unknown>;
  system: Record<string, unknown>;
}

function evaluateCondition(condition: RuleCondition, ctx: ConditionContext): boolean {
  const sourceData = ctx[condition.source] ?? {};
  const actualValue = resolveNestedValue(sourceData, condition.field);

  switch (condition.operator) {
    case "eq":
      return actualValue === condition.value;
    case "neq":
      return actualValue !== condition.value;
    case "gt":
      return Number(actualValue) > Number(condition.value);
    case "gte":
      return Number(actualValue) >= Number(condition.value);
    case "lt":
      return Number(actualValue) < Number(condition.value);
    case "lte":
      return Number(actualValue) <= Number(condition.value);
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(actualValue);
    case "nin":
      return Array.isArray(condition.value) && !condition.value.includes(actualValue);
    case "contains":
      return String(actualValue).includes(String(condition.value));
    case "startsWith":
      return String(actualValue).startsWith(String(condition.value));
    case "endsWith":
      return String(actualValue).endsWith(String(condition.value));
    case "exists":
      return actualValue !== undefined && actualValue !== null;
    case "regex":
      try {
        return new RegExp(String(condition.value)).test(String(actualValue));
      } catch {
        return false;
      }
    default:
      return false;
  }
}

function resolveNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function evaluateLogicalGroup(
  conditions: RuleCondition[],
  logicalOperator: LogicalOperator,
  ctx: ConditionContext,
): boolean {
  const results = conditions.map((c) => evaluateCondition(c, ctx));

  switch (logicalOperator) {
    case "and":
      return results.every(Boolean);
    case "or":
      return results.some(Boolean);
    case "not":
      return !results.some(Boolean);
    default:
      return results.every(Boolean);
  }
}

export interface RulesEngineResult {
  matched: boolean;
  matchedActions: WorkflowAction[];
  matchedRuleName?: string;
}

export function evaluateRules(rules: WorkflowRule[], ctx: ConditionContext): RulesEngineResult {
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    const matched = evaluateLogicalGroup(rule.conditions, rule.logicalOperator, ctx);
    if (matched) {
      return {
        matched: true,
        matchedActions: rule.actions.sort((a, b) => a.order - b.order),
        matchedRuleName: rule.name,
      };
    }
  }

  return { matched: false, matchedActions: [] };
}

export function evaluateAllRules(
  rules: WorkflowRule[],
  ctx: ConditionContext,
): RulesEngineResult[] {
  return rules
    .sort((a, b) => a.priority - b.priority)
    .map((rule) => ({
      rule,
      matched: evaluateLogicalGroup(rule.conditions, rule.logicalOperator, ctx),
    }))
    .map(({ rule, matched }) => ({
      matched,
      matchedActions: matched ? rule.actions.sort((a, b) => a.order - b.order) : [],
      matchedRuleName: rule.name,
    }));
}
