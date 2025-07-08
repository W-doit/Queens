interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  timestamp: number;
}

/**
 * Formats API responses to maintain a consistent structure
 * @param data - The data payload to include in the response
 * @param message - Optional message to include in the response
 * @param success - Whether the request was successful (defaults to true)
 * @returns Formatted API response object
 */
export function formatResponse<T>(
  data: T | null,
  message?: string,
  success: boolean = true
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    timestamp: Date.now(),
  };
}
