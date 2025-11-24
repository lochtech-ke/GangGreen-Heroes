# Initiative Components

This directory contains React components for managing tree planting initiatives in the GangGreen platform.

## Components

### InitiativeCard

A card component that displays a summary of an initiative.

**Props:**
- `initiative: Initiative` - The initiative data to display
- `onClick?: () => void` - Optional callback when card is clicked
- `showOrganization?: boolean` - Whether to show organization info (default: true)

**Usage:**
```tsx
import { InitiativeCard } from '@/components/initiatives';

<InitiativeCard
  initiative={initiative}
  onClick={() => navigate(`/initiatives/${initiative.id}`)}
/>
```

### InitiativeList

A list component that displays multiple initiatives with filtering capabilities.

**Props:**
- `filters?: InitiativeFilters` - Optional initial filters
- `onInitiativeClick?: (initiative: Initiative) => void` - Callback when an initiative is clicked

**Features:**
- Filter by forest (Kakamega, Karura, Mau)
- Filter by status (active, completed, paused)
- Search by title or description
- Responsive grid layout

**Usage:**
```tsx
import { InitiativeList } from '@/components/initiatives';

<InitiativeList
  filters={{ forest: 'kakamega', status: 'active' }}
  onInitiativeClick={(initiative) => console.log(initiative)}
/>
```

### InitiativeForm

A form component for creating new initiatives.

**Props:**
- `organizationId: string` - The ID of the organization creating the initiative
- `onSuccess?: (initiative: Initiative) => void` - Callback when initiative is created successfully
- `onCancel?: () => void` - Callback when form is cancelled
- `initialData?: Partial<CreateInitiativeData>` - Optional initial form data

**Features:**
- Full form validation
- Date range selection
- Location coordinates input
- Forest selection
- Target trees and area input

**Usage:**
```tsx
import { InitiativeForm } from '@/components/initiatives';

<InitiativeForm
  organizationId={user.id}
  onSuccess={(initiative) => {
    console.log('Initiative created:', initiative);
    navigate(`/initiatives/${initiative.id}`);
  }}
  onCancel={() => navigate('/initiatives')}
/>
```

### InitiativeDetails

A detailed view component for a single initiative.

**Props:**
- `initiativeId: string` - The ID of the initiative to display
- `onBack?: () => void` - Callback for back navigation
- `onJoin?: () => void` - Callback when user joins the initiative
- `currentUserId?: string` - Optional current user ID for join functionality

**Features:**
- Full initiative information display
- Progress tracking with visual indicators
- Participant list
- Join initiative functionality
- Timeline and location details

**Usage:**
```tsx
import { InitiativeDetails } from '@/components/initiatives';

<InitiativeDetails
  initiativeId={initiativeId}
  currentUserId={user?.id}
  onBack={() => navigate('/initiatives')}
  onJoin={() => console.log('Joined initiative')}
/>
```

### ForestSelector

A visual selector component for choosing a forest.

**Props:**
- `value: ForestPreference` - Currently selected forest
- `onChange: (forest: ForestPreference) => void` - Callback when selection changes
- `disabled?: boolean` - Whether the selector is disabled

**Features:**
- Visual cards for each forest
- Forest descriptions and area information
- Color-coded selection states

**Usage:**
```tsx
import { ForestSelector } from '@/components/initiatives';

<ForestSelector
  value={selectedForest}
  onChange={(forest) => setSelectedForest(forest)}
/>
```

### InitiativeMap

An interactive map component that displays multiple initiatives with markers.

**Props:**
- `initiatives: Initiative[]` - Array of initiatives to display
- `center?: LatLngExpression` - Map center coordinates (default: Kakamega)
- `zoom?: number` - Initial zoom level (default: 10)
- `height?: string` - Map height (default: '500px')
- `onMarkerClick?: (initiative: Initiative) => void` - Callback when marker is clicked
- `selectedInitiativeId?: string` - ID of selected initiative (highlights marker)

**Features:**
- Interactive markers for each initiative
- Color-coded by status (green=active, blue=completed, yellow=paused)
- Popup with initiative details
- Click to view full details
- OpenStreetMap tiles

**Usage:**
```tsx
import { InitiativeMap } from '@/components/initiatives';

<InitiativeMap
  initiatives={initiatives}
  center={[0.2827, 34.8522]}
  zoom={10}
  height="600px"
  onMarkerClick={(initiative) => navigate(`/initiatives/${initiative.id}`)}
  selectedInitiativeId={selectedId}
/>
```

### LocationPicker

An interactive map component for selecting a location when creating initiatives.

**Props:**
- `value: GeoPoint` - Current location value
- `onChange: (location: GeoPoint) => void` - Callback when location changes
- `height?: string` - Map height (default: '400px')
- `disabled?: boolean` - Whether the picker is disabled

**Features:**
- Click on map to select location
- Preset buttons for quick forest selection
- Manual coordinate input
- Real-time marker updates
- OpenStreetMap tiles

**Usage:**
```tsx
import { LocationPicker } from '@/components/initiatives';

<LocationPicker
  value={location}
  onChange={(newLocation) => setLocation(newLocation)}
  height="400px"
/>
```

### ForestBoundaryMap

A map component that displays forest boundaries as polygons.

**Props:**
- `forest?: ForestPreference` - Specific forest to display
- `height?: string` - Map height (default: '500px')
- `showAllForests?: boolean` - Whether to show all forests (default: false)

