/**
 * Community Engagement Types
 * Types for Track 3 community engagement tracking
 */

export type EngagementActionType =
  | 'micro_challenge'
  | 'social_post'
  | 'social_like'
  | 'social_comment'
  | 'initiative_join'
  | 'initiative_create'
  | 'initiative_task'
  | 'referral';

export interface EngagementAction {
  type: EngagementActionType;
  points: number;
  metadata?: Record<string, any>;
}

export interface EngagementActionRecord {
  id: string;
  user_id: string;
  action_type: EngagementActionType;
  points_awarded: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface EngagementScore {
  total: number;
  breakdown: {
    actions: number;
    social: number;
    initiatives: number;
    referrals: number;
  };
  rank: number;
  percentile: number;
}

export interface EngagementBreakdown {
  actionsCompleted: number;
  socialPostsCreated: number;
  postsLiked: number;
  commentsPosted: number;
  initiativesJoined: number;
  initiativesCreated: number;
  referralsMade: number;
  referralsActive: number;
  totalPoints: number;
  lastActivity: string | null;
}

export interface SocialMetrics {
  postsCreated: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  topPost?: {
    id: string;
    content: string;
    likes: number;
    comments: number;
  };
}

export interface InitiativeMetrics {
  joined: number;
  created: number;
  completed: number;
  tasksCompleted: number;
  impactScore: number;
}

export interface ReferralMetrics {
  totalReferrals: number;
  activeReferrals: number;
  conversionRate: number;
  pointsEarned: number;
  nextMilestone: ReferralMilestone;
}

export interface ReferralMilestone {
  name: string;
  target: number;
  current: number;
  reward: string;
}

export interface ActionFilters {
  actionType?: EngagementActionType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface UserEngagementSummary {
  user_id: string;
  challenges_completed: number;
  posts_created: number;
  likes_given: number;
  comments_made: number;
  initiatives_joined: number;
  initiatives_created: number;
  tasks_completed: number;
  referrals_made: number;
  total_points: number;
  last_activity: string | null;
}

// Point values for different actions
export const ENGAGEMENT_POINTS = {
  micro_challenge: 5,
  social_post: 5,
  social_like: 1,
  social_comment: 2,
  initiative_join: 10,
  initiative_create: 50,
  initiative_task: 3,
  referral: 15,
  referral_active_bonus: 5, // Bonus when referred user completes 5 actions
} as const;
