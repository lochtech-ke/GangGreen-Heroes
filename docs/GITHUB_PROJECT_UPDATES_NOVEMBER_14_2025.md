# GitHub Project Board Updates - November 14, 2025

**Date**: November 14, 2025  
**Trigger**: Onboarding Chatbot Requirements Update  
**Change Type**: Feature Enhancement - Post-Registration Profile Setup

---

## Overview

The Onboarding Chatbot specification has been enhanced to include **post-registration profile setup** functionality. This addition transforms the chatbot from a passive FAQ system into an active onboarding assistant that guides new users through profile completion immediately after registration.

---

## Changes Summary

### Requirement 0 Added: Post-Registration Profile Setup

**New User Story**: As a new user who just registered with email and password, I want to complete my profile through a conversational chatbot, so that I can provide additional information in a friendly, guided manner.

**Impact**: This enhancement creates a seamless onboarding experience where users who register with minimal information (email/password only) are immediately guided through profile completion via the chatbot interface.

---

## Task Updates

### Task 31: Onboarding Chatbot

**Status**: 📋 Planned → 📋 Planned (Enhanced)  
**Priority**: P2 (Medium) → P1 (High)  
**Estimate**: 21 days → 24 days (+3 days)  
**Dependencies**: Task 3 (Authentication) ✅ Complete

#### New Subtasks Added

**Task 31.11: Implement Post-Registration Profile Flow** (NEW)
- **Estimate**: 2 days
- **Description**: Build conversational profile completion flow
- **Deliverables**:
  - Profile completion dialog component
  - Sequential question flow (name, role, forest, phone, location, org)
  - Input validation for each field
  - Skip logic for optional fields
  - Profile data persistence to user_profiles table
  - Success/failure handling
  - Transition to general help mode

**Task 31.12: Integrate with Registration Flow** (NEW)
- **Estimate**: 1 day
- **Description**: Connect chatbot to registration completion
- **Deliverables**:
  - Auto-open chatbot after registration
  - Detect incomplete profiles
  - Trigger onboarding flow
  - Handle profile completion state
  - Update RegisterPage component

**Task 31.13: Add Profile Completion Tests** (NEW)
- **Estimate**: 1 day (included in Task 31.10)
- **Description**: Test profile completion flow
- **Deliverables**:
  - Unit tests for profile flow logic
  - Integration tests for registration → profile flow
  - Validation tests for each field
  - Skip logic tests
  - Error handling tests

#### Updated Acceptance Criteria

**Requirement 0 Acceptance Criteria** (9 new criteria):
1. Auto-open chatbot after email/password registration
2. Greet user by name and explain profile completion
3. Ask one question at a time conversationally
4. Collect: full name, account type, forest preference, phone, location, organization
5. Validate input and request clarification if invalid
6. Acknowledge skipped optional fields
7. Save profile data to user_profiles table
8. Display welcome message on success
9. Offer retry or defer on failure

---

## Updated Task Breakdown

### Task 31: Onboarding Chatbot (Enhanced)

| Subtask | Description | Estimate | Status |
|---------|-------------|----------|--------|
| 31.1 | Set up chatbot project structure | 1d | 📋 Planned |
| 31.2 | Create knowledge base JSON | 1d | 📋 Planned |
| 31.3 | Implement semantic matcher | 3d | 📋 Planned |
| 31.4 | Build context manager | 2d | 📋 Planned |
| 31.5 | Create response generator | 2d | 📋 Planned |
| 31.6 | Implement escalation handler | 2d | 📋 Planned |
| 31.7 | Build chat widget UI | 3d | 📋 Planned |
| 31.8 | Add accessibility features | 2d | 📋 Planned |
| 31.9 | Integrate with main app | 2d | 📋 Planned |
| 31.10 | Write chatbot tests | 3d | 📋 Planned |
| **31.11** | **Implement post-registration profile flow** | **2d** | **📋 Planned** |
| **31.12** | **Integrate with registration flow** | **1d** | **📋 Planned** |

