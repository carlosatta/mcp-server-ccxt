/**
 * Utility function to add timeout to async operations
 * Prevents hanging requests by throwing an error if operation takes too long
 */

/**
 * Wraps a promise with a timeout
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operationName - Name of the operation for error messages
 * @returns {Promise} - The wrapped promise that will reject if timeout is exceeded
 */
export async function withTimeout(promise, timeoutMs, operationName = 'Operation') {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Default timeout for CCXT operations (15 seconds)
 * This is lower than the global server timeout to ensure we can
 * return a meaningful error before the server times out
 */
export const DEFAULT_CCXT_TIMEOUT = 15000;
