# Social Media Feed - Deployment Guide

## Prerequisites

- Supabase project with service role key
- Instagram Business Account with Graph API access
- Twitter Developer Account with API v2 access
- Facebook Developer Account with Graph API access
- OpenAI API key (for content moderation)

## Step 1: Environment Variables

### Frontend (.env)
Add the following to your `.env` file:

```bash
# Social Media API Configuration
VITE_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
VITE_TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
VITE_FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Supabase Edge Functions
Set the following secrets in Supabase:

```bash
# Using Supabase CLI
supabase secrets set INSTAGRAM_ACCESS_TOKEN=your_token
supabase secrets set TWITTER_BEARER_TOKEN=your_token
supabase secrets set FACEBOOK_ACCESS_TOKEN=your_token
supabase secrets set OPENAI_API_KEY=your_key
```

## Step 2: Database Migration

Run the migration to create all required tables:

```bash
# Apply migration
supabase db push

# Or manually run the SQL file
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/015_add_social_feed_tables.sql
```

Verify tables were created:
- `social_posts`
- `post_engagement`
- `moderation_flags`
- `saved_posts`

## Step 3: Deploy Edge Functions

### Deploy aggregate-posts function
```bash
cd supabase/functions
supabase functions deploy aggregate-posts
```

### Deploy moderate-content function
```bash
supabase functions deploy moderate-content
```

### Verify deployment
```bash
supabase functions list
```

## Step 4: Set Up Cron Job

Create a cron job to run the aggregation function every 15 minutes:

```sql
-- Connect to your Supabase database and run:
SELECT cron.schedule(
  'aggregate-social-posts',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url:='https://wobpryllvdjaapzjbsxx.supabase.co/functions/v1/aggregate-posts',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  )
  $$
);
```

Verify cron job:
```sql
SELECT * FROM cron.job;
```

## Step 5: Install Dependencies

Install required npm packages:

```bash
npm install recharts
```

## Step 6: Test the Implementation

### Test Edge Functions

1. **Test aggregate-posts manually:**
```bash
curl -X POST https://wobpryllvdjaapzjbsxx.supabase.co/functions/v1/aggregate-posts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

2. **Test moderate-content:**
```bash
curl -X POST https://wobpryllvdjaapzjbsxx.supabase.co/functions/v1/moderate-content \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"postId":"test-id","caption":"test caption","mediaUrl":"https://example.com/image.jpg"}'
```

### Test Frontend

1. Navigate to `/social-feed` in your browser
2. Verify posts are displayed
3. Test filters and search
4. Test save/unsave functionality
5. Test post detail modal

### Test Admin Dashboard

1. Navigate to `/admin/moderation` (create route if needed)
2. Verify flagged posts appear
3. Test approve/reject actions
4. Navigate to `/admin/analytics` (create route if needed)
5. Verify charts and data display

## Step 7: API Setup Guides

### Instagram Graph API

1. Create a Facebook App at https://developers.facebook.com
2. Add Instagram Graph API product
3. Get a Page Access Token
4. Convert to long-lived token:
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

### Twitter API v2

1. Create a Twitter Developer Account at https://developer.twitter.com
2. Create a new App
3. Generate Bearer Token from the Keys and Tokens tab
4. Enable OAuth 2.0 if needed

### Facebook Graph API

1. Use the same Facebook App from Instagram setup
2. Get a Page Access Token
3. Grant necessary permissions: `pages_read_engagement`, `pages_read_user_content`

### OpenAI API

1. Sign up at https://platform.openai.com
2. Create an API key
3. Add billing information
4. Use the Moderation API endpoint

## Step 8: Monitoring

### Check Logs

```bash
# View Edge Function logs
supabase functions logs aggregate-posts
supabase functions logs moderate-content

# View cron job logs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Monitor Database

```sql
-- Check post counts
SELECT platform, COUNT(*) as count 
FROM social_posts 
GROUP BY platform;

-- Check moderation status
SELECT moderation_status, COUNT(*) as count 
FROM social_posts 
GROUP BY moderation_status;

-- Check recent posts
SELECT * FROM social_posts 
ORDER BY created_at DESC 
LIMIT 10;
```

## Troubleshooting

### No posts appearing

1. Check Edge Function logs for errors
2. Verify API credentials are correct
3. Check if cron job is running
4. Manually trigger aggregation function

### Moderation not working

1. Check OpenAI API key is valid
2. Verify moderation function logs
3. Check moderation_flags table for entries

### Performance issues

1. Check database indexes are created
2. Monitor query performance
3. Adjust pagination limits if needed
4. Consider caching strategies

## Security Checklist

- [ ] All API keys stored in Supabase secrets (not in code)
- [ ] RLS policies enabled on all tables
- [ ] Edge Functions use service role key
- [ ] Frontend uses anon key only
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Content moderation active

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] Edge Functions deployed
- [ ] Cron job scheduled
- [ ] Dependencies installed
- [ ] API credentials obtained
- [ ] Testing completed
- [ ] Monitoring set up
- [ ] Documentation reviewed
- [ ] Security audit passed

## Support

For issues or questions:
- Check Supabase logs
- Review Edge Function code
- Test API endpoints manually
- Verify database state
- Contact development team
