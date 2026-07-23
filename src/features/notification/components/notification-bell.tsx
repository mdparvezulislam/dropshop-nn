"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotificationInboxAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "../actions/notification-actions";
import type { NotificationMessage } from "../domain/notification-entity";
import { cn } from "@/lib/utils/cn";

function timeAgo(date: Date | string): string {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell(): React.ReactElement {
  const [items, setItems] = useState<NotificationMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await getNotificationInboxAction({ page: 1, limit: 8 });
    if (res.success && res.data) {
      const data = res.data as {
        items: NotificationMessage[];
        unreadCount: number;
      };
      setItems(data.items ?? []);
      setUnread(data.unreadCount ?? 0);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const onRead = async (id: string): Promise<void> => {
    await markNotificationReadAction(id);
    await load();
  };

  const onMarkAll = async (): Promise<void> => {
    await markAllNotificationsReadAction();
    await load();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={onMarkAll}
              className="text-[11px] font-normal text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-2 py-6 text-center text-xs text-muted-foreground">
            No new notifications. You&apos;re all caught up.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex cursor-pointer flex-col items-start gap-0.5 py-2.5"
                onClick={() => {
                  if (!n.isRead) void onRead(n.id);
                  if (n.href) window.location.href = n.href;
                }}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm leading-snug",
                      !n.isRead && "font-semibold text-foreground",
                    )}
                  >
                    {n.title}
                  </span>
                  {!n.isRead && (
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
                <span className="text-[10px] text-muted-foreground/80">
                  {timeAgo(n.createdAt)}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="p-1">
          <Link
            href="/account/notifications"
            className="block rounded-md px-2 py-1.5 text-center text-xs text-primary hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Notification preferences
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
