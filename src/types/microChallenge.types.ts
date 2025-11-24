/**
 * Micro-Challenge Types
 * Type definitions for the micro-challenge system
 */

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'active' | 'completed' | 'abandoned';

export interface ChallengeRequirement {
  type: 'tree_plant' | 'photo_upload' | 'location_visit' | 'quiz' | 'share';
  description: string;
  isComplete: boolean;
  metadata?: Record<string, any>;
}

export interface MicroChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  points: number;
  category: string;
  requirements: ChallengeRequirement[];
  timeLimit?: number; // minutes
  isActive: boolean;
  participantCount: number;
  completionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  status: ChallengeStatus;
  progress: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  challenge?: MicroChallenge;
}

// Database row types (snake_case from Supabase)
export interface MicroChallengeRow {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  points: number;
  category: string;
  requirements: any;
  time_limit: number | null;
  is_active: boolean;
  participant_count: number;
  completion_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserChallengeProgressRow {
  id: string;
  user_id: string;
  challenge_id: string;
  status: ChallengeStatus;
  progress: any;
  started_at: string;
  completed_at: string | null;
}

// Service parameters
export interface ChallengeFilters {
  difficulty?: ChallengeDifficulty;
  category?: string;
  isActive?: boolean;
}

export interface JoinChallengeParams {
  userId: string;
  challengeId: string;
}

export interface UpdateProgressParams {
  userId: string;
  challengeId: string;
  progress: Record<string, any>;
}

export interface CompleteChallengeParams {
  userId: string;
  challengeId: string;
}

// Service response types
export interface ChallengeServiceResponse<T> {
  data: T | null;
  error: Error | null;
}
