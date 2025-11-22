# Design Document: Initiative RLS Policy Fix

## Overview

This design addresses the Row-Level Security (RLS) policy issue preventing users from creating initiatives. The current policy has a flaw in how it checks user roles, causing legitimate organization users to be blocked. The fix involves updating the RLS policy to properly handle role verification and provide better error handling.

## Architecture

### Current Problem

The existing RLS policy for initiative creation is:

```sql
CREATE POLICY "Organizations can create initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (
    auth.uid() = organization_id AND 
    (SELECT role FROM users WHERE id = auth.uid()) IN ('organization', 'admin')
  );
```

**Issues:**
1. The subquery `(SELECT role FROM users WHERE id = auth.uid())` may return NULL if the user record doesn't exist
2. The policy requires BOTH conditions to be true (organization_id match AND role check), which is overly restrictive for admins
3. No clear error messaging when the policy fails
4. The policy doesn't handle edge cases where auth.uid() might be NULL

### Proposed Solution

Update the RLS policy to:
1. Properly handle NULL cases
2. Allow admins to create initiatives for any organization
3. Ensure organization users can only create initiatives where they are the organization
4. Provide better error context through policy naming and structure

## Components and Interfaces

### Database Migration

**File:** `supabase/migrations/020_fix_initiative_rls_policy.sql`

This migration will:
1. Drop the existing "Organizations can create initiatives" policy
2. Create two new policies with clearer logic:
   - One for organization users (strict organization_id check)
   - One for admin users (no organization_id restriction)

### Updated RLS Policies

**Policy 1: Organization Users Can Create Their Initiatives**
```sql
CREATE POLICY "Organization users can create their initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (
    auth.uid() = organization_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'organization'
    )
  );
```

