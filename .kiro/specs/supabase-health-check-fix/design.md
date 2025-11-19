# Design Document

## Overview

This design addresses the health check timeout issue by implementing a faster, non-blocking health check mechanism. The key insight is that health checks should inform but not block authentication operations. We'll use a lighter-weight check and make it advisory rather than mandatory.

## Architecture

### Current Flow (Blocking)
```
Registration/Login Request
  → checkSupabaseHealth() [3s timeout, BLOCKS if fails]
    → Query users table with count
    → Wait up to 3 seconds
    → If timeout: REJECT authentication
  → If healthy: Proceed with auth
  → If unhealthy: Return error immediately
```

### New Flow (Non-Blocking)
```
Registration/Login Request
  → checkSupabaseHealth() [1s timeout, NON-BLOCKING]
    → Quick ping query (select 1)
    → Wait up to 1 second
    → Log result but don't block
  → Proceed with authentication attempt
  → Handle actual Supabase errors if they occur
  → Return user-friendly error based on real failure
```

## Components and Interfaces

### 1. Improved Health Check Query

**Current Problem:** Querying `users` table with count is slow due to:
- RLS policies evaluation
- Table size
- Index scanning

**Solution:** Use a minimal query that doesn't touch user tables

```typescript
// Option 1: Simple select (fastest)
const { error } = await supabase.rpc('ping'); // If custom function exists

// Option 2: Query a system table
const { error } = await supabase
  .from('users')
  .select('id')
  .limit(1)
  .single();

// Option 3: Just test auth connection
const { error } = await supabase.auth.getSession();
```

### 2. Non-Blocking Health Check

**Implementation:**
```typescript
async function checkSupabaseHealth(
  forceCheck: boolean = false
): Promise<HealthCheckResult> {
  const now = Date.now();

  // Return cached result if available and not expired
  if (
    !forceCheck &&
    lastHealthCheck &&
    now - lastHealthCheck.timestamp < HEALTH_CHECK_CACHE_TTL
  ) {
    return lastHealthCheck;
  }

  console.log('[Health] Performing quick health check...');

  try {
    // Quick connection test with 1 second timeout
    const healthCheckPromise = supabase.auth.getSession();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Health check timeout')), 1000)
    );

    const { error } = await Promise.race([
      healthCheckPromise,
      timeoutPromise,
    ]);

    const isHealthy = !error;

    // Cache the result for 10 seconds
    lastHealthCheck = {
      isHealthy,
      timestamp: now,
      error: error?.message,
      duration: Date.now() - now,
    };

    return lastHealthCheck;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    lastHealthCheck = {
      isHealthy: false,
      timestamp: now,
      error: errorMessage,
      duration: Date.now() - now,
    };

    return lastHealthCheck;
  }
}
```

### 3. Updated Auth Methods (Non-Blocking)

**Register Method:**
```typescript
async register(data: RegisterData): Promise<AuthResponse> {
  const start = performance.now();

  try {
    console.log('[AuthService] Starting registration...', {
      email: data.email,
    });

    // Perform health check but don't block on failure
    const healthCheck = await checkSupabaseHealth();
    if (!healthCheck.isHealthy) {
      console.warn('[AuthService] Health check failed, proceeding anyway:', {
        error: healthCheck.error,
        duration: healthCheck.duration,
      });
    } else {
      console.log('[AuthService] Health check passed:', {
        duration: healthCheck.duration,
      });
    }

    // Proceed with registration regardless of health check
    const { data: authData, error: authError } = await withRetry(
      () =>
        supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              role: data.role || 'individual',
              forest_preference: data.forest_preference,
            },
          },
        }),
      DEFAULT_RETRY_CONFIG,
      'signUp'
    );

    // Handle actual errors from Supabase
    if (authError) {
      const enhancedError = categorizeAuthError(authError);
      console.error('[AuthService] SignUp error:', {
        type: enhancedError.type,
        message: enhancedError.message,
      });
      return {
        user: null,
        error: new Error(enhancedError.userMessage),
      };
    }

    // ... rest of registration logic
  } catch (error) {
    // Handle exceptions
  }
}
```

**Login Method:**
```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  const start = performance.now();

  try {
    console.log('[AuthService] Starting login for:', credentials.email);

    // Perform health check but don't block on failure
    const healthCheck = await checkSupabaseHealth();
    if (!healthCheck.isHealthy) {
      console.warn('[AuthService] Health check failed, proceeding anyway:', {
        error: healthCheck.error,
        duration: healthCheck.duration,
      });
    }

    // Proceed with login regardless of health check
    const { data, error } = await withRetry(
      () =>
        supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        }),
      DEFAULT_RETRY_CONFIG,
      'signInWithPassword'
    );

    // Handle actual errors from Supabase
    if (error) {
      const enhancedError = categorizeAuthError(error);
      console.error('[AuthService] Login error:', enhancedError);
      return {
        user: null,
        error: new Error(enhancedError.userMessage),
      };
    }

    // ... rest of login logic
  } catch (error) {
    // Handle exceptions
  }
}
```

