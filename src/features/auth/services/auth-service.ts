import { UserRepository } from "../repositories/user-repository";
import { RoleRepository } from "../repositories/role-repository";
import { User } from "../domain/user-entity";
import { hashPassword, comparePassword } from "@/lib/utils/hash";
import { ValidationError, UnauthorizedError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

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
    const cleanUsername = data.username.toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanPhone = data.phone.trim();

    logger.info("AuthService: registering new user profile", {
      email: cleanEmail,
      username: cleanUsername,
      role: data.role,
    });

    const [existingEmail, existingPhone, existingUser] = await Promise.all([
      this.userRepository.findByEmail(cleanEmail),
      this.userRepository.findByPhone(cleanPhone),
      this.userRepository.findByUsername(cleanUsername),
    ]);

    const validationErrors: Record<string, string[]> = {};
    if (existingEmail) validationErrors["email"] = ["Email address is already in use"];
    if (existingPhone) validationErrors["phone"] = ["Phone number is already in use"];
    if (existingUser) validationErrors["username"] = ["Username is already in use"];

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError("Registration input validation failed", validationErrors);
    }

    let roleDoc = await this.roleRepository.findByName(data.role);
    if (!roleDoc) {
      logger.info("AuthService: auto-creating missing role during registration", { role: data.role });
      roleDoc = await this.roleRepository.create({
        name: data.role,
        description: `Role for ${data.role}`,
        permissions: data.role === "Super Admin" ? ["*"] : [`${data.role.replace(/\s+/g, "")}.Access`],
        status: "active",
      });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await this.userRepository.create({
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      fullName: data.fullName.trim(),
      passwordHash,
      role: data.role,
      status: "active",
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      loginHistory: [],
    });

    logger.info("AuthService: registered user profile successfully", { userId: user.id, email: user.email });
    return user;
  }

  async verifyCredentials(
    emailOrUsername: string,
    password: string,
    ipAddress = "127.0.0.1",
    userAgent = "unknown",
  ): Promise<Omit<User, "passwordHash">> {
    const rawInput = (emailOrUsername || "").trim();
    const normalizedInput = rawInput.toLowerCase();
    logger.info("AuthService: verifying user credentials", { rawInput });

    let user: User | null = null;
    if (rawInput.includes("@")) {
      user = await this.userRepository.findByEmail(normalizedInput);
    } else {
      user = await this.userRepository.findByUsername(normalizedInput);
      if (!user) {
        user = await this.userRepository.findByPhone(rawInput);
      }
    }

    if (!user) {
      user =
        (await this.userRepository.findByEmail(rawInput)) ||
        (await this.userRepository.findByUsername(rawInput)) ||
        (await this.userRepository.findByPhone(rawInput));
    }

    if (!user) {
      logger.warn("AuthService: user not found", { rawInput });
      throw new UnauthorizedError("Invalid username, email or password");
    }

    if (user.status === "suspended") {
      logger.warn("AuthService: suspended account login attempt", { userId: user.id });
      throw new UnauthorizedError("Your account has been suspended. Please contact support.");
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);
    if (!passwordMatches) {
      logger.warn("AuthService: password mismatch", { userId: user.id, email: user.email });
      throw new UnauthorizedError("Invalid username, email or password");
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
