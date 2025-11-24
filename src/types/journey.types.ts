/**
 * Journey Types
 * Type definitions for the Individual User Journey feature
 */

export enum JourneyStage {
  AWARENESS = 'awareness',
  ACTIVATION = 'activation',
  ACTION = 'action',
  VERIFICATION = 'verification',
  LEGACY = 'legacy',
}

export interface JourneyProgress {
  id: string;
  userId: string;
  currentStage: JourneyStage;
  stageProgress: Record<JourneyStage, number>; // 0-100 percentage
  completedMilestones: string[];
  joinedCauses: string[];
  totalPoints: number;
  treesPlanted: number;
  challengesCompleted: number;
  referralCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  stage: JourneyStage;
  requiredActions: MilestoneAction[];
  reward?: {
    points: number;
    badge?: string;
  };
}

export interface MilestoneAction {
  type: 'tree_plant' | 'challenge_complete' | 'cause_join' | 'referral' | 'petition_sign';
  count: number;
  description: string;
}

export interface UserAction {
  type: 'tree_planted' | 'challenge_completed' | 'cause_joined' | 'referral_made' | 'petition_signed' | 'nugget_read';
  metadata?: Record<string, any>;
}

export interface Recommendation {
  id: string;
  type: 'challenge' | 'cause' | 'tree_plant' | 'petition' | 'nugget';
  title: string;
  description: string;
  priority: number;
  actionUrl: string;
}

export interface StageRequirements {
  stage: JourneyStage;
  prerequisites: {
    minPoints?: number;
    minTrees?: number;
    minChallenges?: number;
    requiredMilestones?: string[];
    requiredCauses?: number;
  };
}

// Database row types (snake_case from Supabase)
export interface JourneyProgressRow {
  id: string;
  user_id: string;
  current_stage: string;
  stage_progress: Record<string, number>;
  completed_milestones: string[];
  joined_causes: string[];
  total_points: number;
  trees_planted: number;
  challenges_completed: number;
  referral_count: number;
  created_at: string;
  updated_at: string;
}

// Service response types
export interface JourneyServiceResponse<T> {
  data: T | null;
  error: Error | null;
}
