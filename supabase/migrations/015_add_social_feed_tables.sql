-- Migration: Add Social Media Feed Tables
-- Description: Creates tables for social media feed aggregation, moderation, and user interactions

-- Create social_posts table
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'twitter', 'facebook')),
  author_name VARCHAR(255) NOT NULL,
  author_username VARCHAR(255) NOT NULL,
  author_avatar_url TEXT,
  author_profile_url TEXT,
  caption TEXT,
  media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video', 'carousel')),
  media_url TEXT NOT NULL,
  media_thumbnail_url TEXT,
  post_url TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
  location_tag VARCHAR(255),
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  moderation_status VARCHAR(50) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected')),
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for social_posts
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_posted_at ON social_posts(posted_at DESC);
CREATE INDEX idx_social_posts_moderation_status ON social_posts(moderation_status);
CREATE INDEX idx_social_posts_location_tag ON social_posts(location_tag);
CREATE INDEX idx_social_posts_visible ON social_posts(is_visible) WHERE is_visible = true;
CREATE INDEX idx_social_posts_external_id ON social_posts(external_id);

-- Create post_engagement table for tracking metrics over time
CREATE TABLE post_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for post_engagement
CREATE INDEX idx_post_engagement_post_id ON post_engagement(post_id);
CREATE INDEX idx_post_engagement_recorded_at ON post_engagement(recorded_at DESC);

-- Create moderation_flags table
CREATE TABLE moderation_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  flag_type VARCHAR(100) NOT NULL CHECK (flag_type IN ('profanity', 'spam', 'inappropriate_image', 'negative_sentiment', 'other')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  flagged_by VARCHAR(50) DEFAULT 'system',
  reviewed_by UUID REFERENCES auth.users(id),
  review_decision VARCHAR(50) CHECK (review_decision IN ('approved', 'rejected')),
  review_notes TEXT,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for moderation_flags
CREATE INDEX idx_moderation_flags_post_id ON moderation_flags(post_id);
CREATE INDEX idx_moderation_flags_reviewed ON moderation_flags(reviewed_at) WHERE reviewed_at IS NULL;
CREATE INDEX idx_moderation_flags_flagged_at ON moderation_flags(flagged_at DESC);

-- Create saved_posts table
CREATE TABLE saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create indexes for saved_posts
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX idx_saved_posts_saved_at ON saved_posts(saved_at DESC);

-- Add trigger for updated_at on social_posts
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_posts
-- Public can view approved and visible posts
CREATE POLICY "Public can view approved social posts"
  ON social_posts FOR SELECT
  USING (is_visible = true AND moderation_status = 'approved');

-- Service role can insert posts (for aggregation function)
CREATE POLICY "Service role can insert social posts"
  ON social_posts FOR INSERT
  WITH CHECK (true);

-- Service role can update posts (for moderation)
CREATE POLICY "Service role can update social posts"
  ON social_posts FOR UPDATE
  USING (true);

-- Admins can view all posts
CREATE POLICY "Admins can view all social posts"
  ON social_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for post_engagement
-- Public can view engagement data for visible posts
CREATE POLICY "Public can view post engagement"
  ON post_engagement FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_posts
      WHERE social_posts.id = post_engagement.post_id
      AND social_posts.is_visible = true
      AND social_posts.moderation_status = 'approved'
    )
  );

-- Service role can insert engagement records
CREATE POLICY "Service role can insert post engagement"
  ON post_engagement FOR INSERT
  WITH CHECK (true);

-- RLS Policies for moderation_flags
-- Only admins can view moderation flags
CREATE POLICY "Admins can view moderation flags"
  ON moderation_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Service role can insert flags
CREATE POLICY "Service role can insert moderation flags"
  ON moderation_flags FOR INSERT
  WITH CHECK (true);

-- Admins can update flags (for review)
CREATE POLICY "Admins can update moderation flags"
  ON moderation_flags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for saved_posts
-- Users can view their own saved posts
CREATE POLICY "Users can view own saved posts"
  ON saved_posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own saved posts
CREATE POLICY "Users can save posts"
  ON saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved posts
CREATE POLICY "Users can unsave posts"
  ON saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to get feed analytics
