import type { GeoPoint } from './initiative.types';

export type TreeHealthStatus = 'healthy' | 'stressed' | 'diseased' | 'dead';

export interface Tree {
  id: string;
  initiative_id: string;
  species: string;
  planted_date: string;
  location: GeoPoint;
  planted_by: string;
  antugrow_id?: string;
  current_height_cm?: number;
  current_diameter_cm?: number;
  health_status?: TreeHealthStatus;
  last_monitored?: string;
  created_at: string;
  updated_at: string;
}

export interface TreeImage {
  id: string;
  tree_id: string;
  image_url: string;
  captured_at: string;
  antugrow_analysis?: AntugrowAnalysis;
  created_at: string;
}

export interface AntugrowAnalysis {
  health_score: number;
  growth_rate: number;
  disease_detected: boolean;
  recommendations: string[];
  analyzed_at: string;
}

export interface TreeWithImages extends Tree {
  images: TreeImage[];
}

export interface CreateTreeData {
  initiative_id: string;
  species: string;
  planted_date: string;
  location: GeoPoint;
  planted_by: string;
  current_height_cm?: number;
  current_diameter_cm?: number;
}

export interface UpdateTreeData {
  species?: string;
  current_height_cm?: number;
  current_diameter_cm?: number;
  health_status?: TreeHealthStatus;
  antugrow_id?: string;
}

export interface TreeFilters {
  initiative_id?: string;
  species?: string;
  health_status?: TreeHealthStatus;
  planted_by?: string;
  search?: string;
  forest?: string;
}

export interface TreeStatistics {
  total_trees: number;
  by_species: Record<string, number>;
  by_health_status: Record<TreeHealthStatus, number>;
  by_initiative: Record<string, number>;
  average_height_cm?: number;
  average_diameter_cm?: number;
  healthy_percentage: number;
}

export interface TreeResponse {
  tree: Tree | null;
  error: Error | null;
}

export interface TreesResponse {
  trees: Tree[];
  error: Error | null;
}

export interface TreeImageResponse {
  image: TreeImage | null;
  error: Error | null;
}

export interface TreeImagesResponse {
  images: TreeImage[];
  error: Error | null;
}
