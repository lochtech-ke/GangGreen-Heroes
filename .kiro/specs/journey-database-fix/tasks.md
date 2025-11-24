# Implementation Plan: Journey Database Fix

## Overview
This implementation plan creates the missing database infrastructure for the Individual User Journey feature. The journey service code already exists but cannot function because the required database table was never created. This plan focuses solely on creating the database migration and verifying it works correctly.

- [x] 1. Create journey progress database migration


- [x] 1.1 Create migration file with table structure


  - Create `supabase/migrations/025_create_journey_progress_table.sql`
  - Add CREATE TABLE statement for `user_journey_progress` with all required columns
  - Add unique constraint on user_id
  - Add CHECK constraint for valid stage values
  - Add foreign key constraint to users table with CASCADE delete
  - Set appropriate default values for all columns
  - _Requirements: 1.1, 1.2, 1.5, 1.6_

- [x] 1.2 Add indexes for performance

  - Create index on user_id for primary lookups
  - Create index on current_stage for analytics queries
  - Create composite index on (user_id, current_stage)
  - _Requirements: 1.3, 1.4_


- [x] 1.3 Implement automatic timestamp updates

  - Create function `update_journey_updated_at()` to set updated_at
  - Create trigger to call function on UPDATE operations
  - _Requirements: 1.6_



- [x] 1.4 Configure Row Level Security policies

  - Enable RLS on user_journey_progress table
  - Create policy for users to SELECT their own records
  - Create policy for users to UPDATE their own records
  - Create policy for users to INSERT their own records
  - Create policy for service role to bypass RLS

  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_



- [x] 1.5 Add rollback script

  - Add DROP statements for trigger, function, and table
  - Include CASCADE to handle dependencies
  - Document rollback procedure
  - _Requirements: 3.2_

- [x] 2. Create deployment documentation


- [x] 2.1 Write deployment guide


  - Create `supabase/migrations/DEPLOY_025_GUIDE.md`
  - Document prerequisites and deployment steps
  - Include verification queries
  - Add troubleshooting section
  - _Requirements: 3.3_




- [x] 2.2 Add verification queries

  - Add query to verify table exists
  - Add query to verify columns and types
  - Add query to verify indexes
  - Add query to verify RLS policies
  - _Requirements: 3.5_





- [x] 3. Test migration locally



- [x] 3.1 Apply migration to local database


  - Run migration using Supabase CLI or SQL editor
  - Verify no errors during execution
  - Check that table is created successfully
  - _Requirements: 3.4_

- [x] 3.2 Verify table structure

  - Query information_schema to verify columns
  - Verify data types match design
  - Verify default values are set correctly
  - Verify constraints are in place
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 3.3 Test RLS policies


  - Create test user and journey record
  - Verify user can read their own record
  - Verify user can update their own record
  - Verify user cannot access other users' records
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.4 Test journey service integration


  - Test journeyService.initializeJourney() creates record
  - Test journeyService.getJourneyProgress() retrieves record
  - Test journeyService.trackAction() updates record
  - Test journeyService.advanceStage() changes stage
  - Verify no 404 errors occur
  - _Requirements: 1.1, 2.1, 2.2_

- [ ]* 3.5 Write integration tests
  - Test journey initialization for new user
  - Test unique constraint enforcement
  - Test RLS policy enforcement
  - Test cascade delete when user is deleted
  - Test concurrent updates to same record
  - _Requirements: 1.2, 2.1, 2.4_

- [x] 4. Deploy to production



- [x] 4.1 Review migration before deployment


  - Review SQL syntax for errors
  - Verify rollback script is ready
  - Check that migration number is sequential
  - _Requirements: 3.1, 3.2_

- [x] 4.2 Deploy migration to production



  - Apply migration using Supabase dashboard or CLI
  - Monitor for errors during execution
  - Verify successful completion
  - _Requirements: 3.4_


- [x] 4.3 Verify production deployment


  - Run verification queries on production database
  - Test journey feature in production UI
  - Verify "Start my journey" button works
  - Check logs for any errors
  - _Requirements: 3.5_

- [x] 4.4 Update individual-user-journey spec


  - Mark task 1.1 as properly complete in `.kiro/specs/individual-user-journey/tasks.md`
  - Document that database migration is now deployed
  - _Requirements: 3.4_

- [ ] 5. Checkpoint - Verify journey feature is working
  - Ensure all tests pass
  - Verify no 404 errors when clicking "Start my journey"
  - Confirm journey progress is being tracked correctly
  - Ask the user if questions arise
