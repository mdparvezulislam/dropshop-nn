import { NotificationRepository } from "@/features/notification/repositories/notification-repository";
import { NotificationTemplateRepository } from "@/features/notification/repositories/template-repository";
import { User } from "@/features/auth/domain/user-entity";
import { SeedLogger } from "../helpers/logger";

export async function seedNotifications(users: User[]): Promise<void> {
  const notifRepo = new NotificationRepository();
  const templateRepo = new NotificationTemplateRepository();

  // 1. Seed Templates
  const templates = [
    { key: "order_confirmed", name: "Order Confirmed Email", category: "order" as const, subject: "Order {{orderNumber}} Confirmed!", bodyText: "Your order {{orderNumber}} has been confirmed." },
    { key: "order_shipped", name: "Order Shipped SMS", category: "shipping" as const, subject: "Order {{orderNumber}} Shipped", bodyText: "Your Pathao tracking number is {{trackingNumber}}." },
    { key: "payout_processed", name: "Wallet Payout Processed", category: "finance" as const, subject: "Payout Processed", bodyText: "BDT {{amount}} has been sent to your bKash account." },
  ];

  for (const t of templates) {
    const existing = await templateRepo.findByKey(t.key);
    if (!existing) {
      await templateRepo.create({
        key: t.key,
        name: t.name,
        category: t.category,
        subject: t.subject,
        emailBody: t.bodyText,
        inAppTitle: t.name,
        inAppBody: t.bodyText,
        channels: ["in_app", "email"],
        variables: ["orderNumber", "trackingNumber", "amount"],
        isActive: true,
        locale: "en",
        status: "active",
      });
    }
  }

  // 2. Seed Notification Logs for Users
  let count = 0;
  for (let i = 0; i < Math.min(50, users.length); i++) {
    const user = users[i];
    await notifRepo.create({
      userId: user.id,
      recipientEmail: user.email,
      recipientPhone: user.phone,
      category: "order",
      type: "order_status",
      title: "Order Status Update",
      body: `Your order ORD-2026-${String(i + 1).padStart(5, "0")} has been updated to shipped.`,
      status: "delivered",
      channels: ["email", "sms"],
      attempts: [
        {
          id: `att_${i}`,
          channel: "email",
          status: "delivered",
          provider: "smtp",
          attemptedAt: new Date(),
        },
      ],
    });
    count++;
  }

  SeedLogger.success("Notification templates & logs seeded", templates.length + count);
}
