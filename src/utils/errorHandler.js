/**
 * Centralized error handling utilities for consistent error message extraction
 * and formatting across the application.
 */

/**
 * Extracts a user-friendly error message from various error shapes.
 * Handles Axios errors, API response errors, and plain Error objects.
 */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';

  // Axios error with API response
  if (error.response?.data) {
    const data = error.response.data;

    // ApiResponse format: { message, errors }
    if (data.message) return data.message;
    if (data.errors) {
      if (Array.isArray(data.errors)) return data.errors.join(', ');
      if (typeof data.errors === 'object') {
        return Object.values(data.errors).flat().join(', ');
      }
    }
    if (typeof data === 'string') return data;
  }

  // Axios network or timeout error
  if (error.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }

  // Standard Error object
  if (error.message) return error.message;

  return 'An unexpected error occurred.';
}

/**
 * Returns the HTTP status code from an error, or null if unavailable.
 */
export function getErrorStatus(error) {
  return error?.response?.status ?? null;
}

/**
 * Returns true if the error represents an authentication failure (401).
 */
export function isAuthError(error) {
  return getErrorStatus(error) === 401;
}

/**
 * Returns true if the error represents a forbidden action (403).
 */
export function isForbiddenError(error) {
  return getErrorStatus(error) === 403;
}
