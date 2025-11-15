# #GangGreen Platform - Technical Guide

**Last Updated**: November 15, 2025  
**Version**: 4.0  
**Status**: Sprint 4 - Onboarding Chatbot & Auth Performance Optimization

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication System](#authentication-system)
4. [Authentication Performance Optimization](#authentication-performance-optimization)
5. [User Profile Management](#user-profile-management)
6. [Initiative Management System](#initiative-management-system)
7. [Tree Registry and Monitoring](#tree-registry-and-monitoring)
8. [Antugrow API Integration](#antugrow-api-integration)
9. [Onboarding Chatbot](#onboarding-chatbot)
10. [Database Schema](#database-schema)
11. [API Services](#api-services)
12. [Component Architecture](#component-architecture)
13. [State Management](#state-management)
14. [Security](#security)
15. [Testing](#testing)
16. [Deployment](#deployment)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile Web  │  │   Admin      │     │
│  │   (Vite)     │  │  (Responsive)│  │   Dashboard  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (TypeScript)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auth │ Profile │ Initiative │ Tree │ Antugrow      │  │
│  │  Cache │ Chatbot │ Marketplace │ Web3 │ NFT         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                         │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  PostgreSQL DB     │  │  Auth Service      │           │
│  │  - 20 tables       │  │  - JWT tokens      │           │
│  │  - PostGIS         │  │  - Session mgmt    │           │
│  │  - RLS policies    │  │                    │           │
│  └────────────────────┘  └────────────────────┘           │
│  ┌────────────────────┐                                    │
│  │  Storage Buckets   │                                    │
│  │  - Tree images     │                                    │
│  │  - Avatars         │                                    │
│  └────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Integrations                           │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │  Antugrow API      │  │  Leaflet.js Maps   │           │
│  │  - Tree analysis   │  │  - Geospatial viz  │           │
│  └────────────────────┘  └────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```


## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.21.0
- **Maps**: Leaflet.js 1.9.4 + react-leaflet 4.2.1
- **State Management**: React Context API
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Database**: PostgreSQL 15 with PostGIS extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (4 buckets)

### External Integrations
- **Antugrow API**: AI-powered tree monitoring and analysis
- **OpenStreetMap**: Free map tiles for Leaflet.js

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 8.55.0
- **Formatting**: Prettier 3.1.1
- **Version Control**: Git

---

## Authentication System

### Overview

The authentication system provides secure user registration, login, and session management with role-based access control. As of November 15, 2025, a major performance optimization is being implemented to reduce login time from 2-5 seconds to under 500ms.

**Status**: ✅ Complete (Optimization in progress)

### Current Architecture (Before Optimization)

```
User Login
   ↓
supabase.auth.signInWithPassword()
   ↓
getCurrentUser()
   ↓
supabase.auth.getUser() [Query 1]
   ↓
SELECT from users WHERE id = ? [Query 2]
   ↓
SELECT from user_profiles WHERE id = ? [Query 3]
   ↓
Transform and return user object
   ↓
Total Time: 2-5 seconds
```

**Issues**:
- 3 sequential database queries
- Multiple RLS policy evaluations
- No caching mechanism
- Slow user experience


---

## Authentication Performance Optimization

### Overview

**Status**: 🚧 In Progress (Specs Complete, Implementation Starting)  
**Target**: Reduce login time from 2-5 seconds to < 500ms  
**Approach**: Database query consolidation + intelligent caching

### Optimized Architecture (After Optimization)

```
User Login
   ↓
supabase.auth.signInWithPassword()
   ↓
getCurrentUser()
   ↓
Check UserCache (if valid, return in <50ms) ✨
   ↓
Single JOIN query: users + user_profiles [Query 1] ✨
   ↓
Cache result (TTL: 5 minutes) ✨
   ↓
Transform and return user object
   ↓
Total Time: <500ms (uncached), <50ms (cached)
```

**Improvements**:
- ✅ 3 queries → 1 query (67% reduction)
- ✅ In-memory cache with 5-minute TTL
- ✅ Performance monitoring and logging
- ✅ 10x faster login experience

### User Cache Service

**Location**: `src/services/userCache.ts` (Coming Soon)

**Interface**:
```typescript
interface CachedUser {
  user: User;
  timestamp: number;
  expiresAt: number;
}

class UserCache {
  private cache: Map<string, CachedUser>;
  private TTL = 5 * 60 * 1000; // 5 minutes
  
  get(userId: string): User | null;
  set(userId: string, user: User): void;
  invalidate(userId: string): void;
  clear(): void;
  getStats(): { hits: number; misses: number };
}
```

**Cache Strategy**:
- Cache user data for 5 minutes after fetch
- Invalidate on logout
- Invalidate on profile updates
- Clear all cache on auth state change
- Track hit/miss statistics


### Optimized Auth Service Methods

**getCurrentUser() - Optimized** (Coming Soon):
```typescript
async getCurrentUser(): Promise<User | null> {
  const start = performance.now();
  
  try {
    // Get auth user (required for ID)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;
    
    // Check cache first ✨
    const cached = this.userCache.get(authUser.id);
    if (cached) {
      console.log('[Auth] Served from cache');
      return cached;
    }
    
    // Single query with join ✨
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles (*)
      `)
      .eq('id', authUser.id)
      .single();
    
    if (error || !data) return null;
    
    // Transform and cache ✨
    const user = this.transformUserData(data);
    this.userCache.set(authUser.id, user);
    
    const duration = performance.now() - start;
    console.log(`[Auth] getCurrentUser took ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`[Auth] Slow query detected: ${duration}ms`);
    }
    
    return user;
  } catch (error) {
    console.error('[Auth] Error fetching user:', error);
    return null;
  }
}
```

**login() - Updated** (Coming Soon):
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

**logout() - Updated** (Coming Soon):
```typescript
async logout(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    // Clear cache on logout ✨
    this.userCache.clear();
    
    return { error };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Logout failed'),
    };
  }
}
```

### Performance Targets

- **Login time (uncached):** < 500ms (currently 2-5s)
- **Login time (cached):** < 50ms
- **Cache hit rate:** > 80% for active users
- **Database queries per login:** 1 (down from 3)
- **Memory overhead:** < 1MB for 1000 cached users

### Performance Monitoring

**Console Logging**:
```typescript
// Timing logs
[Auth] getCurrentUser took 245ms
[Auth] Login completed in 312ms

// Cache logs
[Auth] Served from cache
[Auth] Cache hit rate: 85%

// Warning logs
[Auth] Slow query detected: 1250ms
[Auth] Slow login detected: 1450ms
```

**Metrics Tracked**:
- Query execution time
- Total login duration
- Cache hit/miss ratio
- Slow operation warnings (>1s)

