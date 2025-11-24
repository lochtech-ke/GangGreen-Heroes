/**
 * Feature Deprecation Types
 * Types for managing deprecated features in Track 3
 */

export enum DeprecatedFeature {
  TREE_PLANTING = 'tree_planting',
  CARBON_CREDITS = 'carbon_credits',
  MARKETPLACE = 'marketplace',
}

export interface FeatureStatus {
  enabled: boolean;
  deprecatedAt?: Date;
  removalDate?: Date;
  alternativeFeature?: string;
  message?: string;
}

export interface FeatureFlag {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  deprecated_at: string | null;
  removal_date: string | null;
  alternative_feature: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface RouteRedirect {
  from: string;
  to: string;
  message?: string;
}
