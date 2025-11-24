# Individual User Journey - Quick Start Guide

## For Developers

### 🚀 Getting Started

#### 1. Apply Database Migration
```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard
# File: supabase/migrations/017_add_individual_user_journey_tables.sql
```

#### 2. Access Journey Data in Components
```typescript
import { useJourney } from '../contexts/JourneyContext';

function MyComponent() {
  const { progress, currentStage, recommendations, trackAction } = useJourney();
  
  // Display current stage
  console.log('Current stage:', currentStage);
  
  // Track a user action
  await trackAction({ type: 'tree_planted' });
}
```

#### 3. Use Services Directly
```typescript
import { journeyService, microChallengeService, referralService, petitionService } from '../services';

// Get journey progress
const { data, error } = await journeyService.getJourneyProgress(userId);

// Get challenges
const { data: challenges } = await microChallengeService.getChallenges({ difficulty: 'easy' });

// Get referral stats
const { data: stats } = await referralService.getReferralStats(userId);

// Get petitions
const { data: petitions } = await petitionService.getPetitions({ status: 'active' });
```

---

## 📍 Key Routes

- `/journey` - Journey dashboard (protected)
- Navigation: "My Journey" menu item

---

## 🎯 Journey Stages

1. **Awareness** - Initial discovery
2. **Activation** - Join causes, complete onboarding
3. **Action** - Plant trees, complete challenges
4. **Verification** - Get actions verified
5. **Legacy** - Build lasting impact, refer others

---

## 📊 Available Services

### Journey Service
```typescript
journeyService.getJourneyProgress(userId)
journeyService.trackAction(userId, action)
journeyService.advanceStage(userId, stage)
journeyService.completeMilestone(userId, milestoneId)
journeyService.getRecommendations(userId)
```

### Micro-Challenge Service
```typescript
microChallengeService.getChallenges(filters?)
microChallengeService.getChallengeById(challengeId)
microChallengeService.getUserChallenges(userId)
microChallengeService.joinChallenge({ userId, challengeId })
microChallengeService.updateProgress({ userId, challengeId, progress })
microChallengeService.completeChallenge({ userId, challengeId })
```

### Referral Service
```typescript
referralService.generateReferralCode(userId)
referralService.getReferralStats(userId)
referralService.getUserReferrals(userId)
referralService.createReferral({ referrerId, referredId, referralCode })
referralService.activateReferral({ referredId, pointsToAward })
```

### Petition Service
```typescript
petitionService.getPetitions(filters?, userId?)
petitionService.getPetitionById(petitionId, userId?)
petitionService.createPetition(params)
petitionService.signPetition({ petitionId, userId })
petitionService.hasUserSigned(petitionId, userId)
```

---

## 🔧 Common Tasks

### Track User Actions
```typescript
import { useJourney } from '../contexts/JourneyContext';

const { trackAction } = useJourney();

// When user plants a tree
await trackAction({ type: 'tree_planted' });

// When user completes a challenge
await trackAction({ type: 'challenge_completed' });

// When user joins a cause
await trackAction({ 
  type: 'cause_joined',
  metadata: { causeId: 'trees' }
});
```

### Check Current Stage
```typescript
const { currentStage, progress } = useJourney();

if (currentStage === JourneyStage.AWARENESS) {
  // Show onboarding
}

// Get stage progress percentage
const stageProgress = progress?.stageProgress[currentStage];
```

### Display Recommendations
```typescript
const { recommendations } = useJourney();

recommendations.map(rec => (
  <div onClick={() => navigate(rec.actionUrl)}>
    <h3>{rec.title}</h3>
    <p>{rec.description}</p>
  </div>
))
```

---

## 🎨 UI Components Needed

### High Priority
- [ ] Challenge card component
- [ ] Challenge list component
- [ ] Challenge detail modal
- [ ] Referral center component
- [ ] Petition card component
- [ ] Petition list component
- [ ] Petition detail modal

### Medium Priority
- [ ] Stage indicator component
- [ ] Milestone card component
- [ ] Impact visualization component
- [ ] Certificate display component

---

## 🔗 Integration Points

### With Gamification
```typescript
// Award points when challenge completed
await trackAction({ type: 'challenge_completed' });
// Journey service will update total_points in user_journey_progress
```

### With Tree Service
```typescript
// Track tree planting
await trackAction({ type: 'tree_planted' });
// Updates trees_planted counter
```

### With Notifications
```typescript
// Subscribe to journey updates
const { progress } = useJourney();
// Real-time updates via Supabase subscriptions
```

---

## 📝 Database Tables

### Main Tables
- `user_journey_progress` - Journey tracking
- `micro_challenges` - Challenge definitions
- `user_challenge_progress` - User participation
- `climate_nuggets` - Educational content
- `user_climate_nuggets` - Read tracking
- `user_referrals` - Referral system
- `petitions` - Environmental petitions
- `petition_signatures` - Signatures
- `user_certificates` - Certificates/badges

---

## 🐛 Troubleshooting

### Journey not initializing
- Check if migration 017 is applied
- Verify user is authenticated
- Check browser console for errors

### Real-time updates not working
- Verify Supabase real-time is enabled
- Check RLS policies
- Ensure JourneyProvider wraps component

### Services returning errors
- Check Supabase connection
- Verify user authentication
- Check browser console for details

---

## 📚 Further Reading

- `IMPLEMENTATION_PROGRESS.md` - Detailed implementation notes
- `COMPLETION_SUMMARY.md` - Complete feature summary
- `requirements.md` - Feature requirements
- `design.md` - Design specifications
- `tasks.md` - Implementation tasks

---

## 💡 Tips

1. **Always use the JourneyContext** - Don't call services directly in components
2. **Track all user actions** - Helps with stage progression
3. **Check prerequisites** - Before advancing stages manually
4. **Use TypeScript types** - All types exported from `src/types`
5. **Handle errors gracefully** - All services return `{ data, error }`

---

**Need Help?** Check the completion summary or implementation progress documents for detailed information.
