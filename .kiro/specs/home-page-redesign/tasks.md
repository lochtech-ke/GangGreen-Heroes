# Implementation Plan

- [x] 1. Set up home page component structure and routing






  - Create new `src/components/home/` directory for all home page components
  - Update `src/pages/HomePage.tsx` to use new component architecture
  - Set up component exports in `src/components/home/index.ts`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement Hero Section with #GangGreen branding





  - [ ] 2.1 Create HeroSection component with responsive layout
    - Build component with full viewport height on desktop
    - Implement background image with gradient overlay
    - Add #GangGreen hashtag with 64px font size and green accent
    - Create headline and subheadline with proper typography

    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 2.2 Add primary and secondary CTAs
    - Implement "Start Your Journey" primary button
    - Add "Explore NFT Badges" secondary button with scroll behavior
    - Connect CTAs to navigation functions

    - Style buttons with green branding and hover effects
    - _Requirements: 1.5, 1.6_
  
  - [ ] 2.3 Make hero section responsive
    - Adjust font sizes for mobile (headline 36px, hashtag 48px)
    - Stack content vertically on mobile devices
    - Optimize background image for different screen sizes
    - Test on mobile, tablet, and desktop breakpoints
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 3. Build NFT Badge Showcase section



  - [x] 3.1 Create NFTBadgeShowcase component


    - Build responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
    - Create section header with "Earn NFT Badges" title
    - Add "View All Badges" CTA button
    - Implement light green gradient background
    - _Requirements: 2.1, 2.5_
  
  - [x] 3.2 Implement FeaturedBadgeCard component

    - Create card with badge image, name, and description
    - Display GG Coin price and KES 200 price
    - Add rarity indicator with colored borders
    - Implement hover effects (scale 1.05, elevated shadow)
    - Show unlock requirements in tooltip on hover
    - _Requirements: 2.2, 2.3, 2.4, 2.6_
  
  - [x] 3.3 Connect to badge data service

    - Fetch featured badges from API or database
    - Implement loading state with skeleton cards
    - Handle error states gracefully
    - Filter to show 6 featured badges
    - _Requirements: 2.1, 2.5_

- [x] 4. Create Impact Metrics section with real-time updates



  - [x] 4.1 Build ImpactMetrics component


    - Create 4-column grid layout (responsive to 2x2 on tablet, stack on mobile)
    - Implement MetricCard sub-component
    - Add icons for each metric (trees, carbon, users, badges)
    - Style with white cards and centered content
    - _Requirements: 3.1, 3.5_
  
  - [x] 4.2 Implement animated counter effect

    - Create counter animation that counts up from 0
    - Trigger animation when section enters viewport
    - Use smooth easing function for natural feel
    - Format numbers with commas and appropriate units
    - _Requirements: 3.3_
  
  - [x] 4.3 Add real-time data fetching

    - Fetch metrics from Supabase database
    - Update metrics every 60 seconds
    - Implement smooth transition for value changes
    - Handle loading and error states
    - _Requirements: 3.2, 15.6_

- [x] 5. Develop User Journey Visualization



  - [x] 5.1 Create UserJourneyVisualization component


    - Build horizontal timeline for desktop
    - Create vertical list layout for mobile
    - Add connecting line between steps (2px dashed green)
    - Implement section header and CTA
    - _Requirements: 4.1, 4.2_
  
  - [x] 5.2 Build JourneyStep cards

    - Create 7 step cards: Discover, Sign Up, Choose Causes, Take Action, Earn Rewards, Track Impact, Build Legacy
    - Add 64px circular icons for each step
    - Implement hover effect with expanded description tooltip
    - Highlight AI chatbot and NFT badge mentions
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

