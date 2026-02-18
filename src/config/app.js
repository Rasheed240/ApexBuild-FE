/**
 * Application-wide configuration constants.
 */

export const APP_CONFIG = {
  name: 'ApexBuild',
  description: 'Construction Management Platform',
  version: '1.0.0',

  // API settings
  api: {
    timeout: 30000,
    retryAttempts: 1,
  },

  // Upload limits
  uploads: {
    maxImageSizeMB: 5,
    maxVideoSizeMB: 100,
    maxDocumentSizeMB: 25,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50],
  },

  // Toast/notification durations (ms)
  toastDuration: 5000,

  // Session
  sessionTimeoutMinutes: 30,
  rememberMeDays: 7,
};
