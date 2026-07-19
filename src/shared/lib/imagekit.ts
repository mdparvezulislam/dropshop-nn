import ImageKit from "imagekit";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/utils/logger";

let cachedClient: ImageKit | null = null;

export function getImageKitClient(): ImageKit {
  if (cachedClient) {
    return cachedClient;
  }

  logger.info("Initializing ImageKit client...");
  cachedClient = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  });

  return cachedClient;
}

export default getImageKitClient;
