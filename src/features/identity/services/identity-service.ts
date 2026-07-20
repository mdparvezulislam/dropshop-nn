import { UserRepository } from "@/features/auth/repositories/user-repository";
import { RoleRepository } from "@/features/auth/repositories/role-repository";
import { hashPassword } from "@/shared/utils/hash";
import { ValidationError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus";
import { IDENTITY_EVENTS } from "../domain/identity-events";
import { BusinessProfileService } from "./business-profile-service";
import type { BusinessRegistrationInput, CustomerRegistrationInput } from "../types/validation";

export class IdentityService {
  private readonly userRepository: UserRepository;
  private readonly roleRepository: RoleRepository;
  private readonly businessProfileService: BusinessProfileService;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
    this.businessProfileService = new BusinessProfileService();
  }

  async registerCustomer(data: CustomerRegistrationInput) {
    logger.info("IdentityService: registering customer", { email: data.email });

    const [existingEmail, existingPhone] = await Promise.all([
      this.userRepository.findByEmail(data.email),
      this.userRepository.findByPhone(data.phone),
    ]);

    if (existingEmail) {
      throw new ValidationError("Email is already in use", {
        email: ["This email address is already registered"],
      });
    }
    if (existingPhone) {
      throw new ValidationError("Phone is already in use", {
        phone: ["This phone number is already registered"],
      });
    }

    const passwordHash = await hashPassword(data.password);

    const user = await this.userRepository.create({
      username: data.email.split("@")[0],
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      fullName: data.fullName.trim(),
      passwordHash,
      role: "customer",
      status: "active",
      loginHistory: [],
    });

    await EventBus.publish(
      IDENTITY_EVENTS.USER_REGISTERED,
      {
        userId: user.id,
        email: user.email,
        role: "customer",
        userType: "customer",
        registeredAt: new Date().toISOString(),
      },
      {
        source: "identity-service",
      },
    );

    logger.info("IdentityService: customer registered successfully", { userId: user.id });
    return user;
  }

  async registerBusiness(data: BusinessRegistrationInput) {
    logger.info("IdentityService: registering business user", {
      email: data.email,
      role: data.role,
    });

    const [existingEmail, existingPhone] = await Promise.all([
      this.userRepository.findByEmail(data.email),
      this.userRepository.findByPhone(data.phone),
    ]);

    if (existingEmail) {
      throw new ValidationError("Email is already in use", {
        email: ["This email address is already registered"],
      });
    }
    if (existingPhone) {
      throw new ValidationError("Phone is already in use", {
        phone: ["This phone number is already registered"],
      });
    }

    const roleDoc = await this.roleRepository.findByName(
      data.role.charAt(0).toUpperCase() + data.role.slice(1),
    );
    if (!roleDoc) {
      throw new ValidationError("Invalid role", {
        role: ["The requested business role does not exist"],
      });
    }

    const passwordHash = await hashPassword(data.password);

    const user = await this.userRepository.create({
      username: data.email.split("@")[0],
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      fullName: data.fullName.trim(),
      passwordHash,
      role: data.role,
      status: "active",
      loginHistory: [],
    });

    await EventBus.publish(
      IDENTITY_EVENTS.USER_REGISTERED,
      {
        userId: user.id,
        email: user.email,
        role: data.role,
        userType: data.role,
        registeredAt: new Date().toISOString(),
      },
      {
        source: "identity-service",
      },
    );

    const profile = await this.businessProfileService.create({
      userId: user.id,
      businessName: data.businessName,
      ownerName: data.ownerName,
      primaryPhone: data.primaryPhone,
      email: data.email,
      businessType: data.businessType,
      role: data.role,
      address: data.address,
    });

    logger.info("IdentityService: business user registered successfully", {
      userId: user.id,
      profileId: profile.id,
    });

    return { user, businessProfile: profile };
  }
}

export default IdentityService;
