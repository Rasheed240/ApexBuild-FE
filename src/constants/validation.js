/**
 * Centralized validation patterns and rules used across forms.
 */

export const VALIDATION_PATTERNS = {
  PASSWORD: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    digit: /[0-9]/,
    special: /[@$!%*?&#]/,
  },
  PHONE: /^\+?[1-9]\d{1,14}$/,
  NAME: /^[a-zA-Z\s'-]+$/,
  ORG_CODE: /^[A-Z0-9-]*$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
};

export const VALIDATION_LIMITS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  ADDRESS_MAX_LENGTH: 500,
  BIO_MAX_LENGTH: 500,
  ORG_NAME_MAX_LENGTH: 200,
  ORG_DESCRIPTION_MAX_LENGTH: 1000,
  ORG_CODE_MAX_LENGTH: 50,
  LOCATION_MAX_LENGTH: 500,
  COMMENT_MAX_LENGTH: 5000,
};

export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: '8+ chars', test: (v) => v.length >= VALIDATION_LIMITS.PASSWORD_MIN_LENGTH },
  { key: 'upper', label: 'Uppercase', test: (v) => VALIDATION_PATTERNS.PASSWORD.uppercase.test(v) },
  { key: 'lower', label: 'Lowercase', test: (v) => VALIDATION_PATTERNS.PASSWORD.lowercase.test(v) },
  { key: 'digit', label: 'Number', test: (v) => VALIDATION_PATTERNS.PASSWORD.digit.test(v) },
  { key: 'special', label: 'Special char', test: (v) => VALIDATION_PATTERNS.PASSWORD.special.test(v) },
];
