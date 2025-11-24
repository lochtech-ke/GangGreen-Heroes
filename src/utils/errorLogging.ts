/**
 * Error Logging Utility with Sensitive Data Filtering
 * Ensures that logged errors don't contain sensitive information
 * Requirements: 4.4
 */

// Patterns to detect and redact sensitive information
const SENSITIVE_PATTERNS = [
  // Tokens and API keys
  { pattern: /bearer\s+[\w-]+/gi, replacement: 'bearer [REDACTED]' },
  { pattern: /token["\s:=]+[\w.-]+/gi, replacement: 'token: [REDACTED]' },
  { pattern: /api[_-]?key["\s:=]+[\w-]+/gi, replacement: 'api_key: [REDACTED]' },
  { pattern: /access[_-]?token["\s:=]+[\w.-]+/gi, replacement: 'access_token: [REDACTED]' },
  { pattern: /refresh[_-]?token["\s:=]+[\w.-]+/gi, replacement: 'refresh_token: [REDACTED]' },
  
  // Passwords
  { pattern: /password["\s:=]+[^\s,}"]+/gi, replacement: 'password: [REDACTED]' },
  { pattern: /"password":\s*"[^"]+"/gi, replacement: '"password": "[REDACTED]"' },
  
  // Email addresses (partial redaction - keep domain for debugging)
  { pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, replacement: (_match: string, user: string, domain: string) => {
    const redactedUser = user.length > 2 ? user.substring(0, 2) + '***' : '***';
    return `${redactedUser}@${domain}`;
  }},
  
  // Phone numbers (various formats)
  { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '***-***-****' },
  { pattern: /\+\d{1,3}\s?\d{3,14}/g, replacement: '+*** ********' },
  
  // Credit card numbers
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '**** **** **** ****' },
  
  // Social security numbers
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '***-**-****' },
  
  // JWT tokens (basic detection)
  { pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, replacement: '[JWT_TOKEN_REDACTED]' },
];

/**
 * Sanitizes a string by removing or redacting sensitive information
 * @param text - The text to sanitize
 * @returns Sanitized text with sensitive data redacted
 */
export function sanitizeString(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let sanitized = text;

  // Apply all sensitive patterns
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    if (typeof replacement === 'function') {
      sanitized = sanitized.replace(pattern, replacement as any);
    } else {
      sanitized = sanitized.replace(pattern, replacement);
    }
  }

  return sanitized;
}

/**
 * Sanitizes an object by recursively removing sensitive data
 * @param obj - The object to sanitize
 * @returns Sanitized object with sensitive data redacted
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitive types
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  // Handle objects
  const sanitized: any = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'apiKey', 'accessToken', 'refreshToken'];

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Completely redact known sensitive keys
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Logs an error with sensitive data filtering
 * @param context - Context string (e.g., 'AuthService', 'LoginPage')
 * @param error - The error to log
 * @param additionalData - Additional data to log (will be sanitized)
 */
export function logError(context: string, error: any, additionalData?: any): void {
  const timestamp = new Date().toISOString();
  
  // Sanitize error message
  const errorMessage = error?.message ? sanitizeString(error.message) : 'Unknown error';
  
  // Sanitize additional data
  const sanitizedData = additionalData ? sanitizeObject(additionalData) : undefined;
  
  // Log to console (in production, this could be sent to a logging service)
  console.error(`[${timestamp}] [${context}] Error:`, {
    message: errorMessage,
    type: error?.name || 'Error',
    ...(sanitizedData && { data: sanitizedData }),
  });
  
  // In production, you might want to send this to a logging service
  // Example: sendToLoggingService({ timestamp, context, errorMessage, sanitizedData });
}

/**
 * Logs authentication errors specifically
 * Includes additional OAuth-specific sanitization
 * @param context - Context string
 * @param error - The error to log
 * @param additionalData - Additional data to log
 */
export function logAuthError(context: string, error: any, additionalData?: any): void {
  // Add OAuth-specific sanitization
  const sanitizedError = {
    ...error,
    message: error?.message ? sanitizeString(error.message) : undefined,
  };
  
  logError(context, sanitizedError, additionalData);
}

/**
 * Tests if a string contains sensitive information
 * Useful for validation in tests
 * @param text - The text to check
 * @returns true if sensitive data is detected
 */
export function containsSensitiveData(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Check for common sensitive patterns
  const sensitiveIndicators = [
    /bearer\s+[\w-]{20,}/i,
    /token["\s:=]+[\w.-]{20,}/i,
    /password["\s:=]+[^\s,}"]{6,}/i,
    /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/,
  ];

  return sensitiveIndicators.some(pattern => pattern.test(text));
}