**Features:**
- Color-coded forest boundaries
- Popup with forest information
- Can show single forest or all forests
- Approximate boundary polygons

**Usage:**
```tsx
import { ForestBoundaryMap } from '@/components/initiatives';

// Show single forest
<ForestBoundaryMap forest="kakamega" height="500px" />

// Show all forests
<ForestBoundaryMap showAllForests={true} height="600px" />
```

### ParticipantList

A component that displays a list of initiative participants with their contributions.

**Props:**
- `initiativeId: string` - The ID of the initiative
- `showContributions?: boolean` - Whether to show tree contributions (default: true)
- `maxDisplay?: number` - Maximum number of participants to display

**Features:**
- Displays participant avatars and join dates
- Shows tree contributions per participant
- Loading and error states
- Empty state handling
- Truncation with "show more" indicator

**Usage:**
```tsx
import { ParticipantList } from '@/components/initiatives';

<ParticipantList
  initiativeId={initiativeId}
  showContributions={true}
  maxDisplay={10}
/>
```

### ContributionTracker

A component for participants to track and update their tree planting contributions.

**Props:**
- `initiativeId: string` - The ID of the initiative
- `userId: string` - The ID of the current user
- `currentContribution: number` - Current number of trees contributed
- `onUpdate?: (newContribution: number) => void` - Callback when contribution is updated

**Features:**
- Display mode showing current contribution
- Edit mode with form for updating
- Validation and error handling
- Success feedback
- Large, clear number display

**Usage:**
```tsx
import { ContributionTracker } from '@/components/initiatives';

<ContributionTracker
  initiativeId={initiativeId}
  userId={user.id}
  currentContribution={50}
  onUpdate={(newValue) => console.log('Updated to:', newValue)}
/>
```

### JoinInitiativeButton

A smart button component that handles joining and leaving initiatives.

**Props:**
- `initiativeId: string` - The ID of the initiative
- `userId: string` - The ID of the current user
- `isParticipant: boolean` - Whether user is already a participant
- `initiativeStatus: 'active' | 'completed' | 'paused'` - Initiative status
- `onJoin?: () => void` - Callback when user joins
- `onLeave?: () => void` - Callback when user leaves
- `className?: string` - Additional CSS classes

**Features:**
- Shows "Join" button for non-participants
- Shows "Participating" badge for participants
- Leave confirmation dialog
- Only shows for active initiatives
- Loading states
- Error handling

**Usage:**
```tsx
import { JoinInitiativeButton } from '@/components/initiatives';

<JoinInitiativeButton
  initiativeId={initiativeId}
  userId={user.id}
  isParticipant={isParticipant}
  initiativeStatus={initiative.status}
  onJoin={() => console.log('Joined!')}
  onLeave={() => console.log('Left!')}
/>
```

### MilestoneNotifications

A component that displays initiative milestones and celebrates achievements.

**Props:**
- `initiative: Initiative` - The initiative data
- `progress: InitiativeProgress` - Current progress data
- `onMilestoneReached?: (milestone: Milestone) => void` - Callback when milestone is reached

**Features:**
- Tracks milestones at 25%, 50%, 75%, 90%, and 100%
- Visual progress indicators with emojis
- Animated alerts for newly reached milestones
- Color-coded milestone cards
- Next milestone indicator

**Usage:**
```tsx
import { MilestoneNotifications } from '@/components/initiatives';

<MilestoneNotifications
  initiative={initiative}
  progress={progress}
  onMilestoneReached={(milestone) => {
    console.log('Milestone reached:', milestone);
    // Could trigger notification, confetti, etc.
  }}
/>
```

## Example: Complete Initiative Flow

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  InitiativeList,
  InitiativeDetails,
  InitiativeForm,
} from '@/components/initiatives';
import { useAuth } from '@/hooks/useAuth';

function InitiativesPage() {
  const [view, setView] = useState<'list' | 'details' | 'create'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (view === 'create' && user?.role === 'organization') {
    return (
      <InitiativeForm
        organizationId={user.id}
        onSuccess={(initiative) => {
          setSelectedId(initiative.id);
          setView('details');
        }}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'details' && selectedId) {
    return (
      <InitiativeDetails
        initiativeId={selectedId}
        currentUserId={user?.id}
        onBack={() => setView('list')}
        onJoin={() => console.log('Joined!')}
      />
    );
  }

  return (
    <div>
      {user?.role === 'organization' && (
        <button onClick={() => setView('create')}>
          Create Initiative
        </button>
      )}
      <InitiativeList
        onInitiativeClick={(initiative) => {
          setSelectedId(initiative.id);
          setView('details');
        }}
      />
    </div>
  );
}
```

## Styling

All components use Tailwind CSS for styling and follow the platform's design system:
- Primary color: Green (#059669)
- Status colors: Green (active), Blue (completed), Yellow (paused)
- Responsive design with mobile-first approach
- Consistent spacing and typography

## Integration with Services

These components integrate with the `initiativeService` from `@/services`:
- `getInitiatives()` - Fetch initiatives with filters
- `getInitiative()` - Fetch single initiative
- `createInitiative()` - Create new initiative
- `joinInitiative()` - Join an initiative
- `getParticipants()` - Get initiative participants
- `calculateProgress()` - Calculate initiative progress

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
