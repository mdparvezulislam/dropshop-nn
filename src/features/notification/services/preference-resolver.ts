import { UserNotificationPreferenceRepository } from "@/features/identity/repositories/user-notification-preference-repository";
import type { NotificationCategory } from "../domain/notification-entity";
import type { NotificationChannelType } from "../domain/notification-entity";

export interface ResolvedChannels {
  channels: NotificationChannelType[];
  allowed: boolean;
  reason?: string;
}

/**
 * Maps notification category → preference flags on UserNotificationPreference.
 */
function categoryAllowed(
  category: NotificationCategory,
  prefs: {
    orderUpdates: boolean;
    marketingMessages: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  },
): boolean {
  switch (category) {
    case "order":
    case "payment":
    case "shipping":
    case "commerce":
      return prefs.orderUpdates;
    case "marketing":
    case "blog":
    case "cms":
      return prefs.marketingMessages || prefs.orderUpdates;
    case "security":
    case "account":
    case "system":
      return true;
    default:
      return true;
  }
}

function channelAllowed(
  channel: NotificationChannelType,
  prefs: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  },
): boolean {
  switch (channel) {
    case "email":
      return prefs.emailNotifications;
    case "sms":
      return prefs.smsNotifications;
    case "push":
      return prefs.pushNotifications;
    case "in_app":
      return true;
    default:
      return true;
  }
}

export class PreferenceResolver {
  private readonly prefsRepo = new UserNotificationPreferenceRepository();

  async resolveChannels(
    userId: string | undefined,
    category: NotificationCategory,
    requested: NotificationChannelType[],
    forceChannels = false,
  ): Promise<ResolvedChannels> {
    if (!userId) {
      return {
        channels: requested.filter((c) => c === "email" || c === "sms"),
        allowed: true,
      };
    }

    if (forceChannels) {
      return { channels: requested, allowed: true };
    }

    let prefs = await this.prefsRepo.findByUser(userId);
    if (!prefs) {
      prefs = {
        id: "",
        userId,
        orderUpdates: true,
        marketingMessages: false,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        status: "active",
      };
    }

    if (!categoryAllowed(category, prefs)) {
      // Security always delivers in-app at minimum
      if (category === "security" || category === "account") {
        return { channels: ["in_app"], allowed: true };
      }
      return {
        channels: [],
        allowed: false,
        reason: "Category disabled in user preferences",
      };
    }

    const channels = requested.filter((ch) => channelAllowed(ch, prefs!));
    if (channels.length === 0) {
      return {
        channels: ["in_app"],
        allowed: true,
        reason: "Fell back to in-app",
      };
    }

    return { channels, allowed: true };
  }
}

export default PreferenceResolver;
