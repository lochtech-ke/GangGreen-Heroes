import type { ForestPreference } from './user.types';

export type InitiativeStatus = 'active' | 'completed' | 'paused';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Initiative {
  id: string;
  title: string;
  description: string;
  forest: ForestPreference;
  target_trees: number;
  trees_planted: number;
  start_date: string;
  end_date?: string;
  status: InitiativeStatus;
  location: GeoPoint;
  area_hectares: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface InitiativeParticipant {
  id: string;
  initiative_id: string;
  user_id: string;
  trees_contributed: number;
  joined_at: string;
}

export interface CreateInitiativeData {
  title: string;
  description: string;
  forest: ForestPreference;
  target_trees: number;
  start_date: string;
  end_date?: string;
  location: GeoPoint;
  area_hectares: number;
  organization_id: string;
}

export interface UpdateInitiativeData {
  title?: string;
  description?: string;
  target_trees?: number;
  end_date?: string;
  status?: InitiativeStatus;
  area_hectares?: number;
}

export interface InitiativeFilters {
  forest?: ForestPreference;
  status?: InitiativeStatus;
  organization_id?: string;
  search?: string;
}

export interface InitiativeWithParticipants extends Initiative {
  participants_count: number;
  participants?: InitiativeParticipant[];
}

export interface InitiativeProgress {
  initiative_id: string;
  progress_percentage: number;
  trees_remaining: number;
  days_remaining?: number;
  is_on_track: boolean;
}

export interface InitiativeResponse {
  initiative: Initiative | null;
  error: Error | null;
}

export interface InitiativesResponse {
  initiatives: Initiative[];
  error: Error | null;
}

export interface ParticipantResponse {
  participant: InitiativeParticipant | null;
  error: Error | null;
}
