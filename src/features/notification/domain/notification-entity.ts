import type { BaseDBEntity } from "@/lib/database/types";
import type { NotificationChannel, NotificationPriority } from "@/lib/core/types";

export type NotificationCategory =
  | "commerce"
  | "order"
  | "payment"
  | "shipping"
  | "inventory"
  | "account"
  | "security"
  | "marketing"
  | "cms"
  | "blog"
  | "finance"
  | "supplier"
  | "system";

export type DeliveryStatus =
  | "queued"
  | "sending"
  | "delivered"
  | "failed"
  | "retrying"
  | "cancelled"
  | "expired"
  | "read"
  | "archived";

export type NotificationChannelType = NotificationChannel | "webhook";

export interface DeliveryAttempt {
  id: string;
  channel: NotificationChannelType;
  status: DeliveryStatus;
  provider?: string;
  providerMessageId?: string;
  error?: string;
  attemptedAt: Date;
  completedAt?: Date;
}

export interface NotificationMessage extends BaseDBEntity {
  userId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  category: NotificationCategory;
  type: string;
  title: string;
  body: string;
  channels: NotificationChannelType[];
  priority: NotificationPriority;
  status: DeliveryStatus;
  templateKey?: string;
  variables: Record<string, string | number | boolean | null>;
  data: Record<string, string | number | boolean | null>;
  href?: string;
  entityType?: string;
  entityId?: string;
  attempts: DeliveryAttempt[];
  scheduledAt?: Date | null;
  sentAt?: Date | null;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  expiresAt?: Date | null;
  retryCount: number;
  maxRetries: number;
  isRead: boolean;
  isArchived: boolean;
}

export interface NotificationTemplate extends BaseDBEntity {
  key: string;
  name: string;
  category: NotificationCategory;
  description?: string;
  channels: NotificationChannelType[];
  subject?: string;
  emailBody?: string;
  smsBody?: string;
  inAppTitle: string;
  inAppBody: string;
  pushTitle?: string;
  pushBody?: string;
  defaultHref?: string;
  variables: string[];
  isActive: boolean;
  locale: string;
}

export interface NotifyInput {
  userId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: string;
  category?: NotificationCategory;
  title?: string;
  body?: string;
  channels?: NotificationChannelType[];
  priority?: NotificationPriority;
  templateKey?: string;
  variables?: Record<string, string | number | boolean | null>;
  data?: Record<string, string | number | boolean | null>;
  href?: string;
  entityType?: string;
  entityId?: string;
  scheduledAt?: Date | string | null;
  maxRetries?: number;
  forceChannels?: boolean;
}

export const DEFAULT_TEMPLATES: Omit<NotificationTemplate, keyof BaseDBEntity | "id">[] = [
  {
    key: "order.created",
    name: "Order Created",
    category: "order",
    description: "Sent when a new order is placed",
    channels: ["in_app", "email"],
    subject: "Order {{orderNumber}} confirmed",
    emailBody:
      "Hi {{customerName}}, your order {{orderNumber}} for {{amount}} has been placed successfully.",
    smsBody: "Order {{orderNumber}} confirmed. Total {{amount}}.",
    inAppTitle: "Order confirmed",
    inAppBody: "Order {{orderNumber}} was placed successfully.",
    pushTitle: "Order confirmed",
    pushBody: "Order {{orderNumber}} placed.",
    defaultHref: "/account/orders",
    variables: ["customerName", "orderNumber", "amount"],
    isActive: true,
    locale: "en",
  },
  {
    key: "order.shipped",
    name: "Order Shipped",
    category: "shipping",
    description: "Sent when an order is shipped",
    channels: ["in_app", "email", "sms"],
    subject: "Order {{orderNumber}} is on the way",
    emailBody:
      "Hi {{customerName}}, order {{orderNumber}} has shipped. Tracking: {{trackingNumber}}.",
    smsBody: "Order {{orderNumber}} shipped. Track: {{trackingNumber}}",
    inAppTitle: "Order shipped",
    inAppBody: "Order {{orderNumber}} is on the way.",
    defaultHref: "/account/orders",
    variables: ["customerName", "orderNumber", "trackingNumber"],
    isActive: true,
    locale: "en",
  },
  {
    key: "order.cancelled",
    name: "Order Cancelled",
    category: "order",
    channels: ["in_app", "email"],
    subject: "Order {{orderNumber}} cancelled",
    emailBody: "Hi {{customerName}}, order {{orderNumber}} has been cancelled.",
    smsBody: "Order {{orderNumber}} cancelled.",
    inAppTitle: "Order cancelled",
    inAppBody: "Order {{orderNumber}} was cancelled.",
    defaultHref: "/account/orders",
    variables: ["customerName", "orderNumber"],
    isActive: true,
    locale: "en",
  },
  {
    key: "security.login",
    name: "Security Login Alert",
    category: "security",
    channels: ["in_app", "email"],
    subject: "New login to your account",
    emailBody: "A new login was detected on your NN Enterprise account.",
    inAppTitle: "New login detected",
    inAppBody: "We noticed a new sign-in to your account.",
    defaultHref: "/account/security",
    variables: [],
    isActive: true,
    locale: "en",
  },
  {
    key: "account.welcome",
    name: "Welcome",
    category: "account",
    channels: ["in_app", "email"],
    subject: "Welcome to NN Enterprise",
    emailBody: "Hi {{customerName}}, welcome to NN Enterprise.",
    inAppTitle: "Welcome to NN Enterprise",
    inAppBody: "Your account is ready. Start exploring products.",
    defaultHref: "/",
    variables: ["customerName"],
    isActive: true,
    locale: "en",
  },
  {
    key: "cms.published",
    name: "Content Published",
    category: "cms",
    channels: ["in_app"],
    inAppTitle: "Content published",
    inAppBody: "{{title}} is now live.",
    defaultHref: "/dashboard/content",
    variables: ["title"],
    isActive: true,
    locale: "en",
  },
  {
    key: "generic",
    name: "Generic Notification",
    category: "system",
    channels: ["in_app"],
    inAppTitle: "{{title}}",
    inAppBody: "{{body}}",
    variables: ["title", "body"],
    isActive: true,
    locale: "en",
  },
];