**Total Estimate**: 24 days (was 21 days)  
**Change**: +3 days for profile completion feature

---

## Requirements Impact

### New Requirement Added

**Requirement 0**: Post-Registration Profile Setup
- **Priority**: P0 (Critical for user onboarding)
- **User Story**: Conversational profile completion after registration
- **Acceptance Criteria**: 9 criteria covering auto-trigger, sequential questions, validation, persistence, and error handling

### Existing Requirements (Unchanged)

- **Requirement 1**: Getting Started (4 FAQs)
- **Requirement 2**: Finding Projects (4 FAQs)
- **Requirement 3**: Education & Gamification (3 FAQs)
- **Requirement 4**: Community Building (3 FAQs)
- **Requirement 5**: Impact Verification (3 FAQs)
- **Requirement 6**: Sponsorship & Partnerships (3 FAQs)
- **Requirement 7**: Future Engagement (3 FAQs)
- **Requirement 8**: Troubleshooting (3 FAQs)
- **Requirement 9**: Context Management
- **Requirement 10**: Escalation to Human Support
- **Requirement 11**: JSON Knowledge Base

**Total Requirements**: 11 (was 10)

---

## Component Architecture Updates

### New Components

**ProfileCompletionFlow Component**
```typescript
interface ProfileCompletionFlowProps {
  userId: string;
  userEmail: string;
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

// Features:
// - Sequential question presentation
// - Input validation per field
// - Progress indicator
// - Skip optional fields
// - Save to database
// - Error handling
```

**ProfileQuestion Component**
```typescript
interface ProfileQuestionProps {
  question: string;
  fieldName: string;
  fieldType: 'text' | 'select' | 'tel';
  options?: string[];
  required: boolean;
  onAnswer: (value: string) => void;
  onSkip: () => void;
}
```

### Updated Components

**ChatWidget Component** (Enhanced)
- Add `mode` prop: 'faq' | 'profile-completion'
- Auto-switch to profile completion mode after registration
- Detect incomplete profiles on mount
- Trigger profile flow for new users

**RegisterPage Component** (Enhanced)
- Detect successful registration
- Auto-open chatbot with profile completion mode
- Pass user data to chatbot
- Handle profile completion callback

---

## Database Schema Impact

### No Schema Changes Required

The existing `user_profiles` table already supports all required fields:
- ✅ `full_name` (TEXT)
- ✅ `phone` (TEXT, optional)
- ✅ `organization` (TEXT, optional)
- ✅ `location` (TEXT, optional)

The `users` table already has:
- ✅ `role` (TEXT with CHECK constraint)
- ✅ `forest_preference` (TEXT with CHECK constraint)

**No migration needed** - existing schema is sufficient.

---

## User Flow Updates

### New User Registration Flow

**Before Enhancement**:
```
1. User visits /register
2. User fills registration form (email, password, name, role, etc.)
3. User submits form
4. Account created
5. User redirected to /dashboard
```

**After Enhancement**:
```
1. User visits /register
2. User fills minimal registration form (email, password only)
3. User submits form
4. Account created
5. Chatbot auto-opens in profile completion mode
6. Chatbot asks for: name, role, forest, phone, location, org
7. User answers conversationally
8. Profile saved to database
9. Chatbot transitions to general help mode
10. User can close chatbot and explore dashboard
```

**Benefits**:
- ✅ Reduced initial friction (email/password only)
- ✅ Conversational, friendly onboarding
- ✅ Progressive disclosure of information
- ✅ Optional fields can be skipped naturally
- ✅ Immediate engagement with chatbot
- ✅ Better completion rates

---

## Implementation Priority

### Recommended Implementation Order

**Phase 1: Core Chatbot (Original Plan)**
1. Task 31.1-31.6: Build chatbot engine (11 days)
2. Task 31.7-31.8: Build chat widget UI (5 days)
3. Task 31.9: Integrate with main app (2 days)

**Phase 2: Profile Completion (New)**
4. Task 31.11: Implement profile completion flow (2 days)
5. Task 31.12: Integrate with registration (1 day)

