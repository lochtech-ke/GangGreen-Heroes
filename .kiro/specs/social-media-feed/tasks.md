# Implementation Plan

- [x] 1. Set up database schema and types



  - Create migration file `015_add_social_feed_tables.sql` with all four tables (social_posts, post_engagement, moderation_flags, saved_posts)
  - Add indexes for performance optimization on frequently queried columns
  - Configure Row Level Security (RLS) policies for each table
  - Create TypeScript type definitions in `src/types/socialFeed.types.ts` matching database schema
  - _Requirements: 1.1, 2.2_

- [x] 2. Implement core social feed service



  - [x] 2.1 Create socialFeed.service.ts with database operations


    - Implement `getPosts()` method with filtering, pagination, and sorting logic
    - Implement `getPostById()` method for single post retrieval
    - Implement `savePost()` and `unsavePost()` methods for user saved posts
    - Implement `isPostSaved()` method to check saved status
    - Add error handling and TypeScript return types for all methods
    - _Requirements: 1.1, 5.1, 5.2, 5.3, 5.4, 5.5_


  - [x] 2.2 Create getAnalytics() method for admin dashboard

    - Query total posts, engagement, and unique authors
    - Calculate platform breakdown statistics
    - Generate engagement trend data over time
    - Fetch top posts by engagement metrics
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 3. Build PostCard component



  - Create `src/components/social/PostCard.tsx` with image, caption, and metadata display
  - Implement lazy loading for post images using Intersection Observer
  - Add platform icon badge (Instagram/Twitter/Facebook) with appropriate styling
  - Display truncated caption (max 2 lines) with "Read more" indicator
  - Show engagement metrics (likes, comments, shares) with icons
  - Implement hover overlay with "View Details" button
  - Add save/bookmark icon with click handler for authenticated users
  - Apply Tailwind CSS styling with hover effects and transitions
  - _Requirements: 1.2, 1.3, 6.3_

- [x] 4. Build FeedGrid component with infinite scroll


  - Create `src/components/social/FeedGrid.tsx` with responsive CSS Grid layout
  - Implement masonry/grid layout with auto-fit columns (min 300px width)
  - Add Intersection Observer for infinite scroll detection
  - Display loading skeleton while fetching posts
  - Show empty state component when no posts match filters
  - Handle loading states and error states gracefully
  - _Requirements: 1.1, 1.2, 6.1, 6.2_




- [ ] 5. Create PostDetailModal component
  - Create `src/components/social/PostDetailModal.tsx` with full-screen modal layout
  - Display full-size image/video with proper aspect ratio
  - Show complete caption text without truncation
  - Display full engagement metrics with formatted numbers
  - Add "View on [Platform]" button that opens original post in new tab
  - Implement social share buttons (Twitter, Facebook, LinkedIn, Copy Link)


  - Add save/unsave functionality with visual feedback
  - Implement close button and backdrop click to close modal
  - _Requirements: 1.5, 3.1, 3.2, 3.4_

- [ ] 6. Build FeedFilters component
  - Create `src/components/social/FeedFilters.tsx` with filter controls
  - Implement platform selector dropdown (All, Instagram, Twitter, Facebook)
  - Add date range picker with presets (Last 7 days, Last 30 days, Custom)





  - Create location filter dropdown (All, Kakamega, Karura, Mau)
  - Add search input with debouncing (300ms) for caption/author search
  - Implement sort by dropdown (Most recent, Most popular)
  - Update URL query parameters when filters change for shareable links
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Create custom hooks for state management


  - [ ] 7.1 Implement useSocialFeed hook
    - Create `src/hooks/useSocialFeed.ts` for feed state management
    - Manage posts array, loading state, error state, and pagination
    - Implement filter state with debounced updates



    - Add infinite scroll logic with `loadMore()` function
    - Implement 5-minute cache for fetched posts
    - Add `refresh()` function to manually reload feed
    - _Requirements: 1.1, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.4_

  - [ ] 7.2 Implement useSavedPosts hook
    - Create `src/hooks/useSavedPosts.ts` for managing saved posts


    - Fetch user's saved post IDs on mount
    - Implement `savePost()` and `unsavePost()` functions
    - Add `isSaved()` helper function for checking saved status
    - Handle loading and error states
    - _Requirements: 3.3_

