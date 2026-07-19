import { UserRepository } from "../repositories/user-repository";
import { RoleRepository } from "../repositories/role-repository";
import { User } from "../domain/user-entity";
import { hashPassword, comparePassword } from "@/shared/utils/hash";
import { ValidationError, UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly roleRepository: RoleRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
  }

  async register(data: {
    username: string;
    email: string;
    phone: string;
    fullName: string;
    password: string;
    role: string;
  }): Promise<User> {
    logger.info("AuthService: registering new user profile", {
      email: data.email,
      role: data.role,
    });

    const [existingEmail, existingPhone, existingUser] = await Promise.all([
      this.userRepository.findByEmail(data.email),
      this.userRepository.findByPhone(data.phone),
      this.userRepository.findByUsername(data.username),
    ]);

    const validationErrors: Record<string, string[]> = {};
    if (existingEmail) validationErrors["email"] = ["Email address is already in use"];
    if (existingPhone) validationErrors["phone"] = ["Phone number is already in use"];
    if (existingUser) validationErrors["username"] = ["Username is already in use"];

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError("Registration input validation failed", validationErrors);
    }

    const roleDoc = await this.roleRepository.findByName(data.role);
    if (!roleDoc) {
      throw new ValidationError("Invalid role specified", {
        role: ["The requested user role does not exist"],
      });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await this.userRepository.create({
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      fullName: data.fullName.trim(),
      passwordHash,
      role: data.role,
      status: "active",
      loginHistory: [],
    });

    return user;
  }

  async verifyCredentials(
    emailOrUsername: string,
    password: string,
    ipAddress = "127.0.0.1",
    userAgent = "unknown",
  ): Promise<Omit<User, "passwordHash">> {
    logger.info("AuthService: verifying user credentials", { emailOrUsername });

    const isEmail = emailOrUsername.includes("@");
    const user = isEmail
      ? await this.userRepository.findByEmail(emailOrUsername)
      : await this.userRepository.findByUsername(emailOrUsername);

    if (!user) {
      logger.warn("AuthService: user not found", { emailOrUsername });
      throw new UnauthorizedError("Invalid username or password");
    }

    if (user.status === "suspended") {
      logger.warn("AuthService: suspended account login attempt", { userId: user.id });
      throw new UnauthorizedError("Your account has been suspended. Please contact support.");
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);
    if (!passwordMatches) {
      logger.warn("AuthService: password mismatch", { userId: user.id });
      throw new UnauthorizedError("Invalid username or password");
    }

    this.userRepository.updateLoginHistory(user.id, ipAddress, userAgent).catch((err) => {
      logger.error("AuthService: failed to update login history", err, { userId: user.id });
    });

    const safeUser = { ...user } as any;
    delete safeUser.passwordHash;
    return safeUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    logger.info("AuthService: changing password for user", { userId });
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError("User profile not found");
    }

    const currentMatches = await comparePassword(currentPassword, user.passwordHash);
    if (!currentMatches) {
      throw new ValidationError("Incorrect current password", {
        currentPassword: ["Current password is incorrect"],
      });
    }

    const passwordHash = await hashPassword(newPassword);
    await this.userRepository.update(userId, { passwordHash });
    logger.info("AuthService: password updated successfully", { userId });
  }

  async updateProfile(
    userId: string,
    data: { fullName?: string; profileImage?: string },
  ): Promise<User> {
    logger.info("AuthService: updating user profile info", { userId });
    const updated = await this.userRepository.update(userId, data);
    return updated;
  }
}

export default AuthService;
