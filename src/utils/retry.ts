/**
 * Retry utility with exponential backoff for handling transient failures
 * Requirements: 4.3, 5.1, 5.2, 5.3, 5.5
 */

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  backoffMultiplier: 2,
};

/**
 * Determines if an error is retryable (transient) or permanent
 * @param error - The error to check
 * @returns true if the error is retryable, false otherwise
 */
export function isRetryableError(error: any): boolean {
  // Network errors, timeouts, and 5xx errors are retryable
  const retryableMessages = [
    'timeout',
    'network',
    'fetch',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ENETUNREACH',
    'EAI_AGAIN',
    'temporarily unavailable',
    '503',
    '504',
    '502',
  ];

  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';
  const errorStatus = error?.status?.toString() || '';

  return retryableMessages.some(
    (msg) =>
      errorMessage.includes(msg) ||
      errorCode.includes(msg) ||
      errorStatus.includes(msg)
  );
}

/**
 * Sleep utility for delays between retry attempts
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an async operation with retry logic and exponential backoff
 * @param operation - The async operation to execute
 * @param config - Retry configuration
 * @param operationName - Name of the operation for logging
 * @returns The result of the operation
 * @throws The last error if all retry attempts fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation();

      // Log success on retry
      if (attempt > 1) {
        console.log(
          `[Retry] ${operationName} succeeded on attempt ${attempt}/${config.maxAttempts}`
        );
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      const shouldRetry =
        attempt < config.maxAttempts && isRetryableError(error);

      if (shouldRetry) {
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );

        console.warn(
          `[Retry] ${operationName} failed (attempt ${attempt}/${config.maxAttempts}), retrying in ${delay}ms...`,
          {
            error: error instanceof Error ? error.message : String(error),
            attempt,
            nextDelay: delay,
          }
        );

        await sleep(delay);
      } else {
        // Don't retry - either max attempts reached or permanent error
        if (!isRetryableError(error)) {
          console.error(
            `[Retry] ${operationName} failed with permanent error, not retrying`,
            {
              error: error instanceof Error ? error.message : String(error),
              attempt,
            }
          );
        } else {
          console.error(
            `[Retry] ${operationName} failed after ${config.maxAttempts} attempts`,
            {
              error: error instanceof Error ? error.message : String(error),
            }
          );
        }
        break;
      }
    }
  }

  throw lastError!;
}
