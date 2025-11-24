/**
 * Enhanced error categorization for authentication
 * Requirements: 4.1, 4.2, 4.4, 5.5
 */

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  WEAK_PASSWORD = 'weak_password',
  UNKNOWN = 'unknown',
}

export interface EnhancedAuthError {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  technicalDetails?: string;
}

/**
 * Categorizes authentication errors into user-friendly types
 * Maps technical errors to user-friendly messages
 * Distinguishes retryable from permanent errors
 * @param error - The error to categorize
 * @returns Enhanced error with type, user message, and retryability
 */
export function categorizeAuthError(error: any): EnhancedAuthError {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';
  const errorStatus = error?.status?.toString() || '';

  // Invalid credentials
  if (
    errorMessage.includes('invalid') ||
    errorMessage.includes('credentials') ||
    errorMessage.includes('invalid login') ||
    errorMessage.includes('email not confirmed') ||
    errorCode.includes('invalid_grant')
  ) {
    return {
      type: AuthErrorType.INVALID_CREDENTIALS,
      message: error.message,
      userMessage: 'Invalid email or password. Please try again.',
      retryable: false,
      technicalDetails: errorCode || errorMessage,
    };
  }

  // User not found
  if (
    errorMessage.includes('user not found') ||
    errorMessage.includes('no user found') ||
    errorCode.includes('user_not_found')
  ) {
    return {
      type: AuthErrorType.USER_NOT_FOUND,
      message: error.message,
      userMessage: 'No account found with this email address.',
      retryable: false,
      technicalDetails: errorCode || errorMessage,
    };
  }

  // Email already exists
  if (
    errorMessage.includes('already registered') ||
    errorMessage.includes('email already exists') ||
    errorMessage.includes('duplicate') ||
    errorCode.includes('user_already_exists')
  ) {
    return {
      type: AuthErrorType.EMAIL_ALREADY_EXISTS,
      message: error.message,
      userMessage: 'An account with this email already exists.',
      retryable: false,
      technicalDetails: errorCode || errorMessage,
    };
  }

  // Weak password
  if (
    errorMessage.includes('password') &&
    (errorMessage.includes('weak') ||
      errorMessage.includes('too short') ||
      errorMessage.includes('requirements'))
  ) {
    return {
      type: AuthErrorType.WEAK_PASSWORD,
      message: error.message,
      userMessage:
        'Password does not meet requirements. Please use a stronger password.',
      retryable: false,
      technicalDetails: errorCode || errorMessage,
    };
  }

  // Timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorCode.includes('etimedout')
  ) {
    return {
      type: AuthErrorType.TIMEOUT,
      message: error.message,
      userMessage:
        'Connection timed out. Please check your internet connection and try again.',
      retryable: true,
      technicalDetails: errorCode || errorMessage,
    };
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('enetunreach') ||
    errorCode.includes('network_error')
  ) {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message: error.message,
      userMessage: 'Network error. Please check your internet connection.',
      retryable: true,
      technicalDetails: errorCode || errorMessage,
    };
  }

  // Service unavailable (5xx errors)
  if (
    errorMessage.includes('service unavailable') ||
    errorMessage.includes('temporarily unavailable') ||
    errorStatus === '503' ||
    errorStatus === '504' ||
    errorStatus === '502' ||
    errorCode.includes('service_unavailable')
  ) {
    return {
      type: AuthErrorType.SERVICE_UNAVAILABLE,
      message: error.message,
      userMessage:
        'Service temporarily unavailable. Please try again in a few moments.',
      retryable: true,
      technicalDetails: errorCode || errorMessage,
    };
  }

  // Unknown error
  return {
    type: AuthErrorType.UNKNOWN,
    message: error.message || 'An unknown error occurred',
    userMessage:
      'An unexpected error occurred. Please try again or contact support if the problem persists.',
    retryable: false,
    technicalDetails: errorCode || errorMessage || JSON.stringify(error),
  };
}