- [x] 6. Implement Pilot Forests Interactive Map



  - [x] 6.1 Set up Leaflet.js map integration


    - Install and configure Leaflet.js library
    - Create PilotForestsMap component
    - Set up map container with 500px height on desktop
    - Configure satellite or terrain map style
    - _Requirements: 5.1_
  
  - [x] 6.2 Add forest markers and popups

    - Create custom green tree icon markers
    - Add pulse animation to markers
    - Place markers for Kakamega, Karura, and Mau forests
    - Implement popup with forest photo, stats, and description
    - Add "Join Local Initiative" CTA in each popup
    - Auto-fit map to show all markers on load
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 7. Build Feature Highlights section



  - [x] 7.1 Create FeatureHighlights component


    - Build responsive grid (3 columns desktop, 2 tablet, 1 mobile)
    - Create FeatureCard sub-component
    - Add section header
    - _Requirements: 7.1, 7.3_
  
  - [x] 7.2 Implement 6 feature cards

    - Create cards for: Tree Planting, Carbon Credits, NFT Badges, Gamification, AI Guidance, Web3 Integration
    - Add 56px icons with green color
    - Write 2-3 sentence descriptions
    - Add "Learn More" links with arrow icons
    - Implement hover elevation effect
    - _Requirements: 7.2, 7.4, 7.5, 7.6_

