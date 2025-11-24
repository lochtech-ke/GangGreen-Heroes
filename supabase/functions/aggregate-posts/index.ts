/**
 * Supabase Edge Function: Aggregate Social Media Posts
 * 
 * This function fetches posts from Instagram, Twitter/X, and Facebook
 * that contain the #GangGreen hashtag and stores them in the database.
 * 
 * Scheduled to run every 15 minutes via cron job.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const INSTAGRAM_ACCESS_TOKEN = Deno.env.get('INSTAGRAM_ACCESS_TOKEN') || '';
const TWITTER_BEARER_TOKEN = Deno.env.get('TWITTER_BEARER_TOKEN') || '';
const FACEBOOK_ACCESS_TOKEN = Deno.env.get('FACEBOOK_ACCESS_TOKEN') || '';

interface AggregationResult {
  platform: string;
  fetched: number;
  inserted: number;
  duplicates: number;
  errors: number;
}

/**
 * Fetch posts from Instagram Graph API
 */
async function fetchInstagramPosts(): Promise<any[]> {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    console.warn('Instagram access token not configured');
    return [];
  }

  try {
    // Note: Instagram Graph API requires a business account
    // This is a simplified example - actual implementation may vary
    const response = await fetch(
      `https://graph.instagram.com/v18.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,username&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter posts with #GangGreen hashtag
    const posts = (data.data || []).filter((post: any) => 
      post.caption && post.caption.toLowerCase().includes('#ganggreen')
    );

    console.log(`Fetched ${posts.length} posts from Instagram`);
    return posts;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return [];
  }
}

/**
 * Fetch posts from Twitter API v2
 */
async function fetchTwitterPosts(): Promise<any[]> {
  if (!TWITTER_BEARER_TOKEN) {
    console.warn('Twitter bearer token not configured');
    return [];
  }

  try {
    const query = encodeURIComponent('#GangGreen -is:retweet');
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=100&tweet.fields=created_at,public_metrics,attachments&expansions=author_id,attachments.media_keys&user.fields=name,username,profile_image_url&media.fields=url,preview_image_url,type`,
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.data?.length || 0} posts from Twitter`);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Twitter posts:', error);
    return [];
  }
}

/**
 * Fetch posts from Facebook Graph API
 */
async function fetchFacebookPosts(): Promise<any[]> {
  if (!FACEBOOK_ACCESS_TOKEN) {
    console.warn('Facebook access token not configured');
    return [];
  }

  try {
    // Note: Facebook hashtag search requires specific permissions
    const response = await fetch(
      `https://graph.facebook.com/v18.0/search?type=post&q=%23GangGreen&fields=id,message,created_time,full_picture,permalink_url,from,reactions.summary(true),comments.summary(true),shares&access_token=${FACEBOOK_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.data?.length || 0} posts from Facebook`);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
    return [];
  }
}

/**
 * Normalize Instagram post to common format
 */
function normalizeInstagramPost(post: any): any {
  return {
    external_id: post.id,
    platform: 'instagram',
    author_name: post.username || 'Unknown',
    author_username: post.username || 'unknown',
    author_avatar_url: null, // Not provided in basic response
    author_profile_url: `https://instagram.com/${post.username}`,
    caption: post.caption || '',
    media_type: post.media_type?.toLowerCase() === 'video' ? 'video' : 'image',
    media_url: post.media_url,
    media_thumbnail_url: post.thumbnail_url || post.media_url,
    post_url: post.permalink,
    likes_count: post.like_count || 0,
    comments_count: post.comments_count || 0,
    shares_count: 0, // Instagram doesn't provide share count
    location_tag: null,
    posted_at: post.timestamp,
    moderation_status: 'pending',
    is_visible: true,
  };
}

/**
 * Normalize Twitter post to common format
 */
