"use server";

import { registrationSchema, type RegistrationInput } from "../types/validation";
import { AuthService } from "../services/auth-service";
import { DatabaseConnectionManager } from "@/lib/database/connection-manager";
import { logger } from "@/lib/utils/logger";
import { AppError, ValidationError } from "@/lib/errors/app-error";

export async function registerUserAction(input: RegistrationInput) {
  try {
    const validated = registrationSchema.parse(input);
    await DatabaseConnectionManager.connect();

    const authService = new AuthService();
    const user = await authService.register(validated);

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  } catch (error) {
    logger.error("registerUserAction failed", error);

    if (error instanceof ValidationError && error.details) {
      const messages = Object.values(error.details).flat();
      if (messages.length > 0) {
        return { success: false, error: messages.join(". ") };
      }
    }

    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }

    if (
      error &&
      typeof error === "object" &&
      "errors" in error &&
      Array.isArray((error as { errors: { message?: string }[] }).errors) &&
      (error as { errors: { message?: string }[] }).errors[0]?.message
    ) {
      return {
        success: false,
        error: (error as { errors: { message?: string }[] }).errors[0].message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed. Please check your inputs.",
    };
  }
}
