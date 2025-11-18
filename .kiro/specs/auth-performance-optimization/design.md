# Design Document

## Overview

This design optimizes the authentication service to reduce login time from multiple seconds to under 500ms by consolidating database queries, implementing caching, and adding performance monitoring. The solution maintains backward compatibility while significantly improving user experience.

## Architecture

### Current Flow (Slow)
```
Login Request
  → supabase.auth.signInWithPassword()
  → getCurrentUser()
    → supabase.auth.getUser() [Query 1]
    → SELECT from users WHERE id = ? [Query 2]
    → SELECT from user_profiles WHERE id = ? [Query 3]
  → Return user object
```

### Optimized Flow (Fast)
```
Login Request
  → supabase.auth.signInWithPassword()
  → getCurrentUser()
    → Check cache (if valid, return immediately)
    → Single JOIN query: users + user_profiles [Query 1]
    → Cache result
  → Return user object
```

## Components and Interfaces

### 1. Optimized Database Query

**Approach:** Use Supabase's query builder with joins to fetch all user data in one operation.

```typescript
// Single query with join
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    user_profiles (*)
  `)
  .eq('id', authUser.id)
  .single();
```

**Benefits:**
- Reduces 3 queries to 1
- Leverages PostgreSQL's efficient join operations
- Single RLS policy evaluation instead of 3
- Reduces network round trips

### 2. User Data Cache

**Implementation:** Simple in-memory cache with TTL (Time To Live)

```typescript
interface CachedUser {
  user: User;
  timestamp: number;
  expiresAt: number;
}

class UserCache {
  private cache: Map<string, CachedUser>;
  private TTL = 5 * 60 * 1000; // 5 minutes
  
  get(userId: string): User | null
  set(userId: string, user: User): void
  invalidate(userId: string): void
  clear(): void
}
```

**Cache Strategy:**
- Cache user data for 5 minutes after fetch
- Invalidate on logout
- Invalidate on profile updates
- Clear all cache on auth state change

### 3. Performance Monitoring

**Logging Strategy:**
```typescript
interface PerformanceLog {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
}

// Usage
const start = performance.now();
// ... operation ...
const duration = performance.now() - start;
if (duration > 1000) {
  console.warn(`Slow operation: ${operation} took ${duration}ms`);
}
```

### 4. Updated AuthService Methods

**getCurrentUser() - Optimized:**
```typescript
async getCurrentUser(): Promise<User | null> {
  const start = performance.now();
  
  try {
    // Get auth user (required for ID)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;
    
    // Check cache first
    const cached = this.userCache.get(authUser.id);
    if (cached) {
      console.log('[Auth] Served from cache');
      return cached;
    }
    
    // Single query with join
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles (*)
      `)
      .eq('id', authUser.id)
      .single();
    
    if (error || !data) return null;
    
    // Transform and cache
    const user = this.transformUserData(data);
    this.userCache.set(authUser.id, user);
    
    const duration = performance.now() - start;
    console.log(`[Auth] getCurrentUser took ${duration}ms`);
    
    return user;
  } catch (error) {
    console.error('[Auth] Error fetching user:', error);
    return null;
  }
}
```

**login() - Updated:**
```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  const start = performance.now();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) return { user: null, error };
    if (!data.user) return { user: null, error: new Error('Login failed') };

    const user = await this.getCurrentUser();
    
    const duration = performance.now() - start;
    console.log(`[Auth] Login completed in ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`[Auth] Slow login detected: ${duration}ms`);
    }
    
    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error('Login failed'),
    };
  }
}
```

**logout() - Updated:**
```typescript
async logout(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    // Clear cache on logout
    this.userCache.clear();
    
    return { error };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Logout failed'),
    };
  }
}
```

## Data Models

### User Type (Unchanged)
```typescript
interface User {
  id: string;
  email: string;
  role: UserRole;
  forest_preference?: string;
  created_at: string;
  profile?: UserProfile;
}
```

### Database Response Type (New)
```typescript
interface UserWithProfileResponse {
  id: string;
  email: string;
  role: string;
  forest_preference: string | null;
  created_at: string;
  updated_at: string;
  user_profiles: UserProfile | null;
}
```

## Error Handling

### Error Scenarios

1. **Auth User Not Found**
   - Return null immediately
   - No database query needed

2. **Database Query Fails**
   - Log error with context
   - Return null
   - Don't expose internal error details to UI

3. **Cache Corruption**
   - Invalidate cache entry
   - Fetch fresh data
   - Log warning

4. **Slow Query (>1s)**
   - Log performance warning
   - Continue normal operation
   - Alert developers to investigate

### Error Logging
```typescript
console.error('[Auth] Operation failed:', {
  operation: 'getCurrentUser',
  userId: authUser?.id,
  error: error.message,
  duration: performance.now() - start
});
```

## Testing Strategy

### Unit Tests

1. **UserCache Tests**
   - Test cache hit/miss
   - Test TTL expiration
   - Test invalidation
   - Test clear all

2. **AuthService Tests**
   - Test login with cache hit
   - Test login with cache miss
   - Test logout clears cache
   - Test performance logging

### Integration Tests

1. **Database Query Tests**
   - Verify single query with join works
   - Verify data transformation
   - Test with missing profile
   - Test with complete profile

2. **Performance Tests**
   - Measure login time (should be <500ms)
   - Measure cached vs uncached
   - Test under load

### Manual Testing

1. **Login Flow**
   - First login (cache miss)
   - Second login (cache hit)
   - Login after cache expiry
   - Login after logout

2. **Console Monitoring**
   - Verify timing logs appear
   - Verify cache hit logs
   - Verify slow query warnings

## Performance Targets

- **Login time (uncached):** < 500ms
- **Login time (cached):** < 50ms
- **Cache hit rate:** > 80% for active users
- **Database queries per login:** 1 (down from 3)
- **Memory overhead:** < 1MB for 1000 cached users

## Connection Resilience

### Retry Logic with Exponential Backoff

**Implementation:**
```typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  operationName: string
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation();
      if (attempt > 1) {
        console.log(`[Auth] ${operationName} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < config.maxAttempts && isRetryableError(error)) {
        const delay = Math.min(
          config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );
        console.warn(`[Auth] ${operationName} failed (attempt ${attempt}/${config.maxAttempts}), retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        break;
      }
    }
  }
  
  throw lastError;
}

