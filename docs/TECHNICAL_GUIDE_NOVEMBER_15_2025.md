# #GangGreen Platform - Technical Guide

**Last Updated**: November 15, 2025  
**Version**: 3.1  
**Status**: Sprint 3 - Initiative Participation System Complete

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Initiative Management System](#initiative-management-system)
4. [Participation System](#participation-system)
5. [Database Schema](#database-schema)
6. [API Services](#api-services)
7. [Component Architecture](#component-architecture)
8. [Testing](#testing)

---

## Architecture Overview

The #GangGreen platform uses a modern React + TypeScript frontend with Supabase backend, featuring comprehensive initiative management with geospatial tracking and participant engagement.

**Key Layers**:
- Client Layer: React 18 + TypeScript + Vite
- Service Layer: TypeScript services with Supabase client
- Backend: Supabase (PostgreSQL + PostGIS + Auth + Storage)
- Geospatial: Leaflet.js for interactive maps

---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Maps**: Leaflet.js 1.9.4 + react-leaflet 4.2.1
- **Testing**: Vitest 4.0.8, Testing Library 16.3.0

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage)
- **Database**: PostgreSQL 15 with PostGIS
- **Authentication**: Supabase Auth with JWT

---

## Initiative Management System

### Overview

Complete system for creating and managing tree planting initiatives with geospatial tracking, participant management, and progress monitoring.

**Status**: ✅ Complete

### Core Components

1. **InitiativeCard** - Summary display
2. **InitiativeList** - Browse with filters
3. **InitiativeForm** - Create with map picker
4. **InitiativeDetails** - Full details page
5. **InitiativeMap** - Interactive map view
6. **LocationPicker** - Location selection
7. **ForestBoundaryMap** - Forest visualization
8. **ForestSelector** - Forest choice UI

---

## Participation System

### Overview

Complete participation system enabling community members to join initiatives, track contributions, and celebrate milestones.

**Status**: ✅ Complete (Task 5.4 - November 15, 2025)

### Components

#### 1. JoinInitiativeButton

**Purpose**: Smart button for joining/leaving initiatives

**Features**:
- Adapts to participation status
- Confirmation dialog before leaving
- Only shows for active initiatives
- Loading states and error handling

**Props**:
```typescript
interface JoinInitiativeButtonProps {
  initiativeId: string;
  userId: string;
  isParticipant: boolean;
  initiativeStatus: 'active' | 'completed' | 'paused';
  onJoin?: () => void;
  onLeave?: () => void;
  className?: string;
}
```

**Usage**:
```typescript
<JoinInitiativeButton
  initiativeId={initiativeId}
  userId={user.id}
  isParticipant={isParticipant}
  initiativeStatus={initiative.status}
  onJoin={() => refreshData()}
  onLeave={() => refreshData()}
/>
```

#### 2. ParticipantList

**Purpose**: Display initiative participants with contributions

**Features**:
- Avatar placeholders
- Join dates
- Contribution counts
- Configurable max display
- Empty state handling

**Props**:
```typescript
interface ParticipantListProps {
  initiativeId: string;
  showContributions?: boolean;
  maxDisplay?: number;
}
```

#### 3. ContributionTracker

**Purpose**: Track and update tree contributions

**Features**:
- Display/edit modes
- Large number display
- Validation (no negatives)
- Success feedback (auto-dismiss)
- Error handling

**Props**:
```typescript
interface ContributionTrackerProps {
  initiativeId: string;
  userId: string;
  currentContribution: number;
  onUpdate?: (newContribution: number) => void;
}
```

#### 4. MilestoneNotifications

**Purpose**: Celebrate milestone achievements

**Features**:
- Milestones at 25%, 50%, 75%, 90%, 100%
- Animated alerts for new milestones
- Color-coded progress cards
- Emoji indicators
- Auto-dismiss alerts (5 seconds)

**Props**:
```typescript
interface MilestoneNotificationsProps {
  initiative: Initiative;
  progress: InitiativeProgress;
  onMilestoneReached?: (milestone: Milestone) => void;
}
```

**Milestone Icons**:
- 25%: 🌱 "Quarter way there!"
- 50%: 🌳 "Halfway to the goal!"
- 75%: 🌲 "Three quarters complete!"
- 90%: 🎯 "Almost there!"
- 100%: 🎉 "Goal achieved!"

### Participation Flow

**Joining**:
```
User clicks "Join" → Service call → Database insert → 
Success callback → UI refresh → "Participating" badge
```

**Updating Contribution**:
```
User clicks "Update" → Form displays → User enters value →
Service call → Database update → Progress recalculates →
Milestone check → Alert if new milestone
```

**Leaving**:
```
User clicks "Leave" → Confirmation dialog → User confirms →
Service call → Database delete → Success callback → UI refresh
```

---

## Database Schema

### initiative_participants

```sql
CREATE TABLE initiative_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trees_contributed INTEGER DEFAULT 0 CHECK (trees_contributed >= 0),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(initiative_id, user_id)
);

CREATE INDEX idx_participants_initiative ON initiative_participants(initiative_id);
CREATE INDEX idx_participants_user ON initiative_participants(user_id);
```

**Row Level Security**:
```sql
-- Anyone can view participants
CREATE POLICY "Anyone can view participants"
  ON initiative_participants FOR SELECT USING (true);

-- Users can join as themselves
CREATE POLICY "Users can join initiatives"
  ON initiative_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own contributions
CREATE POLICY "Users can update own contributions"
  ON initiative_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can leave initiatives
CREATE POLICY "Users can leave initiatives"
  ON initiative_participants FOR DELETE
  USING (auth.uid() = user_id);
```

---

## API Services

### Initiative Service - Participation Methods

```typescript
class InitiativeService {
  // Join initiative
  async joinInitiative(
    initiativeId: string,
    userId: string
  ): Promise<ParticipantResponse>;

  // Leave initiative
  async leaveInitiative(
    initiativeId: string,
    userId: string
  ): Promise<{ error: Error | null }>;

  // Get participants
  async getParticipants(initiativeId: string): Promise<{
    participants: InitiativeParticipant[];
    error: Error | null;
  }>;

  // Update contribution
  async updateParticipantContribution(
    initiativeId: string,
    userId: string,
    treesContributed: number
  ): Promise<ParticipantResponse>;

  // Calculate progress (for milestones)
  async calculateProgress(
    initiativeId: string
  ): Promise<InitiativeProgress | null>;
}
```

---

## Component Architecture

### Initiative Components (12 total)

```
src/components/initiatives/
├── InitiativeCard.tsx           (150 lines)
├── InitiativeList.tsx           (180 lines)
├── InitiativeForm.tsx           (280 lines)
├── InitiativeDetails.tsx        (320 lines)
├── ForestSelector.tsx           (100 lines)
├── InitiativeMap.tsx            (200 lines)
├── LocationPicker.tsx           (180 lines)
├── ForestBoundaryMap.tsx        (150 lines)
├── ParticipantList.tsx          (150 lines) ✨ NEW
├── ContributionTracker.tsx      (150 lines) ✨ NEW
├── JoinInitiativeButton.tsx     (150 lines) ✨ NEW
├── MilestoneNotifications.tsx   (200 lines) ✨ NEW
├── index.ts
└── README.md                    (500+ lines)
```

**Total**: ~2,510 lines of code

### Integration Example

```typescript
function InitiativeDetails({ initiativeId, currentUserId }) {
  return (
    <div>
      {/* Header with join button */}
      <JoinInitiativeButton
        initiativeId={initiativeId}
        userId={currentUserId}
        isParticipant={isParticipant}
        initiativeStatus={initiative.status}
      />

      {/* Milestones */}
      <MilestoneNotifications
        initiative={initiative}
        progress={progress}
      />

      {/* Contribution tracker (participants only) */}
      {isParticipant && (
        <ContributionTracker
          initiativeId={initiativeId}
          userId={currentUserId}
          currentContribution={currentParticipant.trees_contributed}
        />
      )}

      {/* Participants */}
      <ParticipantList
        initiativeId={initiativeId}
        maxDisplay={10}
      />
    </div>
  );
}
```

---

## Testing

### Current Coverage

- Auth service: 90%
- LoginForm: 85%
- RegisterForm: 85%
- Profile service: 80%

### Pending (Task 5.5)

- Initiative service tests
- 12 initiative component tests
- Participation feature tests
- Map component tests
- Integration tests

**Target**: 80% overall coverage

---

## Performance

- Initial load: < 3 seconds
- API response: < 500ms
- Map rendering: < 1 second
- Milestone animation: < 500ms

---

## Future Enhancements

1. **Initiative Tests** (Task 5.5) - Next
2. Push notifications for milestones
3. Email notifications
4. Social media sharing
5. Leaderboards
6. Team challenges

---

**Document Version**: 3.1  
**Last Updated**: November 15, 2025  
**Next Update**: Upon completion of Task 5.5
