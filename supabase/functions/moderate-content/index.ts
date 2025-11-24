/**
 * Supabase Edge Function: Content Moderation
 * 
 * This function performs automated content moderation on social media posts
 * using profanity detection, spam detection, and sentiment analysis.
 * 
 * Triggered after new posts are inserted into the database.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface ModerationRequest {
  postId: string;
  caption?: string;
  mediaUrl: string;
}

interface ModerationFlag {
  type: string;
  confidence: number;
  reason?: string;
}

/**
 * Profanity word list (simplified - use a comprehensive library in production)
 */
const PROFANITY_WORDS = [
  'badword1', 'badword2', 'badword3', // Replace with actual profanity list
];

/**
 * Spam keywords
 */
const SPAM_KEYWORDS = [
  'click here', 'buy now', 'limited time', 'act now', 'free money',
  'make money fast', 'work from home', 'weight loss', 'viagra',
];

/**
 * Check for profanity in text
 */
function checkProfanity(text: string): ModerationFlag | null {
  if (!text) return null;

  const lowerText = text.toLowerCase();
  const foundWords = PROFANITY_WORDS.filter(word => lowerText.includes(word));

  if (foundWords.length > 0) {
    return {
      type: 'profanity',
      confidence: 0.9,
      reason: `Contains profanity: ${foundWords.join(', ')}`,
    };
  }

  return null;
}

/**
 * Check for spam patterns
 */
function checkSpam(text: string): ModerationFlag | null {
  if (!text) return null;

  const lowerText = text.toLowerCase();
  const foundKeywords = SPAM_KEYWORDS.filter(keyword => lowerText.includes(keyword));

  // Check for excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  const excessiveCaps = capsRatio > 0.5 && text.length > 20;

  // Check for excessive emojis
  const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
  const excessiveEmojis = emojiCount > 10;

  if (foundKeywords.length >= 2 || excessiveCaps || excessiveEmojis) {
    return {
      type: 'spam',
      confidence: 0.8,
      reason: `Spam indicators: ${foundKeywords.length} keywords, caps: ${excessiveCaps}, emojis: ${excessiveEmojis}`,
    };
  }

  return null;
}

/**
 * Perform sentiment analysis using OpenAI Moderation API
 */
async function checkSentiment(text: string): Promise<ModerationFlag | null> {
  if (!text || !OPENAI_API_KEY) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (result?.flagged) {
      const categories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      return {
        type: 'negative_sentiment',
        confidence: Math.max(...Object.values(result.category_scores as Record<string, number>)),
        reason: `Flagged categories: ${categories.join(', ')}`,
      };
    }

    return null;
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return null;
  }
}

/**
 * Moderate a single post
 */
async function moderatePost(supabase: any, request: ModerationRequest): Promise<void> {
  const { postId, caption, mediaUrl } = request;

  console.log(`Moderating post ${postId}`);

  const flags: ModerationFlag[] = [];

  // Check profanity
  const profanityFlag = checkProfanity(caption || '');
  if (profanityFlag) {
    flags.push(profanityFlag);
  }

  // Check spam
  const spamFlag = checkSpam(caption || '');
  if (spamFlag) {
    flags.push(spamFlag);
  }

  // Check sentiment
  const sentimentFlag = await checkSentiment(caption || '');
  if (sentimentFlag) {
    flags.push(sentimentFlag);
  }

  // Determine moderation status
  const isFlagged = flags.length > 0;
  const moderationStatus = isFlagged ? 'flagged' : 'approved';
  const isVisible = !isFlagged;

  // Update post status
  const { error: updateError } = await supabase
    .from('social_posts')
    .update({
      moderation_status: moderationStatus,
      is_visible: isVisible,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId);

  if (updateError) {
    console.error('Error updating post status:', updateError);
    throw updateError;
  }

  // Insert moderation flags
  if (isFlagged) {
    for (const flag of flags) {
      const { error: flagError } = await supabase
        .from('moderation_flags')
        .insert({
          post_id: postId,
          flag_type: flag.type,
          confidence_score: flag.confidence,
          flagged_by: 'system',
          flagged_at: new Date().toISOString(),
        });

      if (flagError) {
        console.error('Error inserting moderation flag:', flagError);
      }
    }

    console.log(`Post ${postId} flagged with ${flags.length} issues`);
  } else {
    console.log(`Post ${postId} approved`);
  }
}

/**
 * Main moderation handler
 */
serve(async (req) => {
  try {
    // Parse request body
    const body = await req.json();
    const { postId, caption, mediaUrl } = body as ModerationRequest;

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Missing postId' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Starting moderation for post ${postId}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Moderate the post
    await moderatePost(supabase, { postId, caption, mediaUrl });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Content moderation completed',
        postId,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in moderation function:', error);
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
