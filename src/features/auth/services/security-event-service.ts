import { SecurityEventRepository } from "../repositories/security-event-repository";
import { UserRepository } from "../repositories/user-repository";
import { logger } from "@/lib/utils/logger";
import { env } from "@/config/env";
import type {
  SecurityEvent,
  SecurityEventSeverity,
  SecurityEventType,
  DeviceInfo,
} from "../domain/security-types";

export class SecurityEventService {
  private readonly securityEventRepository: SecurityEventRepository;
  private readonly userRepository: UserRepository;

  constructor() {
    this.securityEventRepository = new SecurityEventRepository();
    this.userRepository = new UserRepository();
  }

  async logEvent(data: {
    userId?: string | null;
    eventType: SecurityEventType;
    severity: SecurityEventSeverity;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: Partial<DeviceInfo>;
  }): Promise<SecurityEvent> {
    try {
      const event = await this.securityEventRepository.create({
        userId: data.userId ?? null,
        eventType: data.eventType,
        severity: data.severity,
        title: data.title,
        description: data.description,
        metadata: data.metadata ?? {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceInfo: data.deviceInfo,
        resolved: false,
      } as never);

      logger.info("Security event logged", {
        eventType: data.eventType,
        severity: data.severity,
        userId: data.userId,
      });

      return event;
    } catch (error) {
      logger.error("SecurityEventService: failed to log event", error, {
        eventType: data.eventType,
      });
      throw error;
    }
  }

  async getEvents(filters?: {
    userId?: string;
    eventType?: string;
    severity?: string;
    resolved?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<SecurityEvent[]> {
    const filter: Record<string, unknown> = {};

    if (filters?.userId) filter.userId = filters.userId;
    if (filters?.eventType) filter.eventType = filters.eventType;
    if (filters?.severity) filter.severity = filters.severity;
    if (filters?.resolved !== undefined) filter.resolved = filters.resolved;

    if (filters?.dateFrom || filters?.dateTo) {
      filter.createdAt = {};
      if (filters.dateFrom) (filter.createdAt as Record<string, unknown>).$gte = filters.dateFrom;
      if (filters.dateTo) (filter.createdAt as Record<string, unknown>).$lte = filters.dateTo;
    }

    return this.securityEventRepository.find(filter);
  }

  async getRecentEvents(limit = 50): Promise<SecurityEvent[]> {
    return this.securityEventRepository.getRecentEvents(limit);
  }

  async getUnresolvedEvents(): Promise<SecurityEvent[]> {
    return this.securityEventRepository.findUnresolved();
  }

  async resolveEvent(id: string, resolvedBy: string, resolvedNotes?: string): Promise<SecurityEvent> {
    return this.securityEventRepository.resolveEvent(id, resolvedBy, resolvedNotes);
  }

  async getStats(): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byEventType: Record<string, number>;
    unresolved: number;
  }> {
    return this.securityEventRepository.getStats();
  }

  async getEventsForUser(userId: string, limit = 50): Promise<SecurityEvent[]> {
    return this.securityEventRepository.findByUserId(userId);
  }

  async detectSuspiciousActivity(userId: string): Promise<{
    hasSuspiciousActivity: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    const user = await this.userRepository.findById(userId);
    if (!user) return { hasSuspiciousActivity: false, reasons: [] };

    // Check for multiple concurrent sessions
    const { UserSessionModel } = await import("@/features/auth/repositories/user-session-model");
    const sessionCount = await UserSessionModel.countDocuments({
      userId: user.id,
      expiresAt: { $gt: new Date() },
    });
    if (sessionCount > 3) {
      reasons.push(`Multiple concurrent sessions (${sessionCount} active)`);
    }

    // Check for rapid failed logins
    if (user.failedLoginCount >= 3) {
      reasons.push(`Multiple failed login attempts (${user.failedLoginCount})`);
    }

    // Check for new device logins
    const recentEvents = await this.securityEventRepository.findByUserId(userId);
    const newDeviceEvents = recentEvents.filter(
      (e) => e.eventType === "new_device_detected" && e.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000),
    );
    if (newDeviceEvents.length > 2) {
      reasons.push(`Multiple new device detections (${newDeviceEvents.length} in 24h)`);
    }

    return {
      hasSuspiciousActivity: reasons.length > 0,
      reasons,
    };
  }

  async cleanupOldEvents(retentionDays?: number): Promise<number> {
    const days = retentionDays ?? env.SECURITY_EVENT_RETENTION_DAYS;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const oldEvents = await this.securityEventRepository.find({
      createdAt: { $lt: cutoff },
      resolved: true,
    });

    let deletedCount = 0;
    for (const event of oldEvents) {
      await this.securityEventRepository.delete(event.id);
      deletedCount++;
    }

    return deletedCount;
  }
}

export default SecurityEventService;