**Policy 2: Admin Users Can Create Any Initiative**
```sql
CREATE POLICY "Admin users can create any initiative"
  ON initiatives FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

### Service Layer Updates

**File:** `src/services/initiative.service.ts`

Update the `createInitiative` function to:
1. Automatically set `organization_id` to the current user's ID if not provided
2. Provide better error messages when RLS policy violations occur
3. Add validation before attempting database insertion

## Data Models

No changes to existing data models. The `initiatives` table structure remains the same:

```typescript
interface Initiative {
  id: string;
  title: string;
  description?: string;
  forest: 'kakamega' | 'karura' | 'mau';
  target_trees: number;
  trees_planted: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'paused';
  location: { lat: number; lng: number };
  area_hectares?: number;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Organization users can only create their own initiatives

*For any* authenticated user with role 'organization', when creating an initiative, the insertion should succeed if and only if the organization_id equals the user's ID.

**Validates: Requirements 1.1**

### Property 2: Admin users can create initiatives for any organization

*For any* authenticated user with role 'admin', when creating an initiative, the insertion should succeed regardless of the organization_id value.

**Validates: Requirements 1.2**

### Property 3: Non-privileged users cannot create initiatives

*For any* authenticated user with role 'community' or 'individual', when attempting to create an initiative, the insertion should be rejected.

**Validates: Requirements 2.1, 2.2**

### Property 4: Unauthenticated requests are rejected

*For any* unauthenticated request to create an initiative, the insertion should be rejected.

**Validates: Requirements 2.3**

### Property 5: Users without roles cannot create initiatives

*For any* authenticated user without a corresponding record in the users table, when attempting to create an initiative, the insertion should be rejected.

**Validates: Requirements 2.4**

### Property 6: RLS policy maintains read permissions

*For any* existing initiative, after applying the RLS policy fix, the read permissions should remain unchanged from before the fix.

**Validates: Requirements 4.6**

## Error Handling

### RLS Policy Violations

When an RLS policy violation occurs, Supabase returns a generic error:
```
new row violates row-level security policy for table "initiatives"
```

The service layer will enhance this with context:

```typescript
try {
  const { data, error } = await supabase
    .from('initiatives')
    .insert(initiativeData);
    
  if (error) {
    if (error.message.includes('row-level security policy')) {
      throw new Error(
        'Permission denied: Only organization and admin users can create initiatives. ' +
        'Organizations can only create initiatives for themselves.'
      );
    }
    throw error;
  }
  
  return data;
} catch (error) {
  console.error('Failed to create initiative:', error);
  throw error;
}
```

### User Role Validation

Before attempting to create an initiative, validate the user's role:

```typescript
async function validateUserCanCreateInitiative(userId: string): Promise<boolean> {
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error || !user) {
    throw new Error('User not found or not properly registered');
  }
  
  if (!['organization', 'admin'].includes(user.role)) {
    throw new Error(
      `Users with role '${user.role}' cannot create initiatives. ` +
      'Only organization and admin users have this permission.'
    );
  }
  
  return true;
}
```

### Migration Rollback

The migration includes a rollback script to restore the original policy if needed:

```sql
-- Rollback script
DROP POLICY IF EXISTS "Organization users can create their initiatives" ON initiatives;
DROP POLICY IF EXISTS "Admin users can create any initiative" ON initiatives;

CREATE POLICY "Organizations can create initiatives"
  ON initiatives FOR INSERT
  WITH CHECK (
    auth.uid() = organization_id AND 
    (SELECT role FROM users WHERE id = auth.uid()) IN ('organization', 'admin')
  );
```

## Testing Strategy

### Unit Tests

Test the service layer validation:

```typescript
describe('Initiative Creation Validation', () => {
  it('should validate organization users can create initiatives', async () => {
    const orgUser = { id: 'org-123', role: 'organization' };
    const result = await validateUserCanCreateInitiative(orgUser.id);
    expect(result).toBe(true);
  });
  
  it('should validate admin users can create initiatives', async () => {
    const adminUser = { id: 'admin-123', role: 'admin' };
    const result = await validateUserCanCreateInitiative(adminUser.id);
    expect(result).toBe(true);
  });
  
  it('should reject community users', async () => {
    const communityUser = { id: 'comm-123', role: 'community' };
    await expect(validateUserCanCreateInitiative(communityUser.id))
      .rejects.toThrow('cannot create initiatives');
  });
  
  it('should reject individual users', async () => {
    const individualUser = { id: 'ind-123', role: 'individual' };
    await expect(validateUserCanCreateInitiative(individualUser.id))
      .rejects.toThrow('cannot create initiatives');
  });
});
```

### Integration Tests

Test the complete flow with actual database:

```typescript
describe('Initiative RLS Policy Integration', () => {
  it('should allow organization user to create their initiative', async () => {
    // Setup: Create org user and authenticate
    const orgUser = await createTestUser('organization');
    await authenticateAs(orgUser);
    
    // Test: Create initiative
    const initiative = {
      title: 'Test Initiative',
      forest: 'kakamega',
      target_trees: 100,
      start_date: '2025-01-01',
      location: { lat: -0.3, lng: 34.8 },
      organization_id: orgUser.id
    };
    
    const result = await createInitiative(initiative);
    expect(result).toBeDefined();
    expect(result.organization_id).toBe(orgUser.id);
  });
  
  it('should allow admin to create initiative for any organization', async () => {
    // Setup: Create admin and org users
    const adminUser = await createTestUser('admin');
    const orgUser = await createTestUser('organization');
    await authenticateAs(adminUser);
    
    // Test: Admin creates initiative for org
    const initiative = {
      title: 'Admin Created Initiative',
      forest: 'karura',
      target_trees: 200,
      start_date: '2025-01-01',
      location: { lat: -1.2, lng: 36.8 },
      organization_id: orgUser.id
    };
    
    const result = await createInitiative(initiative);
    expect(result).toBeDefined();
    expect(result.organization_id).toBe(orgUser.id);
  });
  
  it('should reject community user creating initiative', async () => {
    // Setup: Create community user
    const communityUser = await createTestUser('community');
    await authenticateAs(communityUser);
    
    // Test: Attempt to create initiative
    const initiative = {
      title: 'Should Fail',
      forest: 'mau',
      target_trees: 50,
      start_date: '2025-01-01',
      location: { lat: -0.5, lng: 35.5 },
      organization_id: communityUser.id
    };
    
    await expect(createInitiative(initiative))
      .rejects.toThrow('Permission denied');
  });
  
  it('should reject organization creating initiative for another org', async () => {
    // Setup: Create two org users
    const org1 = await createTestUser('organization');
    const org2 = await createTestUser('organization');
    await authenticateAs(org1);
    
    // Test: Org1 tries to create initiative for Org2
    const initiative = {
      title: 'Cross-Org Initiative',
      forest: 'kakamega',
      target_trees: 100,
      start_date: '2025-01-01',
      location: { lat: -0.3, lng: 34.8 },
      organization_id: org2.id
    };
    
    await expect(createInitiative(initiative))
      .rejects.toThrow('Permission denied');
  });
});
```

### Manual Testing Checklist

1. **Organization User Test**
   - Log in as organization user
   - Navigate to Create Initiative page
   - Fill in all required fields
   - Submit form
   - Verify initiative is created successfully

2. **Admin User Test**
   - Log in as admin user
   - Navigate to Create Initiative page
   - Select different organization from dropdown
   - Submit form
   - Verify initiative is created for selected organization

3. **Community User Test**
   - Log in as community user
   - Attempt to access Create Initiative page
   - Verify appropriate error message or redirect

4. **Individual User Test**
   - Log in as individual user
   - Attempt to access Create Initiative page
   - Verify appropriate error message or redirect

5. **Existing Initiatives Test**
   - Query all existing initiatives
   - Verify all can still be read
   - Verify filtering by forest still works
   - Verify organization-specific queries still work

## Deployment Plan

### Pre-Deployment

1. Backup current RLS policies
2. Test migration on staging environment
3. Verify all test cases pass
4. Document rollback procedure

### Deployment Steps

1. Apply migration `020_fix_initiative_rls_policy.sql`
2. Verify policy is active: `SELECT * FROM pg_policies WHERE tablename = 'initiatives'`
3. Test with organization user account
4. Test with admin user account
5. Monitor error logs for RLS violations

### Post-Deployment

1. Monitor initiative creation success rate
2. Check for any RLS-related errors in logs
3. Verify existing initiatives remain accessible
4. Update documentation with new policy details

### Rollback Procedure

If issues occur:
1. Execute rollback script from migration file
2. Verify original policy is restored
3. Investigate root cause
4. Update fix and retest before redeployment
