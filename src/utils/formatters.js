/**
 * Formatting utilities for dates, currency, and other display values.
 */

/**
 * Formats a date string or Date object into a readable format.
 * @param {string|Date} date - The date to format.
 * @param {object} [options] - Intl.DateTimeFormat options override.
 * @returns {string} Formatted date string, or '-' if invalid.
 */
export function formatDate(date, options = {}) {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    });
  } catch {
    return '-';
  }
}

/**
 * Formats a date into a relative time string (e.g. "3 hours ago").
 * @param {string|Date} date - The date to format.
 * @returns {string} Relative time string.
 */
export function formatRelativeTime(date) {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(d);
  } catch {
    return '-';
  }
}

/**
 * Formats a number as currency (USD by default).
 * @param {number} amount - The amount to format.
 * @param {string} [currency='USD'] - Currency code.
 * @returns {string} Formatted currency string.
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount == null || isNaN(amount)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number with commas (e.g. 1,234,567).
 * @param {number} value - The number to format.
 * @returns {string} Formatted number string.
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '-';
  return new Intl.NumberFormat('en-US').format(value);
}
