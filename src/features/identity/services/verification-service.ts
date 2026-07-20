import crypto from "crypto";
import { UserRepository } from "@/features/auth/repositories/user-repository";
import { ValidationError, NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus";
import { IDENTITY_EVENTS } from "../domain/identity-events";

export class VerificationService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async sendEmailVerification(userId: string): Promise<void> {
    logger.info("VerificationService: sending email verification", { userId });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.emailVerifiedAt) {
      throw new ValidationError("Email is already verified");
    }

    const token = crypto.randomBytes(32).toString("hex");

    logger.info("VerificationService: email verification token generated", {
      userId,
      tokenPreview: token.substring(0, 8) + "...",
    });
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    logger.info("VerificationService: verifying email", { userId });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.emailVerifiedAt) {
      throw new ValidationError("Email is already verified");
    }

    await this.userRepository.update(userId, {
      emailVerifiedAt: new Date(),
    });

    await EventBus.publish(
      IDENTITY_EVENTS.EMAIL_VERIFIED,
      {
        userId,
        email: user.email,
      },
      { source: "verification-service" },
    );

    logger.info("VerificationService: email verified successfully", { userId });
  }

  async sendPhoneVerification(userId: string): Promise<void> {
    logger.info("VerificationService: sending phone verification", { userId });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.phoneVerifiedAt) {
      throw new ValidationError("Phone is already verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    logger.info("VerificationService: phone verification OTP generated", {
      userId,
      otp,
    });
  }

  async verifyPhone(userId: string, otp: string): Promise<void> {
    logger.info("VerificationService: verifying phone", { userId });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.phoneVerifiedAt) {
      throw new ValidationError("Phone is already verified");
    }

    await this.userRepository.update(userId, {
      phoneVerifiedAt: new Date(),
    });

    await EventBus.publish(
      IDENTITY_EVENTS.PHONE_VERIFIED,
      {
        userId,
        phone: user.phone,
      },
      { source: "verification-service" },
    );

    logger.info("VerificationService: phone verified successfully", { userId });
  }
}

export default VerificationService;
