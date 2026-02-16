/**
 * Centralized status color mappings for task-related badges and labels.
 * Uses Tailwind classes with dark mode support.
 */

export const TASK_STATUS_COLORS = {
  NotStarted: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  InProgress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  OnHold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  UnderReview: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  Approved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200',
  Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  Completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
};

export const UPDATE_STATUS_COLORS = {
  1: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',       // Submitted
  2: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200', // UnderContractorAdminReview
  3: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200', // ContractorAdminApproved
  4: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',           // ContractorAdminRejected
  5: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200', // UnderSupervisorReview
  6: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200', // SupervisorApproved
  7: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',           // SupervisorRejected
  8: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200', // UnderAdminReview
  9: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',   // AdminApproved
  10: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',          // AdminRejected
};

export const PRIORITY_LABELS = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
};

export const PRIORITY_COLORS = {
  1: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  2: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  3: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  4: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};
