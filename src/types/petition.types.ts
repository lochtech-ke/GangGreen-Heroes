/**
 * Petition Types
 * Type definitions for the environmental petition system
 */

export type PetitionStatus = 'active' | 'successful' | 'expired' | 'closed';

export interface Petition {
  id: string;
  title: string;
  description: string;
  category: string;
  targetSignatures: number;
  currentSignatures: number;
  createdBy: string;
  status: PetitionStatus;
  createdAt: Date;
  expiresAt?: Date;
  updatedAt: Date;
}

export interface PetitionSignature {
  id: string;
  petitionId: string;
  userId: string;
  signedAt: Date;
}

export interface PetitionWithSignature extends Petition {
  hasUserSigned: boolean;
  progressPercentage: number;
}

// Database row types (snake_case from Supabase)
export interface PetitionRow {
  id: string;
  title: string;
  description: string;
  category: string;
  target_signatures: number;
  current_signatures: number;
  created_by: string;
  status: PetitionStatus;
  created_at: string;
  expires_at: string | null;
  updated_at: string;
}

export interface PetitionSignatureRow {
  id: string;
  petition_id: string;
  user_id: string;
  signed_at: string;
}

// Service parameters
export interface CreatePetitionParams {
  title: string;
  description: string;
  category: string;
  targetSignatures: number;
  createdBy: string;
  expiresAt?: Date;
}

export interface SignPetitionParams {
  petitionId: string;
  userId: string;
}

export interface PetitionFilters {
  status?: PetitionStatus;
  category?: string;
  createdBy?: string;
}

// Service response types
export interface PetitionServiceResponse<T> {
  data: T | null;
  error: Error | null;
}
