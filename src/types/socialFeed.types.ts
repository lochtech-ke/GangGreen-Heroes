// Social Media Feed Type Definitions

export type Platform = 'instagram' | 'twitter' | 'facebook';
export type MediaType = 'image' | 'video' | 'carousel';
export type ModerationStatus = 'pending' | 'approved' | 'flagged' | 'rejected';
export type FlagType = 'profanity' | 'spam' | 'inappropriate_image' | 'negative_sentiment' | 'other';
export type ReviewDecision = 'approved' | 'rejected';

// Database row types
export interface SocialPostRow {
  id: string;
  external_id: string;
  platform: Platform;
  author_name: string;
  author_username: string;
  author_avatar_url: string | null;
  author_profile_url: string | null;
  caption: string | null;
  media_type: MediaType;
  media_url: string;
  media_thumbnail_url: string | null;
  post_url: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  location_tag: string | null;
  posted_at: string;
  fetched_at: string;
  moderation_status: ModerationStatus;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostEngagementRow {
  id: string;
  post_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  recorded_at: string;
  created_at: string;
}

export interface ModerationFlagRow {
  id: string;
  post_id: string;
  flag_type: FlagType;
  confidence_score: number | null;
  flagged_by: string;
  reviewed_by: string | null;
  review_decision: ReviewDecision | null;
  review_notes: string | null;
  flagged_at: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface SavedPostRow {
  id: string;
  user_id: string;
  post_id: string;
  saved_at: string;
  created_at: string;
}

// Application types (transformed from database rows)
export interface SocialPost {
  id: string;
  externalId: string;
  platform: Platform;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    profileUrl: string;
  };
  caption: string;
  media: {
    type: MediaType;
    url: string;
    thumbnailUrl?: string;
  };
  postUrl: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    total: number;
  };
  locationTag?: string;
  postedAt: string;
  fetchedAt: string;
  moderationStatus: ModerationStatus;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostEngagement {
  id: string;
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  total: number;
  recordedAt: string;
  createdAt: string;
}

export interface ModerationFlag {
  id: string;
  postId: string;
  flagType: FlagType;
  confidenceScore?: number;
  flaggedBy: string;
  reviewedBy?: string;
  reviewDecision?: ReviewDecision;
  reviewNotes?: string;
  flaggedAt: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
  savedAt: string;
  createdAt: string;
}

// Filter and query types
export interface FeedFilters {
  platform?: Platform | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string | 'all';
  searchQuery?: string;
  sortBy?: 'recent' | 'popular';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FeedQueryParams extends FeedFilters, PaginationParams {}

// Analytics types
export interface PlatformBreakdown {
  platform: Platform;
  count: number;
  engagement: number;
}

export interface EngagementTrend {
  date: string;
  engagement: number;
}

export interface FeedAnalytics {
  totalPosts: number;
  totalEngagement: number;
  uniqueAuthors: number;
  platformBreakdown: PlatformBreakdown[];
  engagementTrend: EngagementTrend[];
  topPosts: SocialPost[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

// API response types
export interface GetPostsResponse {
  posts: SocialPost[];
  hasMore: boolean;
  total: number;
}

export interface SavePostResponse {
  success: boolean;
  savedPost?: SavedPost;
  error?: string;
}

export interface UnsavePostResponse {
  success: boolean;
  error?: string;
}

export interface GetAnalyticsResponse {
  success: boolean;
  analytics?: FeedAnalytics;
  error?: string;
}

// External API types (for aggregation)
export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  username: string;
}

export interface TwitterPost {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    like_count: number;
    reply_count: number;
    retweet_count: number;
  };
  attachments?: {
    media_keys: string[];
  };
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
}

export interface TwitterMedia {
  media_key: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string;
  preview_image_url?: string;
}

export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
  from: {
    name: string;
    id: string;
  };
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

// Moderation types
export interface ModerationResult {
  flagged: boolean;
  flags: {
    type: FlagType;
    confidence: number;
    reason?: string;
  }[];
}

export interface ModerationRequest {
  postId: string;
  caption?: string;
  mediaUrl: string;
}

// Transform helper types
export type TransformFunction<T, U> = (input: T) => U;

// Utility types
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ServiceResponse<T> {
  data?: T;
  error?: ApiError;
}
