import { DatabaseConnectionManager } from "./connection-manager";
import { logger } from "@/shared/utils/logger";

export async function testMongooseConnection(): Promise<boolean> {
  logger.info("Running Mongoose Connection Pool test...");
  try {
    await DatabaseConnectionManager.connect();
    const health = DatabaseConnectionManager.getHealthStatus();
    logger.info("Database connection health report:", health);
    return health.status === "healthy";
  } catch (err) {
    logger.error("Mongoose connection pool test failed", err);
    return false;
  }
}

export default testMongooseConnection;
