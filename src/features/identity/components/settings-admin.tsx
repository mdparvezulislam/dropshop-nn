"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  getPlatformSettingsAction,
  updateFeatureFlagAction,
} from "../actions/admin-identity-actions";

interface FlagRow {
  key: string;
  name: string;
  description: string;
  state: string;
}

interface SettingRow {
  key: string;
  name: string;
  description: string;
  scope: string;
  value: unknown;
}

export function SettingsAdmin(): React.ReactElement {
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getPlatformSettingsAction();
    if (res.success && res.data) {
      setFlags(res.data.flags as FlagRow[]);
      setSettings(res.data.settings as SettingRow[]);
    } else toast.error(res.error ?? "Failed to load settings");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFlag = async (key: string, currentlyOn: boolean): Promise<void> => {
    setBusyKey(key);
    const res = await updateFeatureFlagAction({
      key,
      state: currentlyOn ? "off" : "on",
    });
    setBusyKey(null);
    if (res.success) {
      toast.success(`Flag ${key} ${currentlyOn ? "disabled" : "enabled"}`);
      load();
    } else toast.error(res.error ?? "Update failed");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">
            Feature flags and registered engine settings (in-memory registry).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Feature flags</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/40 p-0">
          {loading && flags.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : flags.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground">
              No flags registered yet (engine bootstrap may not have run).
            </p>
          ) : (
            flags.map((f) => {
              const on = f.state === "on" || f.state === "partial";
              return (
                <div
                  key={f.key}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.description}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/70">{f.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {f.state}
                    </Badge>
                    <Switch
                      checked={on}
                      disabled={busyKey === f.key}
                      onCheckedChange={() => toggleFlag(f.key, on)}
                      aria-label={`Toggle ${f.name}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Engine settings</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/40 p-0">
          {settings.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground">No settings registered.</p>
          ) : (
            settings.map((s) => (
              <div key={s.key} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/70">{s.key}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1 capitalize">
                    {s.scope}
                  </Badge>
                  <p className="font-mono text-xs">{String(s.value)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