- [x] 8. Create Social Proof section



  - [x] 8.1 Build SocialProofSection component


    - Create two-column layout (testimonials left, achievements right)
    - Add light gray background (#F9FAFB)
    - Implement section header
    - _Requirements: 6.1_
  
  - [x] 8.2 Implement testimonial carousel

    - Create TestimonialCard component with quote, photo, and stats
    - Add auto-rotation every 8 seconds
    - Include 3 diverse testimonials (student, community member, organization)
    - Display user role, location, trees planted, and badges earned
    - Add navigation dots for manual control
    - _Requirements: 6.2, 6.3_
  
  - [x] 8.3 Add recent achievements feed

    - Create scrolling list of latest 10 badge achievements
    - Display user name, badge name, badge image, and timestamp
    - Fetch from database with real-time updates
    - _Requirements: 6.5_
  
  - [x] 8.4 Add user photo gallery

    - Display grid of 12 user-generated tree planting photos
    - Use rounded corners and consistent sizing
    - Implement lazy loading for images
    - _Requirements: 6.4_

- [x] 9. Implement Leaderboard Preview section




  - [x] 9.1 Create LeaderboardPreview component

    - Build component to display top 5 users
    - Add section header with time period indicator
    - Include "View Full Leaderboard" CTA
    - Add "Join the Competition" signup CTA
    - _Requirements: 8.1, 8.4_
  
  - [x] 9.2 Build leaderboard entry cards

    - Display rank number with special styling for top 3 (gold, silver, bronze)
    - Show user avatar, name, and level
    - Display points, trees planted, and badges earned with icons
    - Add colored backgrounds for top 3 positions
    - Implement fade-in animation for sequential rank reveal
    - _Requirements: 8.2, 8.3, 8.5_
  
  - [x] 9.3 Connect to leaderboard data

    - Fetch top 5 users from database
    - Filter by current week or month
    - Handle loading and error states
    - _Requirements: 8.6_

- [x] 10. Build Partnership and Credibility section



  - [x] 10.1 Create PartnershipSection component


    - Build responsive logo grid (4 columns desktop, 2 mobile)
    - Add section header
    - Implement white background
    - _Requirements: 9.1, 9.5_
  
  - [x] 10.2 Add partner logos

    - Display logos for: Green Belt Movement, GSMA, Antugrow, Wangari Maathai Hackathon
    - Use grayscale by default, color on hover
    - Size logos at 150px width with auto height
    - Add 32px spacing between logos
    - Show partner description in tooltip on hover




    - _Requirements: 9.2, 9.3, 9.4, 9.6_

- [ ] 11. Implement sticky header and navigation
  - [ ] 11.1 Create sticky header component
    - Build header with #GangGreen logo and branding

    - Add navigation menu items
    - Implement sticky behavior on scroll
    - Style with white background and shadow
    - _Requirements: 10.3_
  



  - [ ] 11.2 Add authentication CTAs
    - Display "Sign In" and "Get Started" buttons for unauthenticated users
    - Show "Dashboard" button for authenticated users
    - Connect buttons to navigation functions
    - Style with green branding
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.6, 15.4_




- [ ] 12. Create footer component
  - Create footer with quick links section
  - Add social media links
  - Include copyright and Loch Tech Solutions credit
  - Add Wangari Maathai Hackathon mention

  - Style with white background and top border
  - Make responsive for mobile devices
  - _Requirements: 9.2_

- [ ] 13. Implement performance optimizations
  - [x] 13.1 Optimize images

    - Convert images to WebP format with JPEG fallback
    - Implement responsive images with srcset
    - Compress images to < 100KB
    - Add blur-up placeholder technique



    - _Requirements: 13.1, 13.2_
  
  - [ ] 13.2 Add lazy loading
    - Implement lazy loading for images below the fold
    - Lazy load map component
    - Lazy load leaderboard preview

    - Use React.lazy and Suspense for code splitting

    - _Requirements: 13.1_
  
  - [ ] 13.3 Implement loading states
    - Create skeleton screens for each section
    - Add loading spinners for dynamic content
    - Implement progressive content loading
    - _Requirements: 13.5_


- [ ] 14. Add accessibility features
  - [ ] 14.1 Implement WCAG compliance
    - Add alt text for all images
    - Ensure color contrast ratio > 4.5:1

    - Add ARIA labels for interactive elements
    - Implement keyboard navigation support
    - Add visible focus indicators
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 15. Set up analytics and tracking
  - [ ] 15.1 Implement event tracking
    - Track CTA clicks for all buttons

    - Track scroll depth

    - Track badge card hovers and clicks
    - Track map interactions
    - Track video plays (if hero video added)
    - _Requirements: 14.2, 14.3, 14.5_
  

  - [ ] 15.2 Add conversion tracking
    - Track registration starts from home page
    - Track badge marketplace visits
    - Track initiative joins from map
    - Create analytics dashboard for home page metrics

    - _Requirements: 14.1, 14.4, 14.6_

- [ ] 16. Implement SEO optimization
  - Add meta tags for title, description, and keywords

  - Implement Open Graph tags for social sharing
  - Add Twitter Card meta tags
  - Create structured data (JSON-LD) for organization
  - Optimize page title with #GangGreen branding
  - Add canonical URL
  - _Requirements: 1.1_

- [ ] 17. Add dynamic content and personalization
  - [x] 17.1 Implement content rotation

    - Rotate featured badges on each visit
    - Rotate testimonials to show fresh content
    - Update seasonal or campaign-specific content
    - _Requirements: 15.2, 15.3_
  
  - [ ] 17.2 Add personalization
    - Show personalized content for returning visitors
    - Replace signup CTAs with "Dashboard" for authenticated users
    - Display location-specific content when available
    - _Requirements: 15.1, 15.4, 15.5_
  
  - [x] 17.3 Set up real-time updates


    - Update impact metrics every 5 minutes
    - Refresh recent achievements feed
    - Update leaderboard data
    - _Requirements: 15.6_

- [ ] 18. Mobile optimization and responsive testing
  - Test all sections on mobile devices (320px to 480px width)
  - Test on tablets (768px to 1024px width)
  - Test on desktop (1280px and above)
  - Verify touch-friendly button sizes (44x44px minimum)
  - Test orientation changes
  - Optimize for 3G connection speeds
  - Achieve Google Lighthouse mobile score > 85
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 19. Integration and end-to-end testing
  - Test complete page load and render
  - Verify all CTAs navigate correctly
  - Test data fetching and error handling
  - Verify animations and transitions
  - Test with real badge data from database
  - Test with real metrics from Supabase
  - Verify map loads and markers are clickable
  - Test social proof carousel auto-rotation
  - Verify leaderboard data accuracy
  - Test performance with Lighthouse (target > 85)
  - _Requirements: All requirements_

- [ ] 20. Final polish and deployment preparation
  - Review all content for accuracy and tone
  - Verify #GangGreen branding is consistent
  - Check all images are optimized and loading
  - Verify all links work correctly
  - Test error states and fallbacks
  - Review accessibility with screen reader
  - Run final performance audit
  - Create deployment checklist
  - Document any environment variables needed
  - _Requirements: All requirements_