### 4. Health Check Metrics

**Track health check performance:**
```typescript
interface HealthCheckMetrics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageDuration: number;
  lastCheckTime: number;
}

class HealthCheckMonitor {
  private metrics: HealthCheckMetrics = {
    totalChecks: 0,
    successfulChecks: 0,
    failedChecks: 0,
    averageDuration: 0,
    lastCheckTime: 0,
  };

  recordCheck(result: HealthCheckResult): void {
    this.metrics.totalChecks++;
    this.metrics.lastCheckTime = result.timestamp;

    if (result.isHealthy) {
      this.metrics.successfulChecks++;
    } else {
      this.metrics.failedChecks++;
    }

    // Update average duration
    const totalDuration = this.metrics.averageDuration * (this.metrics.totalChecks - 1);
    this.metrics.averageDuration = (totalDuration + result.duration) / this.metrics.totalChecks;

    // Log warning if success rate is low
    const successRate = this.metrics.successfulChecks / this.metrics.totalChecks;
    if (this.metrics.totalChecks >= 5 && successRate < 0.5) {
      console.warn('[Health] Low health check success rate:', {
        successRate: `${(successRate * 100).toFixed(1)}%`,
        total: this.metrics.totalChecks,
        successful: this.metrics.successfulChecks,
        failed: this.metrics.failedChecks,
      });
    }
  }

  getMetrics(): HealthCheckMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageDuration: 0,
      lastCheckTime: 0,
    };
  }
}
```

## Data Models

### HealthCheckResult (Updated)
```typescript
interface HealthCheckResult {
  isHealthy: boolean;
  timestamp: number;
  duration: number;  // NEW: Track how long check took
  error?: string;
}
```

### HealthCheckMetrics (New)
```typescript
interface HealthCheckMetrics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageDuration: number;
  lastCheckTime: number;
}
```

## Error Handling

### Health Check Failures

1. **Timeout (1s)**
   - Log warning with duration
   - Mark as unhealthy
   - Cache result for 10 seconds
   - Continue with authentication

2. **Network Error**
   - Log error details
   - Mark as unhealthy
   - Cache result for 10 seconds
   - Continue with authentication

3. **Supabase Error**
   - Log error message
   - Mark as unhealthy
   - Cache result for 10 seconds
   - Continue with authentication

### Authentication Failures

Let Supabase's actual error responses guide the user experience:
- Invalid credentials → Clear error message
- Network timeout → Retry with exponential backoff
- Service unavailable → User-friendly message with retry suggestion

## Testing Strategy

### Unit Tests

1. **Health Check Tests**
   - Test successful health check completes under 1s
   - Test timeout after 1s
   - Test caching behavior (10s TTL)
   - Test metrics tracking

2. **Non-Blocking Behavior Tests**
   - Test registration proceeds when health check fails
   - Test login proceeds when health check fails
   - Test health check warnings are logged

### Integration Tests

1. **Auth Flow Tests**
   - Test registration with healthy service
   - Test registration with unhealthy service (simulated)
   - Test login with healthy service
   - Test login with unhealthy service (simulated)

2. **Performance Tests**
   - Measure health check duration (should be <1s)
   - Measure registration time with failed health check
   - Verify no blocking behavior

### Manual Testing

1. **Simulate Slow Connection**
   - Throttle network in browser DevTools
   - Attempt registration
   - Verify health check times out but registration proceeds

2. **Monitor Console Logs**
   - Verify health check warnings appear
   - Verify authentication proceeds
   - Verify metrics are logged

## Performance Targets

- **Health check duration:** < 1 second (down from 3 seconds)
- **Health check cache TTL:** 10 seconds (down from 30 seconds)
- **Registration/login blocking:** 0 seconds (health check is non-blocking)
- **Health check success rate:** > 90% under normal conditions

## Migration Strategy

1. **Phase 1:** Update health check query to use faster method
2. **Phase 2:** Reduce timeout from 3s to 1s
3. **Phase 3:** Make health check non-blocking in auth methods
4. **Phase 4:** Add health check metrics tracking
5. **Phase 5:** Reduce cache TTL from 30s to 10s

No database migrations required - only code changes.

## Rollback Plan

If issues arise:
1. Revert to blocking health check behavior
2. Increase timeout back to 3 seconds
3. Restore original query method

The changes are isolated to `supabaseHealth.ts` and `auth.service.ts`, making rollback straightforward.
