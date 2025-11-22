# Implementation Plan

- [ ] 1. Create database migration for RLS policy fix
  - Create migration file `020_fix_initiative_rls_policy.sql`
  - Drop existing "Organizations can create initiatives" policy
  - Create new "Organization users can create their initiatives" policy
  - Create new "Admin users can create any initiative" policy
  - Include rollback script in migration comments
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.3_

- [ ] 2. Update initiative service with validation and error handling
  - Add `validateUserCanCreateInitiative` function to check user role before insertion
  - Update `createInitiative` to automatically set organization_id if not provided
  - Enhance error messages for RLS policy violations
  - Add proper TypeScript error types for RLS violations
  - _Requirements: 1.4, 1.5, 3.1, 3.4_

- [ ]* 2.1 Write unit tests for initiative service validation
  - Test organization users can create initiatives
  - Test admin users can create initiatives
  - Test community users are rejected
  - Test individual users are rejected
  - Test users without roles are rejected
  - Test error messages are clear and helpful
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.4, 3.5_

- [ ] 3. Apply migration to database
  - Run migration on local development database
  - Verify policies are created correctly using `SELECT * FROM pg_policies WHERE tablename = 'initiatives'`
  - Test basic initiative creation with organization user
  - _Requirements: 4.1, 3.3_

- [ ]* 3.1 Write integration tests for RLS policies
  - Test organization user can create their initiative
  - Test admin can create initiative for any organization
  - Test community user is rejected
  - Test individual user is rejected
  - Test organization cannot create initiative for another organization
  - Test existing initiatives maintain read permissions
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 4. Update CreateInitiativePage component
  - Ensure organization_id is set from current user context
  - Add user-friendly error messages for permission issues
  - Add loading states during validation
  - Handle RLS errors gracefully in UI
  - _Requirements: 1.4, 1.5_

- [ ] 5. Manual testing and verification
  - Test as organization user creating initiative
  - Test as admin user creating initiative for different organization
  - Test as community user (should be blocked)
  - Test as individual user (should be blocked)
  - Verify existing initiatives are still readable
  - Verify all forest filters still work
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 6. Documentation updates
  - Update ARCHITECTURE.md with RLS policy details
  - Add troubleshooting section for RLS errors
  - Document user role requirements for initiative creation
  - Update deployment guide with migration instructions
  - _Requirements: 3.2, 3.3_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
