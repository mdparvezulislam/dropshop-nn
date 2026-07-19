import { Queue, QueueOptions, ConnectionOptions } from "bullmq";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/utils/logger";

export const bullMQConnection: ConnectionOptions = {
  host: env.BULLMQ_REDIS_HOST,
  port: env.BULLMQ_REDIS_PORT,
  password: env.BULLMQ_REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

const activeQueues: Record<string, Queue> = {};

export function getQueue(queueName: string, options?: Omit<QueueOptions, "connection">): Queue {
  if (activeQueues[queueName]) {
    return activeQueues[queueName];
  }

  logger.info(`Initializing BullMQ Queue: ${queueName}`);
  const queue = new Queue(queueName, {
    connection: bullMQConnection,
    ...options,
  });

  activeQueues[queueName] = queue;
  return queue;
}

export default getQueue;
