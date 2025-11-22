# Requirements Document

## Introduction

This document outlines the requirements for fixing the Row-Level Security (RLS) policy issue that prevents users from creating initiatives in the GangGreen platform. The current RLS policy is too restrictive and causes "new row violates row-level security policy for table 'initiatives'" errors when users attempt to create initiatives.

## Glossary

- **RLS (Row-Level Security)**: PostgreSQL feature that controls access to rows in a table based on user authentication and authorization
- **Initiative**: A conservation project in one of the three pilot forests (Kakamega, Karura, or Mau)
- **Organization User**: A user with role 'organization' who can create and manage initiatives
- **Admin User**: A user with role 'admin' who has full platform access
- **Community User**: A user with role 'community' who can participate in initiatives
- **Individual User**: A user with role 'individual' who can participate in initiatives
- **Supabase Auth**: The authentication system that manages user sessions
- **auth.uid()**: Function that returns the currently authenticated user's ID

## Requirements

### Requirement 1

**User Story:** As an organization user, I want to create new conservation initiatives, so that I can coordinate tree planting activities in my chosen forest.

#### Acceptance Criteria

1. WHEN an authenticated user with role 'organization' attempts to create an initiative THEN the system SHALL allow the insertion if the organization_id matches their user ID
2. WHEN an authenticated user with role 'admin' attempts to create an initiative THEN the system SHALL allow the insertion regardless of the organization_id value
3. WHEN the RLS policy evaluates user permissions THEN the system SHALL handle cases where the user record exists in the users table
4. WHEN the RLS policy evaluates user permissions THEN the system SHALL provide clear error messages if the user lacks required permissions
5. WHEN a user creates an initiative THEN the system SHALL automatically set the organization_id to the authenticated user's ID

### Requirement 2

**User Story:** As a community or individual user, I want to be prevented from creating initiatives, so that only authorized organizations can manage conservation projects.

#### Acceptance Criteria

1. WHEN an authenticated user with role 'community' attempts to create an initiative THEN the system SHALL reject the insertion with a clear error message
2. WHEN an authenticated user with role 'individual' attempts to create an initiative THEN the system SHALL reject the insertion with a clear error message
3. WHEN an unauthenticated user attempts to create an initiative THEN the system SHALL reject the insertion
4. WHEN a user without a role in the users table attempts to create an initiative THEN the system SHALL reject the insertion

### Requirement 3

**User Story:** As a developer, I want the RLS policy to be efficient and maintainable, so that database performance remains optimal and future changes are straightforward.

#### Acceptance Criteria

1. WHEN the RLS policy executes THEN the system SHALL minimize subquery complexity to optimize performance
2. WHEN the RLS policy is defined THEN the system SHALL use clear, readable SQL that follows PostgreSQL best practices
3. WHEN the RLS policy is updated THEN the system SHALL provide a migration script that can be safely applied to production
4. WHEN the RLS policy fails THEN the system SHALL log sufficient information for debugging
5. WHEN testing the RLS policy THEN the system SHALL provide test cases for all user roles

### Requirement 4

**User Story:** As a system administrator, I want to verify that the RLS fix works correctly, so that I can confidently deploy it to production.

#### Acceptance Criteria

1. WHEN the migration is applied THEN the system SHALL successfully update the RLS policy without data loss
2. WHEN testing with an organization user THEN the system SHALL allow initiative creation
3. WHEN testing with an admin user THEN the system SHALL allow initiative creation
4. WHEN testing with a community user THEN the system SHALL prevent initiative creation
5. WHEN testing with an individual user THEN the system SHALL prevent initiative creation
6. WHEN existing initiatives are queried THEN the system SHALL maintain all existing read permissions