CREATE OR REPLACE FUNCTION get_feed_analytics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_posts INTEGER;
  v_total_engagement INTEGER;
  v_unique_authors INTEGER;
  v_platform_breakdown JSONB;
  v_result JSONB;
BEGIN
  -- Set default date range if not provided (last 30 days)
  IF p_start_date IS NULL THEN
    p_start_date := NOW() - INTERVAL '30 days';
  END IF;
  
  IF p_end_date IS NULL THEN
    p_end_date := NOW();
  END IF;
  
  -- Get total posts
  SELECT COUNT(*) INTO v_total_posts
  FROM social_posts
  WHERE posted_at BETWEEN p_start_date AND p_end_date
  AND is_visible = true
  AND moderation_status = 'approved';
  
  -- Get total engagement
  SELECT COALESCE(SUM(likes_count + comments_count + shares_count), 0) INTO v_total_engagement
  FROM social_posts
  WHERE posted_at BETWEEN p_start_date AND p_end_date
  AND is_visible = true
  AND moderation_status = 'approved';
  
  -- Get unique authors
  SELECT COUNT(DISTINCT author_username) INTO v_unique_authors
  FROM social_posts
  WHERE posted_at BETWEEN p_start_date AND p_end_date
  AND is_visible = true
  AND moderation_status = 'approved';
  
  -- Get platform breakdown
  SELECT jsonb_agg(
    jsonb_build_object(
      'platform', platform,
      'count', post_count,
      'engagement', total_engagement
    )
  ) INTO v_platform_breakdown
  FROM (
    SELECT 
      platform,
      COUNT(*) as post_count,
      SUM(likes_count + comments_count + shares_count) as total_engagement
    FROM social_posts
    WHERE posted_at BETWEEN p_start_date AND p_end_date
    AND is_visible = true
    AND moderation_status = 'approved'
    GROUP BY platform
  ) platform_stats;
  
  -- Build result
  v_result := jsonb_build_object(
    'totalPosts', v_total_posts,
    'totalEngagement', v_total_engagement,
    'uniqueAuthors', v_unique_authors,
    'platformBreakdown', COALESCE(v_platform_breakdown, '[]'::jsonb)
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_feed_analytics TO authenticated, service_role;

-- Create function to get engagement trends
CREATE OR REPLACE FUNCTION get_engagement_trends(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_interval TEXT DEFAULT 'day'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trends JSONB;
BEGIN
  -- Set default date range if not provided (last 30 days)
  IF p_start_date IS NULL THEN
    p_start_date := NOW() - INTERVAL '30 days';
  END IF;
  
  IF p_end_date IS NULL THEN
    p_end_date := NOW();
  END IF;
  
  -- Get engagement trends grouped by interval
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date_trunc(p_interval, posted_at)::date,
      'engagement', total_engagement
    ) ORDER BY date_trunc(p_interval, posted_at)
  ) INTO v_trends
  FROM (
    SELECT 
      posted_at,
      SUM(likes_count + comments_count + shares_count) as total_engagement
    FROM social_posts
    WHERE posted_at BETWEEN p_start_date AND p_end_date
    AND is_visible = true
    AND moderation_status = 'approved'
    GROUP BY date_trunc(p_interval, posted_at), posted_at
  ) trend_stats;
  
  RETURN COALESCE(v_trends, '[]'::jsonb);
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_engagement_trends TO authenticated, service_role;

-- Add comments for documentation
COMMENT ON TABLE social_posts IS 'Stores aggregated social media posts from Instagram, Twitter/X, and Facebook with #GangGreen hashtag';
COMMENT ON TABLE post_engagement IS 'Tracks engagement metrics over time for analytics and trending analysis';
COMMENT ON TABLE moderation_flags IS 'Stores content moderation flags and review decisions';
COMMENT ON TABLE saved_posts IS 'Stores user-saved posts for personal collections';
COMMENT ON FUNCTION get_feed_analytics IS 'Returns analytics data for social media feed including total posts, engagement, and platform breakdown';
COMMENT ON FUNCTION get_engagement_trends IS 'Returns engagement trends over time grouped by specified interval (day, week, month)';
