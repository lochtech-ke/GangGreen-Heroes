import { supabase } from './supabase';
import type {
  SocialPost,
  SocialPostRow,
  FeedFilters,
  GetPostsResponse,
  SavePostResponse,
  UnsavePostResponse,
  FeedAnalytics,
  DateRange,
  SavedPostRow,
} from '../types/socialFeed.types';
import { MOCK_SOCIAL_POSTS, sortMockPosts } from '../data/mockSocialPosts';

// Use mock data in development or when database is empty
const USE_MOCK_DATA = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_SOCIAL_DATA === 'true';

/**
 * Social Feed Service
 * Handles social media feed operations including fetching, filtering, and user interactions
 */
class SocialFeedService {
  /**
   * Transform database row to application type
   */
  private transformPost(row: SocialPostRow): SocialPost {
    return {
      id: row.id,
      externalId: row.external_id,
      platform: row.platform,
      author: {
        name: row.author_name,
        username: row.author_username,
        avatarUrl: row.author_avatar_url || '',
        profileUrl: row.author_profile_url || '',
      },
      caption: row.caption || '',
      media: {
        type: row.media_type,
        url: row.media_url,
        thumbnailUrl: row.media_thumbnail_url || undefined,
      },
      postUrl: row.post_url,
      engagement: {
        likes: row.likes_count,
        comments: row.comments_count,
        shares: row.shares_count,
        total: row.likes_count + row.comments_count + row.shares_count,
      },
      locationTag: row.location_tag || undefined,
      postedAt: row.posted_at,
      fetchedAt: row.fetched_at,
      moderationStatus: row.moderation_status,
      isVisible: row.is_visible,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Get mock posts with filters and pagination
   * Used in development mode or when database is empty
   */
  private getMockPosts(
    filters: FeedFilters = {},
    page: number = 1,
    limit: number = 20
  ): GetPostsResponse {
    let filteredPosts = [...MOCK_SOCIAL_POSTS];

    // Apply platform filter
    if (filters.platform && filters.platform !== 'all') {
      filteredPosts = filteredPosts.filter((post) => post.platform === filters.platform);
    }

    // Apply location filter
    if (filters.location && filters.location !== 'all') {
      filteredPosts = filteredPosts.filter((post) =>
        post.locationTag?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.caption.toLowerCase().includes(query) ||
          post.author.name.toLowerCase().includes(query) ||
          post.author.username.toLowerCase().includes(query)
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      filteredPosts = filteredPosts.filter((post) => {
        const postDate = new Date(post.postedAt);
        return (
          postDate >= filters.dateRange!.start &&
          postDate <= filters.dateRange!.end
        );
      });
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'recent';
    filteredPosts = sortMockPosts(filteredPosts, sortBy);

    // Apply pagination
    const total = filteredPosts.length;
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedPosts = filteredPosts.slice(from, to);
    const hasMore = to < total;

    console.log(`[SocialFeedService] Mock data: ${paginatedPosts.length} posts (${total} total)`);

    return {
      posts: paginatedPosts,
      hasMore,
      total,
    };
  }

  /**
   * Fetch paginated posts with filters
   */
  async getPosts(
    filters: FeedFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<GetPostsResponse> {
    try {
      console.log('[SocialFeedService] Fetching posts with filters:', filters);

      // Use mock data in development mode
      if (USE_MOCK_DATA) {
        console.log('[SocialFeedService] Using mock data');
        return this.getMockPosts(filters, page, limit);
      }

      let query = supabase
        .from('social_posts')
        .select('*', { count: 'exact' })
        .eq('is_visible', true)
        .eq('moderation_status', 'approved');

      // Apply platform filter
      if (filters.platform && filters.platform !== 'all') {
        query = query.eq('platform', filters.platform);
      }

      // Apply date range filter
      if (filters.dateRange) {
        query = query
          .gte('posted_at', filters.dateRange.start.toISOString())
          .lte('posted_at', filters.dateRange.end.toISOString());
      }

      // Apply location filter
      if (filters.location && filters.location !== 'all') {
        query = query.ilike('location_tag', `%${filters.location}%`);
      }

      // Apply search query
      if (filters.searchQuery) {
        query = query.or(
          `caption.ilike.%${filters.searchQuery}%,author_name.ilike.%${filters.searchQuery}%,author_username.ilike.%${filters.searchQuery}%`
        );
      }

      // Apply sorting
      if (filters.sortBy === 'popular') {
        // Sort by total engagement (likes + comments + shares)
        query = query.order('likes_count', { ascending: false });
      } else {
        // Default: sort by most recent
        query = query.order('posted_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('[SocialFeedService] Error fetching posts:', error);
        return {
          posts: [],
          hasMore: false,
          total: 0,
        };
      }

      const posts = (data as SocialPostRow[]).map((row) => this.transformPost(row));
      const total = count || 0;
      const hasMore = from + posts.length < total;

      console.log(`[SocialFeedService] Fetched ${posts.length} posts (${total} total)`);

      return {
        posts,
        hasMore,
        total,
      };
    } catch (error) {
      console.error('[SocialFeedService] Exception fetching posts:', error);
      return {
        posts: [],
        hasMore: false,
        total: 0,
      };
    }
  }

  /**
   * Get single post by ID
   */
  async getPostById(postId: string): Promise<SocialPost | null> {
    try {
      console.log(`[SocialFeedService] Fetching post ${postId}`);

      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('id', postId)
        .eq('is_visible', true)
        .eq('moderation_status', 'approved')
        .single();

      if (error) {
        console.error('[SocialFeedService] Error fetching post:', error);
        return null;
      }

      return this.transformPost(data as SocialPostRow);
    } catch (error) {
      console.error('[SocialFeedService] Exception fetching post:', error);
      return null;
    }
  }

  /**
   * Save post to user's saved collection
   */
  async savePost(postId: string, userId: string): Promise<SavePostResponse> {
    try {
      console.log(`[SocialFeedService] Saving post ${postId} for user ${userId}`);

      const { data, error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: userId,
          post_id: postId,
        })
        .select()
        .single();

      if (error) {
        // Check if already saved (unique constraint violation)
        if (error.code === '23505') {
          console.log('[SocialFeedService] Post already saved');
          return {
            success: true,
          };
        }

        console.error('[SocialFeedService] Error saving post:', error);
        return {
          success: false,
          error: 'Failed to save post',
        };
      }

      console.log('[SocialFeedService] Post saved successfully');

      return {
        success: true,
        savedPost: data as any,
      };
    } catch (error) {
      console.error('[SocialFeedService] Exception saving post:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save post',
      };
    }
  }

  /**
   * Remove post from saved collection
   */
  async unsavePost(postId: string, userId: string): Promise<UnsavePostResponse> {
    try {
      console.log(`[SocialFeedService] Unsaving post ${postId} for user ${userId}`);

      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) {
        console.error('[SocialFeedService] Error unsaving post:', error);
        return {
          success: false,
          error: 'Failed to unsave post',
        };
      }

      console.log('[SocialFeedService] Post unsaved successfully');

      return {
        success: true,
      };
    } catch (error) {
      console.error('[SocialFeedService] Exception unsaving post:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unsave post',
      };
    }
  }

  /**
   * Check if post is saved by user
   */
  async isPostSaved(postId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[SocialFeedService] Exception checking saved status:', error);
      return false;
    }
  }

  /**
   * Get user's saved posts
   */
  async getSavedPosts(userId: string, limit: number = 50): Promise<SocialPost[]> {
    try {
      console.log(`[SocialFeedService] Fetching saved posts for user ${userId}`);

      const { data, error } = await supabase
        .from('saved_posts')
        .select('post_id, social_posts(*)')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[SocialFeedService] Error fetching saved posts:', error);
        return [];
      }

      return (data as any[])
        .filter((item) => item.social_posts)
        .map((item) => this.transformPost(item.social_posts as SocialPostRow));
    } catch (error) {
      console.error('[SocialFeedService] Exception fetching saved posts:', error);
      return [];
    }
  }

  /**
   * Get top posts by engagement
   */
  async getTopPosts(limit: number = 10): Promise<SocialPost[]> {
    try {
      console.log(`[SocialFeedService] Fetching top ${limit} posts`);

      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('is_visible', true)
        .eq('moderation_status', 'approved')
        .order('likes_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[SocialFeedService] Error fetching top posts:', error);
        return [];
      }

      return (data as SocialPostRow[]).map((row) => this.transformPost(row));
    } catch (error) {
      console.error('[SocialFeedService] Exception fetching top posts:', error);
      return [];
    }
  }

  /**
   * Get saved post IDs for a user
   */
  async getSavedPostIds(userId: string): Promise<Set<string>> {
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', userId);

      if (error) {
        console.error('[SocialFeedService] Error fetching saved post IDs:', error);
        return new Set();
      }

      return new Set((data as SavedPostRow[]).map((row) => row.post_id));
    } catch (error) {
      console.error('[SocialFeedService] Exception fetching saved post IDs:', error);
      return new Set();
    }
  }
}