**Phase 3: Testing & Polish**
6. Task 31.10: Write comprehensive tests (3 days)

**Total**: 24 days

### Alternative: MVP Approach

If timeline is constrained, implement in two releases:

**Release 1: FAQ Chatbot Only** (21 days)
- Tasks 31.1-31.10 (original scope)
- Deploy FAQ functionality first
- Gather user feedback

**Release 2: Profile Completion** (3 days)
- Tasks 31.11-31.12
- Add profile completion feature
- Enhance based on Release 1 feedback

---

## Testing Strategy Updates

### New Test Cases

**Profile Completion Flow Tests**:
- ✅ Auto-open chatbot after registration
- ✅ Display welcome message with user name
- ✅ Ask questions in correct sequence
- ✅ Validate each field type (text, select, tel)
- ✅ Handle invalid input gracefully
- ✅ Allow skipping optional fields
- ✅ Save complete profile to database
- ✅ Handle save errors with retry option
- ✅ Transition to general help mode on success

**Integration Tests**:
- ✅ Registration → Profile Completion → Dashboard flow
- ✅ Profile completion → Skip → Complete later from settings
- ✅ Profile completion → Error → Retry flow
- ✅ Incomplete profile detection on login

**Edge Cases**:
- ✅ User closes chatbot mid-profile completion
- ✅ User refreshes page during profile completion
- ✅ Network error during profile save
- ✅ User already has complete profile (skip flow)

---

## Documentation Updates Required

### Technical Guide Updates

**New Sections to Add**:
1. **Profile Completion Flow Architecture**
   - Component diagram
   - State management
   - Data flow
   - Error handling

2. **ProfileCompletionFlow Component**
   - Props interface
   - Usage examples
   - Question sequence logic
   - Validation rules

3. **Integration with Registration**
   - Auto-trigger logic
   - Profile detection
   - State management

### User Guide Updates

**New Sections to Add**:
1. **Simplified Registration**
   - Email and password only
   - Chatbot-guided profile completion
   - Optional field skipping

2. **Profile Completion via Chatbot**
   - What to expect after registration
   - Questions asked
   - How to skip optional fields
   - Completing profile later

---

## Sprint Planning Impact

### Current Sprint Status

**Sprint 2: Authentication & Core Setup (Week 3)** 🚧 50% COMPLETE
- ✅ Task 3.3: Create authentication context and hooks (COMPLETE)
- 🚧 Task 3.4: Write authentication tests (IN PROGRESS - 60%)
- 🎯 Task 2.2: Configure RLS policies (READY)
- 🎯 Task 2.3: Set up Storage buckets (READY)

### Chatbot Sprint Planning

**Original Plan**: Sprint 6 or later (Week 13+)

**Recommendation**: Keep in Sprint 6, but prioritize higher due to onboarding impact

**Rationale**:
- Profile completion enhances user onboarding significantly
- Reduces friction in registration process
- Improves user engagement from day one
- Should be implemented before public launch

**Updated Priority**: P2 → P1 (High Priority)

---

## Milestone Updates

### Milestone 6: Quality & Launch (Weeks 13-15)

**Before**:
- Testing and QA
- Security audit
- Performance optimization
- Documentation finalization
- Deployment preparation

**After** (Enhanced):
- Testing and QA
- Security audit
- Performance optimization
- **Onboarding Chatbot implementation** (24 days)
- Documentation finalization
- Deployment preparation

**Impact**: May extend Milestone 6 by 1-2 weeks if chatbot is prioritized for launch.

---

## Risk Assessment

### New Risks Introduced

**1. Increased Complexity** (Low)
- **Risk**: Profile completion adds complexity to registration flow
- **Mitigation**: Thorough testing, clear error handling, fallback to manual profile editing
- **Impact**: Low - feature is well-scoped and isolated

**2. User Experience** (Low)
- **Risk**: Users may find chatbot onboarding intrusive
- **Mitigation**: Allow skipping, provide "complete later" option, make chatbot dismissible
- **Impact**: Low - conversational approach is generally well-received

