"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  listNotificationTemplatesAction,
  upsertNotificationTemplateAction,
} from "../actions/notification-actions";
import type { NotificationTemplate } from "../domain/notification-entity";

export function TemplatesManager(): React.ReactElement {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selected, setSelected] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listNotificationTemplatesAction();
    if (res.success && res.data) {
      const list = res.data as NotificationTemplate[];
      setTemplates(list);
      setSelected((prev) => prev ?? list[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (): Promise<void> => {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    const res = await upsertNotificationTemplateAction({
      key: selected.key,
      name: selected.name,
      category: selected.category,
      description: selected.description,
      channels: selected.channels,
      subject: selected.subject,
      emailBody: selected.emailBody,
      smsBody: selected.smsBody,
      inAppTitle: selected.inAppTitle,
      inAppBody: selected.inAppBody,
      pushTitle: selected.pushTitle,
      pushBody: selected.pushBody,
      defaultHref: selected.defaultHref,
      variables: selected.variables,
      isActive: selected.isActive,
      locale: selected.locale,
    });
    setSaving(false);
    setMessage(res.success ? "Template saved." : (res.error ?? "Save failed"));
    if (res.success) load();
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Email, SMS, in-app, and push templates with variable interpolation.
          </p>
        </div>
        <Button size="sm" onClick={save} disabled={saving || !selected} className="gap-1.5">
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save template
        </Button>
      </div>

      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {templates.map((t) => (
              <button
                key={t.id || t.key}
                type="button"
                onClick={() => setSelected(t)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected?.key === t.key
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                <span className="truncate font-medium">{t.name}</span>
                <Badge variant="outline" className="text-[10px]">
                  {t.key}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{selected.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Name</Label>
                <Input
                  value={selected.name}
                  onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>In-app title</Label>
                <Input
                  value={selected.inAppTitle}
                  onChange={(e) => setSelected({ ...selected, inAppTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>In-app body</Label>
                <Input
                  value={selected.inAppBody}
                  onChange={(e) => setSelected({ ...selected, inAppBody: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Email subject</Label>
                <Input
                  value={selected.subject ?? ""}
                  onChange={(e) => setSelected({ ...selected, subject: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Email body</Label>
                <Input
                  value={selected.emailBody ?? ""}
                  onChange={(e) => setSelected({ ...selected, emailBody: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>SMS body</Label>
                <Input
                  value={selected.smsBody ?? ""}
                  onChange={(e) => setSelected({ ...selected, smsBody: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Default href</Label>
                <Input
                  value={selected.defaultHref ?? ""}
                  onChange={(e) => setSelected({ ...selected, defaultHref: e.target.value })}
                />
              </div>
              <p className="md:col-span-2 text-xs text-muted-foreground">
                Variables: use {"{{name}}"} syntax. Available:{" "}
                {(selected.variables ?? []).join(", ") || "none"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
