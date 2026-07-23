import { retryEngine } from "../services/retry-engine";

export async function processAutomaticRetries(): Promise<void> {
  await retryEngine.automaticRetry();
}

export async function retrySingleExecution(executionId: string): Promise<void> {
  await retryEngine.retryExecution(executionId);
}
