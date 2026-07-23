"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/page-header";
import { Spinner } from "@/components/ui/spinner";

export interface SettingsPageShellProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void | Promise<void>;
  saveLabel?: string;
}

export function SettingsPageShell({
  title = "Settings",
  description = "Manage your account and preferences",
  children,
  onSave,
  saveLabel = "Save changes",
}: SettingsPageShellProps): React.ReactElement {
  const [saving, setSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      if (onSave) {
        await onSave();
      } else {
        await new Promise((r) => setTimeout(r, 600));
        toast.success("Settings saved");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      <PageHeader title={title} description={description} />
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">{children}</div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-1.5">
            {saving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
            {saveLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPageShell;
