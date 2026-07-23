"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, FileText, Loader2, RefreshCw, ScrollText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDeliveryLogsAction,
  getNotificationStatusSummaryAction,
  sendNotificationAction,
} from "../actions/notification-actions";
import type { NotificationMessage } from "../domain/notification-entity";

export function NotificationsOverview(): React.ReactElement {
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [sumRes, logRes] = await Promise.all([
      getNotificationStatusSummaryAction(),
      getDeliveryLogsAction({ page: 1, limit: 10 }),
    ]);
    if (sumRes.success && sumRes.data) setSummary(sumRes.data);
    if (logRes.success && logRes.data) {
      const d = logRes.data as { items: NotificationMessage[] };
      setLogs(d.items ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSend = async (): Promise<void> => {
    setSending(true);
    setMessage(null);
    const res = await sendNotificationAction({
      userId,
      type: "generic",
      templateKey: "generic",
      title,
      body,
      variables: { title, body },
      channels: ["in_app", "email"],
      forceChannels: true,
    });
    setSending(false);
    setMessage(res.success ? "Notification queued and delivered." : res.error ?? "Send failed");
    if (res.success) {
      setTitle("");
      setBody("");
      load();
    }
  };

  const total = Object.values(summary).reduce((a, b) => a + b, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            One communication engine — templates, delivery, preferences, and inbox.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
          <Link href="/dashboard/notifications/templates">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Templates
            </Button>
          </Link>
          <Link href="/dashboard/notifications/logs">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ScrollText className="h-3.5 w-3.5" />
              Logs
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        {["queued", "delivered", "failed", "read"].map((key) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs capitalize text-muted-foreground">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary[key] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Send className="h-4 w-4" />
              Send test notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="uid">User ID</Label>
              <Input
                id="uid"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Recipient user id"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Body</Label>
              <Input id="body" value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            <Button
              size="sm"
              onClick={onSend}
              disabled={sending || !userId || !title}
              className="gap-1.5"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
              Send
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No deliveries yet.</p>
            ) : (
              <ul className="space-y-2">
                {logs.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-border/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {n.type} · {n.channels.join(", ")}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize">
                      {n.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
