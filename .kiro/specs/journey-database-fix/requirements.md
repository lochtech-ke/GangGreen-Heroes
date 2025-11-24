# Requirements Document

## Introduction

The Individual User Journey feature requires database tables to track user progress through the platform's five journey stages (Awareness, Activation, Action, Verification, Legacy). Currently, the journey service code exists and attempts to query these tables, but the database migrations were never created, causing "Failed to fetch journey progress" errors when users click "Start my journey". This feature will create the missing database migrations to support the journey tracking functionality.

## Glossary

- **Gang Green Platform**: The digital platform for environmental conservation and community engagement
- **Journey Service**: The service that manages user progression through journey stages
- **User Journey Progress**: A database record tracking a user's current stage, completed milestones, and metrics
- **Journey Stage**: One of five phases in the user journey (Awareness, Activation, Action, Verification, Legacy)
- **Supabase**: The Backend-as-a-Service platform providing PostgreSQL database
- **Migration**: A database schema change script that creates or modifies tables

## Requirements

### Requirement 1: User Journey Progress Table

**User Story:** As a system, I want to store user journey progress data, so that users can track their progression through the platform stages.

#### Acceptance Criteria

1. THE Gang Green Platform SHALL create a `user_journey_progress` table with columns for user_id, current_stage, stage_progress, completed_milestones, joined_causes, total_points, trees_planted, challenges_completed, and referral_count
2. THE Gang Green Platform SHALL enforce a unique constraint on user_id to ensure one journey record per user
3. THE Gang Green Platform SHALL create an index on user_id for efficient lookups
4. THE Gang Green Platform SHALL create an index on current_stage for analytics queries
5. THE Gang Green Platform SHALL set default values for all numeric and array columns
6. THE Gang Green Platform SHALL automatically set created_at and updated_at timestamps

### Requirement 2: Row Level Security Policies

**User Story:** As a user, I want my journey progress data to be secure, so that only I can view and modify my own journey data.

#### Acceptance Criteria

1. THE Gang Green Platform SHALL allow users to read their own journey progress records
2. THE Gang Green Platform SHALL allow users to update their own journey progress records
3. THE Gang Green Platform SHALL allow authenticated users to insert their own journey progress records
4. THE Gang Green Platform SHALL prevent users from accessing other users' journey progress data
5. THE Gang Green Platform SHALL allow service role to bypass RLS for system operations

### Requirement 3: Database Migration Deployment

**User Story:** As a developer, I want to deploy the journey progress table migration, so that the journey feature becomes functional in production.

#### Acceptance Criteria

1. THE Gang Green Platform SHALL create a migration file numbered sequentially after existing migrations
2. THE Gang Green Platform SHALL include rollback SQL in the migration for safe deployment
3. THE Gang Green Platform SHALL provide deployment instructions for the migration
4. WHEN the migration is applied, THE Gang Green Platform SHALL create all tables and policies without errors
5. THE Gang Green Platform SHALL verify the migration by querying the new table structure
