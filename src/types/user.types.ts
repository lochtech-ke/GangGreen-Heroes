export type UserRole = 'admin' | 'organization' | 'community' | 'individual';
export type ForestPreference = 'kakamega' | 'karura' | 'mau';

export interface UserProfile {
  full_name: string;
  phone?: string;
  organization?: string;
  location?: string;
  avatar_url?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  forest_preference?: ForestPreference;
  created_at: string;
  profile?: UserProfile;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  role?: UserRole;
  forest_preference?: ForestPreference;
  phone?: string;
  organization?: string;
  location?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}
