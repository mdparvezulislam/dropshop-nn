import { TrustedDeviceRepository } from "../repositories/trusted-device-repository";
import { UserRepository } from "../repositories/user-repository";
import { SecurityEventService } from "./security-event-service";
import { AuditLogger } from "@/lib/audit-logger";
import { logger } from "@/lib/utils/logger";
import { createHash } from "crypto";
import { env } from "@/config/env";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import type { TrustedDevice, DeviceInfo } from "../domain/security-types";

export class DeviceService {
  private readonly trustedDeviceRepository: TrustedDeviceRepository;
  private readonly userRepository: UserRepository;
  private readonly securityEventService: SecurityEventService;

  constructor() {
    this.trustedDeviceRepository = new TrustedDeviceRepository();
    this.userRepository = new UserRepository();
    this.securityEventService = new SecurityEventService();
  }

  async recognizeDevice(
    userId: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<{ isNewDevice: boolean; device?: TrustedDevice }> {
    const deviceInfo = this.parseDeviceInfo(userAgent, ipAddress);
    const deviceId = this.generateDeviceFingerprint(userId, userAgent, ipAddress);

    const existing = await this.trustedDeviceRepository.findByUserIdAndDeviceId(userId, deviceId);

    if (existing) {
      await this.trustedDeviceRepository.updateLastUsed(existing.id);
      return { isNewDevice: false, device: existing };
    }

    // New device detected
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const device = await this.trustedDeviceRepository.create({
      userId,
      deviceId,
      deviceInfo: {
        type: deviceInfo.type,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        userAgent,
        ipAddress,
        location: deviceInfo.location,
      },
      isTrusted: env.AUTO_TRUST_DEVICES,
      lastUsedAt: new Date(),
      autoTrusted: env.AUTO_TRUST_DEVICES,
    } as never);

    await this.securityEventService.logEvent({
      userId,
      eventType: "new_device_detected",
      severity: "medium",
      title: "New Device Detected",
      description: `New device login detected: ${deviceInfo.browser} on ${deviceInfo.os}`,
      metadata: {
        deviceId,
        ipAddress,
        userAgent,
        autoTrusted: env.AUTO_TRUST_DEVICES,
      },
      ipAddress,
      userAgent,
      deviceInfo,
    });

    return { isNewDevice: true, device };
  }

  async getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
    return this.trustedDeviceRepository.findByUserId(userId);
  }

  async trustDevice(userId: string, deviceId: string): Promise<TrustedDevice> {
    const device = await this.trustedDeviceRepository.findByUserIdAndDeviceId(userId, deviceId);
    if (!device) throw new NotFoundError("Device not found");

    const updated = await this.trustedDeviceRepository.toggleTrust(userId, deviceId, true);

    await this.securityEventService.logEvent({
      userId,
      eventType: "device_trusted",
      severity: "low",
      title: "Device Trusted",
      description: `Device ${device.name || device.deviceId} was trusted`,
      metadata: { deviceId },
    });

    return updated;
  }

  async untrustDevice(userId: string, deviceId: string): Promise<TrustedDevice> {
    const device = await this.trustedDeviceRepository.findByUserIdAndDeviceId(userId, deviceId);
    if (!device) throw new NotFoundError("Device not found");

    const updated = await this.trustedDeviceRepository.toggleTrust(userId, deviceId, false);

    await this.securityEventService.logEvent({
      userId,
      eventType: "device_untrusted",
      severity: "medium",
      title: "Device Untrusted",
      description: `Device ${device.name || device.deviceId} was untrusted`,
      metadata: { deviceId },
    });

    return updated;
  }

  async removeTrustedDevice(userId: string, deviceId: string): Promise<void> {
    const device = await this.trustedDeviceRepository.findByUserIdAndDeviceId(userId, deviceId);
    if (!device) throw new NotFoundError("Device not found");

    await this.trustedDeviceRepository.delete(device.id);

    await this.securityEventService.logEvent({
      userId,
      eventType: "device_untrusted",
      severity: "low",
      title: "Device Removed",
      description: `Device ${device.name || device.deviceId} was removed from trusted devices`,
      metadata: { deviceId },
    });
  }

  async removeAllTrustedDevices(userId: string): Promise<number> {
    const devices = await this.trustedDeviceRepository.findByUserId(userId);
    let count = 0;

    for (const device of devices) {
      await this.trustedDeviceRepository.delete(device.id);
      count++;
    }

    await this.securityEventService.logEvent({
      userId,
      eventType: "device_untrusted",
      severity: "medium",
      title: "All Trusted Devices Removed",
      description: `All trusted devices were removed for user`,
      metadata: { count },
    });

    return count;
  }

  async renameDevice(userId: string, deviceId: string, name: string): Promise<TrustedDevice> {
    const device = await this.trustedDeviceRepository.findByUserIdAndDeviceId(userId, deviceId);
    if (!device) throw new NotFoundError("Device not found");

    const updated = await this.trustedDeviceRepository.update(device.id, {
      name,
    } as never);

    return updated;
  }

  async isDeviceTrusted(userId: string, userAgent: string, ipAddress: string): Promise<boolean> {
    const deviceId = this.generateDeviceFingerprint(userId, userAgent, ipAddress);
    const device = await this.trustedDeviceRepository.findByUserIdAndDeviceId(userId, deviceId);
    return device ? device.isTrusted : false;
  }

  async cleanupExpired(): Promise<number> {
    return this.trustedDeviceRepository.removeExpired();
  }

  private parseDeviceInfo(userAgent: string, ipAddress: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    // Detect device type
    let type: DeviceInfo["type"] = "unknown";
    if (/mobile|android|iphone|ipod|blackberry|opera mini/i.test(ua)) {
      type = "mobile";
    } else if (/tablet|ipad|playbook|kindle/i.test(ua)) {
      type = "tablet";
    } else if (ua) {
      type = "desktop";
    }

    // Detect OS
    let os: DeviceInfo["os"] = "unknown";
    if (ua.includes("windows")) os = "windows";
    else if (ua.includes("mac os")) os = "macos";
    else if (ua.includes("linux") && !ua.includes("android")) os = "linux";
    else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) os = "ios";
    else if (ua.includes("android")) os = "android";

    // Detect browser
    let browser: DeviceInfo["browser"] = "unknown";
    if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr") && !ua.includes("brave")) {
      browser = "chrome";
    } else if (ua.includes("firefox")) {
      browser = "firefox";
    } else if (ua.includes("safari") && !ua.includes("chrome")) {
      browser = "safari";
    } else if (ua.includes("edg")) {
      browser = "edge";
    } else if (ua.includes("opr") || ua.includes("opera")) {
      browser = "opera";
    }

    return {
      type,
      os,
      browser,
      userAgent,
      ipAddress,
      location: undefined, // Would require IP geolocation service
    };
  }

  private generateDeviceFingerprint(userId: string, userAgent: string, ipAddress: string): string {
    return createHash("sha256")
      .update(`${userId}:${userAgent}:${ipAddress}`)
      .digest("hex");
  }
}

export default DeviceService;
