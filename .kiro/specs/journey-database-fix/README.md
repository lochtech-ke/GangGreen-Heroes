# Journey Database Fix Spec

## Problem

When users click "Start my journey" on the Gang Green platform, they encounter an error: **"Failed to fetch journey progress"**. 

The root cause is that the `user_journey_progress` table doesn't exist in the database. The journey service code was implemented and is trying to query this table, but the database migration to create it was never executed.

## Solution

Create a database migration that establishes the `user_journey_progress` table with:
- Proper column structure matching the journey service expectations
- Unique constraint to ensure one journey per user
- Indexes for efficient queries
- Row Level Security policies for data protection
- Automatic timestamp updates

## Files in This Spec

- **requirements.md** - Defines what the database migration must accomplish
- **design.md** - Details the table structure, indexes, RLS policies, and deployment plan
- **tasks.md** - Step-by-step implementation tasks

## Quick Start

To fix the journey feature:

1. Review the tasks in `tasks.md`
2. Start with task 1.1 to create the migration file
3. Test locally (task 3)
4. Deploy to production (task 4)

## Related Specs

This spec fixes an incomplete implementation from:
- `.kiro/specs/individual-user-journey/` - The original journey feature spec

## Status

- [x] Requirements defined
- [x] Design completed
- [x] Tasks created
- [ ] Implementation started
- [ ] Migration deployed
- [ ] Feature verified working