**3. Timeline Extension** (Low)
- **Risk**: +3 days may impact Sprint 6 timeline
- **Mitigation**: Can implement in two phases (FAQ first, profile completion second)
- **Impact**: Low - 3 days is manageable within 15-week timeline

### Risk Mitigation Strategies

1. **Implement Skip/Defer Option**: Users can complete profile later from settings
2. **Graceful Degradation**: If chatbot fails, show traditional profile form
3. **Progressive Enhancement**: FAQ chatbot works independently of profile completion
4. **User Testing**: Test onboarding flow with real users before launch
5. **Analytics**: Track completion rates and user feedback

---

## Success Metrics

### Profile Completion Metrics

**Key Performance Indicators**:
- **Profile Completion Rate**: Target 80%+ (vs ~50% for traditional forms)
- **Time to Complete Profile**: Target < 2 minutes
- **Skip Rate**: Track which fields are skipped most often
- **Error Rate**: Target < 5% validation errors
- **User Satisfaction**: Survey after onboarding (target 4+/5)

**Tracking Implementation**:
- Add analytics events for each profile question
- Track completion vs abandonment
- Monitor time spent per question
- Log validation errors
- Collect user feedback

---

## Recommendations

### Immediate Actions

1. **Update Task 31 in GitHub Project**
   - Add subtasks 31.11 and 31.12
   - Update estimate from 21 to 24 days
   - Change priority from P2 to P1

2. **Update Requirements Document**
   - ✅ Already updated with Requirement 0
   - Review and approve new acceptance criteria

3. **Update Design Document**
   - Add ProfileCompletionFlow component design
   - Update user flow diagrams
   - Add wireframes for profile completion UI

4. **Update Technical Guide**
   - Document profile completion architecture
   - Add component interfaces
   - Include integration examples

5. **Update User Guide**
   - Document simplified registration process
   - Explain chatbot-guided profile completion
   - Add screenshots/mockups

### Sprint 6 Planning

**When implementing Task 31**:
1. Implement core chatbot first (Tasks 31.1-31.9)
2. Test FAQ functionality thoroughly
3. Implement profile completion (Tasks 31.11-31.12)
4. Integrate with registration flow
5. Comprehensive testing (Task 31.10)
6. User acceptance testing
7. Deploy to production

**Timeline**: 24 days (approximately 5 weeks with testing)

---

## Labels to Apply

### Task 31 (Updated)
- 🎯 status: planned
- ✅ type: feature
- ✅ component: chatbot
- ✅ priority: P1 (was P2)
- ✅ milestone: Sprint 6
- 🆕 enhancement: onboarding

### New Subtasks
- **Task 31.11**: type: feature, component: chatbot, priority: P1
- **Task 31.12**: type: integration, component: chatbot, priority: P1

---

## Summary

The Onboarding Chatbot has been enhanced with **post-registration profile setup** functionality, transforming it from a passive FAQ system into an active onboarding assistant. This enhancement:

**Key Changes**:
- ✅ Added Requirement 0 (Post-Registration Profile Setup)
- ✅ Added 2 new subtasks (31.11, 31.12)
- ✅ Increased estimate by 3 days (21 → 24 days)
- ✅ Elevated priority from P2 to P1
- ✅ Enhanced user onboarding experience

**Benefits**:
- ✅ Reduced registration friction (email/password only)
- ✅ Conversational, friendly profile completion
- ✅ Higher profile completion rates expected
- ✅ Immediate user engagement with chatbot
- ✅ Progressive disclosure of information

**Impact**:
- ⚠️ +3 days to implementation timeline
- ⚠️ May extend Sprint 6 by 1 week
- ✅ No database schema changes required
- ✅ Isolated feature with low risk

**Recommendation**: Approve enhancement and prioritize for Sprint 6 implementation before public launch.

---

**Report Generated**: November 14, 2025  
**Next Update**: Upon Task 31 implementation start or further requirement changes