function normalizeTwitterPost(post: any, includes: any): any {
  const author = includes?.users?.find((u: any) => u.id === post.author_id);
  const media = includes?.media?.[0];

  return {
    external_id: post.id,
    platform: 'twitter',
    author_name: author?.name || 'Unknown',
    author_username: author?.username || 'unknown',
    author_avatar_url: author?.profile_image_url || null,
    author_profile_url: `https://twitter.com/${author?.username}`,
    caption: post.text || '',
    media_type: media?.type === 'video' ? 'video' : 'image',
    media_url: media?.url || media?.preview_image_url || 'https://via.placeholder.com/400',
    media_thumbnail_url: media?.preview_image_url || media?.url,
    post_url: `https://twitter.com/${author?.username}/status/${post.id}`,
    likes_count: post.public_metrics?.like_count || 0,
    comments_count: post.public_metrics?.reply_count || 0,
    shares_count: post.public_metrics?.retweet_count || 0,
    location_tag: null,
    posted_at: post.created_at,
    moderation_status: 'pending',
    is_visible: true,
  };
}

/**
 * Normalize Facebook post to common format
 */
function normalizeFacebookPost(post: any): any {
  return {
    external_id: post.id,
    platform: 'facebook',
    author_name: post.from?.name || 'Unknown',
    author_username: post.from?.id || 'unknown',
    author_avatar_url: null,
    author_profile_url: `https://facebook.com/${post.from?.id}`,
    caption: post.message || '',
    media_type: 'image',
    media_url: post.full_picture || 'https://via.placeholder.com/400',
    media_thumbnail_url: post.full_picture || null,
    post_url: post.permalink_url,
    likes_count: post.reactions?.summary?.total_count || 0,
    comments_count: post.comments?.summary?.total_count || 0,
    shares_count: post.shares?.count || 0,
    location_tag: null,
    posted_at: post.created_time,
    moderation_status: 'pending',
    is_visible: true,
  };
}

/**
 * Insert posts into database with duplicate checking
 */
async function insertPosts(supabase: any, posts: any[], platform: string): Promise<{ inserted: number; duplicates: number; errors: number }> {
  let inserted = 0;
  let duplicates = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      // Check if post already exists
      const { data: existing } = await supabase
        .from('social_posts')
        .select('id')
        .eq('external_id', post.external_id)
        .single();

      if (existing) {
        duplicates++;
        continue;
      }

      // Insert new post
      const { error } = await supabase
        .from('social_posts')
        .insert(post);

      if (error) {
        console.error(`Error inserting ${platform} post:`, error);
        errors++;
      } else {
        inserted++;
      }
    } catch (error) {
      console.error(`Exception inserting ${platform} post:`, error);
      errors++;
    }
  }

  return { inserted, duplicates, errors };
}

/**
 * Main aggregation handler
 */
serve(async (req) => {
  try {
    console.log('Starting social media post aggregation...');

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: AggregationResult[] = [];

    // Fetch from Instagram
    const instagramPosts = await fetchInstagramPosts();
    const normalizedInstagram = instagramPosts.map(normalizeInstagramPost);
    const instagramResult = await insertPosts(supabase, normalizedInstagram, 'instagram');
    results.push({
      platform: 'instagram',
      fetched: instagramPosts.length,
      ...instagramResult,
    });

    // Fetch from Twitter
    const twitterData = await fetchTwitterPosts();
    const normalizedTwitter = twitterData.map((post: any) => normalizeTwitterPost(post, {}));
    const twitterResult = await insertPosts(supabase, normalizedTwitter, 'twitter');
    results.push({
      platform: 'twitter',
      fetched: twitterData.length,
      ...twitterResult,
    });

    // Fetch from Facebook
    const facebookPosts = await fetchFacebookPosts();
    const normalizedFacebook = facebookPosts.map(normalizeFacebookPost);
    const facebookResult = await insertPosts(supabase, normalizedFacebook, 'facebook');
    results.push({
      platform: 'facebook',
      fetched: facebookPosts.length,
      ...facebookResult,
    });

    // Calculate totals
    const totals = results.reduce(
      (acc, r) => ({
        fetched: acc.fetched + r.fetched,
        inserted: acc.inserted + r.inserted,
        duplicates: acc.duplicates + r.duplicates,
        errors: acc.errors + r.errors,
      }),
      { fetched: 0, inserted: 0, duplicates: 0, errors: 0 }
    );

    console.log('Aggregation complete:', totals);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post aggregation completed',
        results,
        totals,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in aggregation function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
