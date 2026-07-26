"use client";

import { useState } from "react";
import { WorkflowList } from "@/features/automation/components/workflow-list";
import { WorkflowBuilder } from "@/features/automation/components/workflow-builder";
import type { WorkflowDefinition } from "@/features/automation/domain/automation-entity";

export default function WorkflowsPage() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selected, setSelected] = useState<WorkflowDefinition | null>(null);

  if (view === "create") {
    return <WorkflowBuilder onSaved={() => setView("list")} />;
  }

  if (view === "edit" && selected) {
    return (
      <WorkflowBuilder
        workflow={selected}
        onSaved={() => {
          setView("list");
          setSelected(null);
        }}
      />
    );
  }

  return (
    <WorkflowList
      onSelect={(w) => {
        setSelected(w);
        setView("edit");
      }}
      onNew={() => setView("create")}
    />
  );
}