- [ ] 8. Build SocialFeedPage main page component
  - Create `src/pages/SocialFeedPage.tsx` as main container
  - Integrate FeedFilters, FeedGrid, and PostDetailModal components
  - Implement state management using useSocialFeed and useSavedPosts hooks
  - Handle post click to open PostDetailModal



  - Add page header with title and description
  - Implement responsive layout for mobile and desktop
  - Add route configuration in React Router
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 9. Implement Supabase Edge Function for post aggregation
  - Create `supabase/functions/aggregate-posts/index.ts` Edge Function
  - Implement Instagram Graph API integration for hashtag search


  - Implement Twitter API v2 integration for recent search with #GangGreen
  - Implement Facebook Graph API integration for hashtag search
  - Normalize post data from all platforms to common schema
  - Check for duplicate posts using external_id before insertion
  - Insert new posts into social_posts table with proper error handling
  - Implement exponential backoff for API rate limit handling
  - Log aggregation metrics (posts fetched, errors, API calls)
  - Trigger content moderation function for new posts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_




- [ ] 10. Implement content moderation Edge Function
  - Create `supabase/functions/moderate-content/index.ts` Edge Function
  - Implement profanity detection using profanity filter library
  - Add spam detection with keyword matching and pattern analysis
  - Integrate sentiment analysis using OpenAI Moderation API
  - Add image content analysis using Cloud Vision API (optional)
  - Store moderation results in moderation_flags table
  - Update post moderation_status and is_visible fields based on results
  - Send notification to admins when posts are flagged
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 11. Build admin moderation dashboard
  - Create `src/components/admin/ModerationDashboard.tsx` component
  - Display list of flagged posts with thumbnails and flag reasons


  - Show moderation confidence scores and flag types
  - Implement approve/reject actions for each flagged post
  - Add bulk actions for approving/rejecting multiple posts
  - Update post visibility and moderation status on admin decision
  - Store review notes and reviewer information
  - Add filtering by flag type and date
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 12. Create FeedAnalytics component for admin dashboard
  - Create `src/components/social/FeedAnalytics.tsx` component
  - Display total posts count, total engagement, and unique authors metrics
  - Implement platform breakdown pie chart using Recharts
  - Create engagement trends line chart over time
  - Display top 10 posts by engagement in a table
  - Add date range selector for analytics period
  - Implement CSV export functionality for analytics data
  - Restrict access to admin users only
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_




- [ ] 13. Set up cron job for scheduled post aggregation
  - Configure Supabase cron job to run aggregate-posts function every 15 minutes
  - Add SQL script to create cron schedule in migration file
  - Test cron job execution and verify posts are fetched automatically
  - Add monitoring and alerting for failed cron executions
  - _Requirements: 2.3_

- [ ] 14. Add environment variables and deployment configuration
  - Add Instagram, Twitter, Facebook API credentials to `.env` file
  - Add OpenAI API key for content moderation
  - Update `.env.example` with new required variables
  - Deploy Edge Functions to Supabase
  - Run database migration to create tables
  - Configure CORS headers for Edge Functions
  - Test API integrations in production environment
  - _Requirements: 2.1, 2.2, 4.5_

- [ ] 15. Implement error handling and loading states
  - Add error boundary component for social feed section
  - Implement toast notifications for user actions (save, share, errors)
  - Create skeleton loaders for PostCard components
  - Add empty state component with illustration when no posts found
  - Implement fallback placeholder image for failed image loads
  - Add retry mechanism for failed API requests
  - Log errors to monitoring service in production
  - _Requirements: 6.5_

- [ ] 16. Add navigation and integrate with existing platform
  - Add "Social Feed" link to main navigation menu
  - Create route in `src/App.tsx` for `/social-feed` path
  - Add social feed preview section to home page (optional)
  - Update sitemap and meta tags for SEO
  - Ensure consistent styling with existing platform design
  - _Requirements: 1.1_

- [ ] 17. Write unit tests for components and services
  - Write tests for PostCard component (rendering, interactions, save functionality)
  - Write tests for FeedFilters component (filter changes, URL updates)
  - Write tests for PostDetailModal component (open/close, external links)
  - Write tests for socialFeed.service.ts (all CRUD operations with mocked Supabase)
  - Write tests for useSocialFeed hook (pagination, filtering, caching)
  - Write tests for useSavedPosts hook (save/unsave operations)
  - Achieve minimum 80% code coverage
  - _Requirements: All_

- [ ] 18. Perform integration and E2E testing
  - Write integration tests for end-to-end feed loading with filters
  - Test infinite scroll pagination behavior
  - Test save/unsave post flow with authentication
  - Test post detail modal interaction
  - Write E2E tests using Playwright for complete user flows
  - Test admin moderation dashboard workflows
  - Test analytics data fetching and display
  - _Requirements: All_

- [ ] 19. Performance optimization and monitoring
  - Implement React.memo for PostCard components to prevent unnecessary re-renders
  - Add performance monitoring for API response times
  - Optimize database queries with EXPLAIN ANALYZE
  - Set up caching strategy for frequently accessed data
  - Monitor API rate limits and adjust aggregation frequency if needed
  - Run Lighthouse audit and optimize for 90+ score
  - Test performance on mobile devices
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
