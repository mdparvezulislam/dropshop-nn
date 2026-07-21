"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Smartphone, Megaphone, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { updateNotificationPreferencesAction } from "@/features/identity/actions/account-actions";

interface NotificationPrefs {
  orderUpdates: boolean;
  marketingMessages: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

const PREF_ITEMS = [
  {
    key: "orderUpdates" as const,
    label: "Order Updates",
    description: "Receive updates about your orders, shipping, and delivery.",
    icon: Bell,
  },
  {
    key: "marketingMessages" as const,
    label: "Marketing Messages",
    description: "Receive promotions, discounts, and marketing offers.",
    icon: Megaphone,
  },
  {
    key: "emailNotifications" as const,
    label: "Email Notifications",
    description: "Receive notifications via email.",
    icon: Mail,
  },
  {
    key: "smsNotifications" as const,
    label: "SMS Notifications",
    description: "Receive notifications via SMS.",
    icon: MessageSquare,
  },
  {
    key: "pushNotifications" as const,
    label: "Push Notifications",
    description: "Receive push notifications on your device.",
    icon: Smartphone,
  },
];

export function NotificationsPageContent({ initialPrefs }: { initialPrefs: NotificationPrefs }) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await updateNotificationPreferencesAction(prefs);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Notification Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose which notifications you receive and how.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Notification Channels</CardTitle>
          <CardDescription className="text-xs">
            Toggle the types of notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {PREF_ITEMS.map((item) => {
            const Icon = item.icon;
            const value = prefs[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={value}
                  onClick={() => handleToggle(item.key)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    value ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      value ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Preferences saved.
          </span>
        )}
      </div>
    </motion.div>
  );
}
