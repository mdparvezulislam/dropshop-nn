"use client";

import * as React from "react";
import { Bell, Check, CheckCheck, Filter, ShieldCheck, ShoppingCart, Wallet, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/workspace/section-header";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function ResellerNotificationsPage(): React.ReactElement {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "unread" | "orders" | "wallet">("all");

  const loadInbox = React.useCallback(async () => {
    setLoading(true);
    try {
      const { getNotificationInboxAction } = await import(
        "@/features/notification/actions/notification-actions"
      );
      const res = await getNotificationInboxAction({ limit: 30 });
      if (res.success && res.data) {
        const items = (res.data as any).items || (Array.isArray(res.data) ? res.data : []);
        setNotifications(
          items.map((item: any) => ({
            id: item.id || item._id,
            type: item.type || "system",
            title: item.title || "Notification",
            body: item.body || "",
            read: Boolean(item.readAt || item.read),
            createdAt: item.createdAt || new Date().toISOString(),
          })),
        );
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const handleMarkRead = async (id: string) => {
    try {
      const { markNotificationReadAction } = await import(
        "@/features/notification/actions/notification-actions"
      );
      const res = await markNotificationReadAction(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        toast.success("Notification marked as read");
      }
    } catch {
      toast.error("Failed to mark notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { markAllNotificationsReadAction } = await import(
        "@/features/notification/actions/notification-actions"
      );
      await markAllNotificationsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleEnableWebPush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Web Push is not supported in this browser.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Push notification permission denied.");
        return;
      }
      const { subscribeWebPushAction } = await import(
        "@/features/notification/actions/notification-actions"
      );
      const res = await subscribeWebPushAction({
        endpoint: `https://fcm.googleapis.com/fcm/send/demo_token_${Date.now()}`,
        keys: { p256dh: "demo_p256dh", auth: "demo_auth" },
        userAgent: navigator.userAgent,
      });
      if (res.success) {
        toast.success("Web Push notifications enabled for this device!");
      } else {
        toast.error(res.error || "Failed to enable Web Push");
      }
    } catch {
      toast.error("Failed to enable Web Push");
    }
  };

  const filteredItems = notifications.filter((item) => {
    if (filter === "unread") return !item.read;
    if (filter === "orders") return item.type.includes("order");
    if (filter === "wallet") return item.type.includes("wallet") || item.type.includes("withdraw");
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
            Reseller Communication Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
            Notifications &amp; Alerts
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
            Track order status updates, wallet credits, payout updates, and platform announcements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={handleEnableWebPush}
            variant="outline"
            size="sm"
            className="gap-1.5 font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          >
            <Bell className="w-4 h-4 text-amber-500" /> Enable Web Push
          </Button>
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            className="gap-1.5 font-bold"
          >
            <CheckCheck className="w-4 h-4 text-primary" /> Mark all read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "unread"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => setFilter("orders")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "orders"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Order Updates
        </button>
        <button
          onClick={() => setFilter("wallet")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "wallet"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Wallet &amp; Payouts
        </button>
      </div>

      {/* Notification List */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm font-semibold text-muted-foreground">
              Loading notifications...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-sm font-semibold text-muted-foreground space-y-2">
              <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p>No notifications found in this view.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredItems.map((item) => {
                const Icon = item.type.includes("order")
                  ? ShoppingCart
                  : item.type.includes("wallet") || item.type.includes("withdraw")
                    ? Wallet
                    : item.type.includes("membership")
                      ? ShieldCheck
                      : MessageSquare;

                return (
                  <div
                    key={item.id}
                    className={`flex items-start justify-between gap-4 p-4 transition-colors ${
                      item.read ? "bg-card" : "bg-primary/5 font-semibold"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 pt-0.5">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {!item.read && (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