function isRetryableError(error: any): boolean {
  // Network errors, timeouts, and 5xx errors are retryable
  const retryableMessages = ['timeout', 'network', 'ECONNREFUSED', 'ETIMEDOUT'];
  const errorMessage = error?.message?.toLowerCase() || '';
  return retryableMessages.some(msg => errorMessage.includes(msg));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Health Check

**Implementation:**
```typescript
async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await Promise.race([
      supabase.from('users').select('count').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 3000)
      )
    ]) as any;
    
    return !error;
  } catch (error) {
    console.error('[Auth] Health check failed:', error);
    return false;
  }
}
```

### Enhanced Error Messages

**User-Facing Error Types:**
```typescript
enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

interface EnhancedAuthError {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
}

function categorizeAuthError(error: any): EnhancedAuthError {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('invalid') || errorMessage.includes('credentials')) {
    return {
      type: AuthErrorType.INVALID_CREDENTIALS,
      message: error.message,
      userMessage: 'Invalid email or password. Please try again.',
      retryable: false
    };
  }
  
  if (errorMessage.includes('timeout')) {
    return {
      type: AuthErrorType.TIMEOUT,
      message: error.message,
      userMessage: 'Connection timed out. Please check your internet connection and try again.',
      retryable: true
    };
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message: error.message,
      userMessage: 'Network error. Please check your internet connection.',
      retryable: true
    };
  }
  
  return {
    type: AuthErrorType.SERVICE_UNAVAILABLE,
    message: error.message,
    userMessage: 'Service temporarily unavailable. Please try again in a few moments.',
    retryable: true
  };
}
```

### Updated Login Method with Resilience

```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  const start = performance.now();

  try {
    console.log('[AuthService] Starting login for:', credentials.email);
    
    // Check service health first
    const isHealthy = await checkSupabaseHealth();
    if (!isHealthy) {
      console.warn('[AuthService] Service health check failed');
      return {
        user: null,
        error: new Error('Service temporarily unavailable. Please try again in a few moments.')
      };
    }
    
    // Attempt login with retry logic
    const { data, error } = await withRetry(
      () => supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      }),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2
      },
      'signInWithPassword'
    );

    if (error) {
      const enhancedError = categorizeAuthError(error);
      console.error('[AuthService] Login error:', enhancedError);
      return { 
        user: null, 
        error: new Error(enhancedError.userMessage)
      };
    }

    if (!data.user) {
      return { 
        user: null, 
        error: new Error('Login failed. Please try again.')
      };
    }

    const user = await this.getCurrentUser();

    const duration = performance.now() - start;
    console.log(`[AuthService] Login completed in ${duration.toFixed(2)}ms`);

    if (duration > 1000) {
      console.warn(`[AuthService] Slow login detected: ${duration.toFixed(2)}ms`);
    }

    return { user, error: null };
  } catch (error) {
    const duration = performance.now() - start;
    const enhancedError = categorizeAuthError(error);
    console.error('[AuthService] Login exception:', {
      type: enhancedError.type,
      message: enhancedError.message,
      duration: `${duration.toFixed(2)}ms`,
    });
    return {
      user: null,
      error: new Error(enhancedError.userMessage),
    };
  }
}
```

## Migration Strategy

1. **Phase 1:** Add cache implementation (non-breaking) ✅
2. **Phase 2:** Optimize getCurrentUser() with join query ✅
3. **Phase 3:** Add performance monitoring ✅
4. **Phase 4:** Add connection resilience (retry logic, health checks)
5. **Phase 5:** Monitor and tune cache TTL

No database migrations required - only code changes.