// Export singleton instance
export const socialFeedService = new SocialFeedService();


/**
 * Social Feed Analytics Service Extension
 * Handles analytics and reporting for admin dashboard
 */
class SocialFeedAnalyticsService extends SocialFeedService {
  /**
   * Get feed analytics for a date range
   */
  async getAnalytics(dateRange?: DateRange): Promise<FeedAnalytics | null> {
    try {
      console.log('[SocialFeedService] Fetching analytics');

      const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = dateRange?.end || new Date();

      // Call the database function
      const { data, error } = await supabase.rpc('get_feed_analytics', {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      if (error) {
        console.error('[SocialFeedService] Error fetching analytics:', error);
        return null;
      }

      // Get engagement trends
      const { data: trendsData, error: trendsError } = await supabase.rpc('get_engagement_trends', {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_interval: 'day',
      });

      if (trendsError) {
        console.error('[SocialFeedService] Error fetching trends:', error);
      }

      // Get top posts
      const topPosts = await this.getTopPosts(10);

      const analytics: FeedAnalytics = {
        totalPosts: data.totalPosts || 0,
        totalEngagement: data.totalEngagement || 0,
        uniqueAuthors: data.uniqueAuthors || 0,
        platformBreakdown: data.platformBreakdown || [],
        engagementTrend: trendsData || [],
        topPosts,
      };

      console.log('[SocialFeedService] Analytics fetched successfully');

      return analytics;
    } catch (error) {
      console.error('[SocialFeedService] Exception fetching analytics:', error);
      return null;
    }
  }

  /**
   * Export analytics data to CSV format
   */
  async exportAnalyticsToCSV(dateRange?: DateRange): Promise<string | null> {
    try {
      const analytics = await this.getAnalytics(dateRange);

      if (!analytics) {
        return null;
      }

      // Create CSV content
      let csv = 'Social Media Feed Analytics Report\n\n';
      csv += `Generated: ${new Date().toISOString()}\n\n`;
      csv += 'Summary\n';
      csv += `Total Posts,${analytics.totalPosts}\n`;
      csv += `Total Engagement,${analytics.totalEngagement}\n`;
      csv += `Unique Authors,${analytics.uniqueAuthors}\n\n`;

      csv += 'Platform Breakdown\n';
      csv += 'Platform,Post Count,Total Engagement\n';
      analytics.platformBreakdown.forEach((platform) => {
        csv += `${platform.platform},${platform.count},${platform.engagement}\n`;
      });

      csv += '\nTop Posts\n';
      csv += 'Platform,Author,Caption,Likes,Comments,Shares,Total Engagement,Posted At\n';
      analytics.topPosts.forEach((post) => {
        const caption = (post.caption || '').replace(/,/g, ';').substring(0, 100);
        csv += `${post.platform},${post.author.username},"${caption}",${post.engagement.likes},${post.engagement.comments},${post.engagement.shares},${post.engagement.total},${post.postedAt}\n`;
      });

      return csv;
    } catch (error) {
      console.error('[SocialFeedService] Exception exporting analytics:', error);
      return null;
    }
  }
}

// Export singleton instance with analytics capabilities
export const socialFeedAnalyticsService = new SocialFeedAnalyticsService();
