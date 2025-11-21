# Implementation Plan

## Phase 1: Foundation - Core Design System Setup

- [x] 1. Set up design tokens and CSS custom properties

  - [x] 1.1 Update `src/index.css` with comprehensive design tokens


    - Add color tokens (green spectrum, glass effects, gradients)
    - Add spacing tokens (xs through 4xl)
    - Add typography tokens (font families, sizes, weights)
    - Add animation tokens (easing curves, durations)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 7.1_
  
  - [x] 1.2 Add Tailwind CSS utility classes for glass effects


    - Configure glass card utilities in `tailwind.config.js`
    - Add glass button utilities
    - Add hover effect utilities (lift, glow)
    - Add gradient utilities
    - _Requirements: 3.1, 3.2, 3.3, 5.4_
  
  - [x] 1.3 Implement browser compatibility fallbacks

    - Add @supports rules for backdrop-filter
    - Create fallback solid backgrounds
    - Add prefers-reduced-motion media queries
    - _Requirements: 3.4, 4.4, 11.2, 11.3_

- [x] 2. Create type definitions for design system

  - [x] 2.1 Create `src/types/icon.types.ts`


    - Define IconConfig interface
    - Define IconCategory type
    - Define IconSize type and IconSizeMap
    - _Requirements: 1.2, 1.3_
  
  - [x] 2.2 Create `src/types/glass.types.ts`


    - Define GlassConfig interface
    - Define GlassVariant and HoverEffect types
    - Define GlassVariantConfig interface
    - _Requirements: 3.1, 3.2_

- [x] 3. Enhance icon mapping system


  - [x] 3.1 Update `src/components/navigation/iconMap.tsx` with comprehensive Lucide coverage


    - Import all required Lucide icons (TreePine, Sprout, Award, Medal, Trophy, Star, TrendingUp, BarChart3, Activity, Users, Heart, HandHeart, Sparkles, Zap, Target, Wallet, Coins, Shield, Bot, Cpu, Lightbulb, MapPin, Globe, Navigation, ArrowRight, ChevronRight, ExternalLink, Quote, MessageCircle, Share2, Bell, Settings, LogOut, Plus, Minus, Lock, CheckCircle, Clock, Bookmark, MoreHorizontal, Flag, Edit, Trash2, Filter, SortAsc, Grid, List, Key, Link, DollarSign, TrendingDown, Download)
    - Create enhanced iconMap with category metadata
    - Update Icon component with size variants and accessibility
    - Add fallback rendering for missing icons
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1_
  
  - [x] 3.2 Create icon documentation helper

    - Generate icon reference mapping
    - Document usage examples for each category
    - _Requirements: 1.2, 12.2_

## Phase 2: Base Glass Components

- [x] 4. Enhance GlassCard component

  - [x] 4.1 Update `src/components/common/GlassCard.tsx`


    - Implement variant system (default, dark, green, heavy)
    - Add hover effect options (lift, glow, tilt, none)
    - Implement 3D tilt effect with Framer Motion
    - Add onClick handler support
    - Ensure accessibility with focus states
    - _Requirements: 3.1, 3.2, 3.3, 9.2_

- [x] 5. Enhance GlassButton component

  - [x] 5.1 Update `src/components/common/GlassButton.tsx`


    - Integrate Lucide React icons
    - Add loading state with spinner
    - Add disabled state styling
    - Implement size variants (sm, md, lg)
    - Implement variant styles (primary, secondary, ghost)
    - Add keyboard accessibility
    - _Requirements: 3.2, 4.1, 4.2, 9.2, 9.3_

- [x] 6. Enhance GlassTooltip component

  - [x] 6.1 Update `src/components/common/GlassTooltip.tsx`


    - Add position variants (top, bottom, left, right)
    - Implement configurable delay
    - Add keyboard trigger support
    - Ensure smooth Framer Motion animations
    - _Requirements: 3.3, 4.1, 4.2, 9.3_

- [x] 7. Enhance AnimatedSection component


  - [x] 7.1 Update `src/components/common/AnimatedSection.tsx`


    - Add animation preset options (fadeInUp, slideInRight, scaleIn, rotateIn)
    - Implement configurable threshold and delay
    - Add prefers-reduced-motion support
    - Optimize for 60fps performance
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1, 10.3_

## Phase 3: Navigation Components Update

- [x] 8. Update Navigation component icons


  - [x] 8.1 Update `src/components/navigation/Navigation.tsx`


    - Replace Menu icon usage with proper Lucide import
    - Ensure all navigation items use Icon component
    - Apply glass effects to navigation bar
    - Add glass dropdown styling
    - _Requirements: 1.1, 2.1, 3.1_
  
  - [x] 8.2 Update `src/components/navigation/navigationConfig.ts`


    - Update all icon references to use new icon names
    - Ensure icon names match iconMap entries
    - Add ARIA labels for accessibility
    - _Requirements: 1.5, 2.1, 9.1_

- [x] 9. Update UserMenu component

  - [x] 9.1 Update `src/components/navigation/UserMenu.tsx`

    - Add Settings, LogOut, User icons from Lucide
    - Apply glass card styling to dropdown
    - Add glass button styling to menu items
    - Implement hover effects
    - _Requirements: 2.1, 3.1, 3.2_

- [x] 10. Update BottomNavBar component

  - [ ] 10.1 Update `src/components/navigation/BottomNavBar.tsx`
    - Update all navigation icons
    - Apply glass effects to mobile nav bar
    - Ensure touch targets are 44x44px minimum
    - Test responsive behavior
    - _Requirements: 2.1, 8.4_


- [ ] 11. Update NotificationCenter component
  - [ ] 11.1 Update `src/components/navigation/NotificationCenter.tsx`
    - Add Bell icon from Lucide
    - Apply glass card to notification dropdown
    - Add glass button styling
    - Implement notification icon badges
    - _Requirements: 2.1, 3.1, 3.2_


- [ ] 12. Update QuickActions component
  - [ ] 12.1 Update `src/components/navigation/QuickActions.tsx`
    - Add Zap, Plus icons from Lucide
    - Apply glass button styling
    - Add glass tooltip for action descriptions

    - _Requirements: 2.1, 3.2, 3.3_

- [ ] 13. Update GGCoinDisplay component
  - [ ] 13.1 Update `src/components/navigation/GGCoinDisplay.tsx`
    - Add Coins icon from Lucide
    - Apply glass card styling

    - Add animated counter with glass effects
    - _Requirements: 2.1, 3.1, 4.1_

- [ ] 14. Update NavDropdown component
  - [ ] 14.1 Update `src/components/navigation/NavDropdown.tsx`
    - Update ChevronDown icon usage
    - Apply glass card to dropdown menu
    - Add smooth animations with Framer Motion
    - _Requirements: 2.1, 3.1, 4.1_

## Phase 4: Home Page Components Update

- [x] 15. Update ImpactMetrics component


  - [x] 15.1 Update `src/components/home/ImpactMetrics.tsx`


    - Replace emoji icons with Lucide icons (TreePine, Globe, Users, Trophy)
    - Apply glass card styling to metric cards
    - Add hover lift effect
    - Implement scroll-triggered animations
    - _Requirements: 2.2, 3.1, 4.1_

- [ ] 16. Update FeatureHighlights component
  - [ ] 16.1 Update `src/components/home/FeatureHighlights.tsx`
    - Add feature icons (TreePine, Award, TrendingUp, Users, Sparkles, Wallet, Bot, MapPin)
    - Apply glass card styling to feature cards
    - Add hover glow effect
    - Implement stagger animations
    - _Requirements: 2.2, 3.1, 4.1_

- [ ] 17. Update NFTBadgeShowcase component
  - [ ] 17.1 Update `src/components/home/NFTBadgeShowcase.tsx`
    - Add badge icons (Award, Star, Medal, Trophy)
    - Apply glass card styling to badge cards
    - Add 3D tilt hover effect
    - Implement scroll animations
    - _Requirements: 2.2, 3.1, 4.1_

- [ ] 18. Update LeaderboardPreview component
  - [ ] 18.1 Update `src/components/home/LeaderboardPreview.tsx`
    - Add ranking icons (Trophy, Medal, TrendingUp)
    - Apply glass card styling to leaderboard
    - Add rank badges with gradient styling
    - Implement animated entries
    - _Requirements: 2.2, 3.1, 4.1, 5.4_

- [ ] 19. Update SocialProofSection component
  - [ ] 19.1 Update `src/components/home/SocialProofSection.tsx`
    - Add social icons (Quote, Users, Star)
    - Apply glass card styling to testimonials
    - Add hover effects
    - _Requirements: 2.2, 3.1, 4.1_

- [ ] 20. Update PilotForestsMap component
  - [ ] 20.1 Update `src/components/home/PilotForestsMap.tsx`
    - Add location icons (MapPin, TreePine, Navigation)
    - Apply glass overlay to map markers
    - Add glass tooltip for forest info
    - _Requirements: 2.2, 3.1, 3.3_

- [ ] 21. Update PartnershipSection component
  - [ ] 21.1 Update `src/components/home/PartnershipSection.tsx`
    - Add partnership icons (HandHeart, Users)
    - Apply glass card styling to partner cards
    - Add hover lift effect
    - _Requirements: 2.2, 3.1, 4.1_

- [ ] 22. Update Header component
  - [ ] 22.1 Update `src/components/home/Header.tsx`
    - Update navigation icons
    - Apply glass effects to header
    - Ensure responsive behavior
    - _Requirements: 2.1, 3.1, 8.1_

- [ ] 23. Update HomeFooter component
  - [ ] 23.1 Update `src/components/home/HomeFooter.tsx`
    - Add footer icons (social media, navigation)
    - Apply glass styling if applicable
    - Ensure accessibility
    - _Requirements: 2.1, 9.1_

## Phase 5: Gamification Components Update

- [ ] 24. Update GGCoinBalance component
  - [ ] 24.1 Update `src/components/gamification/GGCoinBalance.tsx`
    - Add Coins, Plus, Minus, TrendingUp icons
    - Apply glass card styling
    - Add animated counter
    - Implement transaction history with glass cards
    - _Requirements: 2.3, 3.1, 4.1_

- [ ] 25. Update achievement and level components
  - [ ] 25.1 Create/update achievement card components
    - Add achievement icons (Sparkles, Star, Lock, Award)
    - Apply glass card styling
    - Add unlock animations
    - Implement progress indicators
    - _Requirements: 2.3, 3.1, 4.1_
  
  - [ ] 25.2 Create/update level progress components
    - Add level icons (Zap, Target, Activity)
    - Apply glass progress bar styling
    - Add level-up animations
    - _Requirements: 2.3, 3.1, 4.1_
  
  - [ ] 25.3 Create/update challenge card components
    - Add challenge icons (Target, Clock, CheckCircle)
    - Apply glass card styling
    - Add completion animations
    - _Requirements: 2.3, 3.1, 4.1_

## Phase 6: Social Components Update

- [ ] 26. Update PostCard component
  - [ ] 26.1 Update `src/components/social/PostCard.tsx`
    - Add interaction icons (Heart, MessageCircle, Share2, Bookmark)
    - Add action icons (MoreHorizontal, Flag, Edit, Trash2)
    - Apply glass card styling
    - Add hover effects
    - Ensure accessibility with ARIA labels
    - _Requirements: 2.4, 3.1, 9.1_

- [ ] 27. Update FeedGrid component
  - [ ] 27.1 Update `src/components/social/FeedGrid.tsx`
    - Update view toggle icons (Grid, List)
    - Apply glass styling to grid container
    - Implement scroll animations
    - _Requirements: 2.4, 3.1, 4.1_

- [ ] 28. Update FeedFilters component
  - [ ] 28.1 Update `src/components/social/FeedFilters.tsx`
    - Add filter icons (Filter, SortAsc)
    - Apply glass button styling
    - Add glass dropdown for filter options
    - _Requirements: 2.4, 3.2, 3.1_

- [ ] 29. Update PostDetailModal component
  - [ ] 29.1 Update `src/components/social/PostDetailModal.tsx`
    - Update all interaction icons
    - Apply glass modal backdrop
    - Add glass card styling to modal content
    - Implement smooth animations
    - _Requirements: 2.4, 3.1, 4.1_

## Phase 7: Web3 & NFT Components Update

- [ ] 30. Update Web3 wallet components
  - [ ] 30.1 Create/update wallet connection components
    - Add wallet icons (Wallet, Shield, Key, Link)
    - Apply glass button styling to connect button
    - Add glass card for wallet info display
    - Implement connection status indicators
    - _Requirements: 2.5, 3.1, 3.2_

- [ ] 31. Update BadgeMarketplace component
  - [ ] 31.1 Update `src/components/nft/BadgeMarketplace.tsx`
    - Add marketplace icons (ShoppingBag, Award, Coins)
    - Apply glass card styling to badge listings
    - Add hover effects with 3D tilt
    - Implement filter and sort icons
    - _Requirements: 2.5, 3.1, 4.1_

- [ ] 32. Update BadgePurchaseModal component
  - [ ] 32.1 Update `src/components/nft/BadgePurchaseModal.tsx`
    - Add purchase icons (Wallet, Coins, DollarSign)
    - Apply glass modal styling
    - Add glass button for purchase action
    - Implement loading states
    - _Requirements: 2.5, 3.1, 3.2_

- [ ] 33. Update BadgePurchaseConfirmation component
  - [ ] 33.1 Update `src/components/nft/BadgePurchaseConfirmation.tsx`
    - Add confirmation icons (CheckCircle, Award, ExternalLink)
    - Apply glass card styling
    - Add success animations
    - _Requirements: 2.5, 3.1, 4.1_

- [ ] 34. Update BadgeSocialShare component
  - [ ] 34.1 Update `src/components/nft/BadgeSocialShare.tsx`
    - Add share icons (Share2, ExternalLink, Download)
    - Apply glass button styling
    - Add glass tooltip for share options
    - _Requirements: 2.5, 3.2, 3.3_

## Phase 8: Layout & Admin Components Update

- [ ] 35. Update Layout component
  - [ ] 35.1 Update `src/components/layout/Layout.tsx`
    - Ensure consistent icon usage across layout
    - Apply glass effects where appropriate
    - Test responsive behavior
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 36. Update Footer component
  - [ ] 36.1 Update `src/components/layout/Footer.tsx`
    - Add footer navigation icons
    - Add social media icons (from Lucide or custom)
    - Apply glass styling if on transparent background
    - Ensure accessibility
    - _Requirements: 2.1, 9.1, 9.2_

- [ ] 37. Update admin components
  - [ ] 37.1 Update `src/components/admin/ModerationDashboard.tsx`
    - Add admin icons (Shield, Flag, CheckCircle, Trash2)
    - Apply glass card styling to dashboard widgets
    - Add data visualization icons (BarChart3, TrendingUp, Activity)
    - _Requirements: 2.1, 3.1_
  
  - [ ] 37.2 Update `src/components/admin/BadgePurchaseAnalytics.tsx`
    - Add analytics icons (BarChart3, TrendingUp, DollarSign)
    - Apply glass card styling to charts
    - Add filter icons
    - _Requirements: 2.1, 3.1_

## Phase 9: Responsive Design & Accessibility

- [ ] 38. Implement responsive design adjustments
  - [ ] 38.1 Test and adjust icon sizes across breakpoints
    - Verify icon sizing at 640px, 768px, 1024px, 1280px, 1536px
    - Adjust typography scale for mobile
    - Ensure touch targets are 44x44px minimum on mobile
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 38.2 Test glass effects on mobile devices
    - Verify backdrop-filter performance
    - Test fallbacks on older mobile browsers
    - Optimize for mobile performance
    - _Requirements: 10.3, 11.1, 11.2_

- [ ] 39. Implement accessibility enhancements
  - [ ] 39.1 Add ARIA labels to all icon-only buttons
    - Audit all components for missing labels
    - Add aria-label or aria-labelledby attributes
    - Add screen reader text where needed
    - _Requirements: 1.5, 9.1, 9.4_
  
  - [ ] 39.2 Implement focus indicators
    - Add visible focus states to all interactive elements
    - Ensure 2px green outline with offset
    - Test keyboard navigation flow
    - _Requirements: 9.2, 9.3_
  
  - [ ] 39.3 Verify color contrast ratios
    - Test all text on glass backgrounds
    - Ensure 4.5:1 contrast ratio minimum
    - Adjust colors if needed
    - _Requirements: 3.4, 5.5, 6.5_

## Phase 10: Testing & Documentation

- [ ] 40. Write component tests
  - [ ]* 40.1 Write Icon component tests
    - Test icon rendering
    - Test size variants
    - Test ARIA labels
    - Test fallback behavior
    - _Requirements: 1.1, 1.5_
  
  - [ ]* 40.2 Write GlassCard component tests
    - Test variant rendering
    - Test hover effects
    - Test click handlers
    - Test accessibility
    - _Requirements: 3.1, 3.2, 9.2_
  
  - [ ]* 40.3 Write GlassButton component tests
    - Test variant rendering
    - Test icon integration
    - Test loading and disabled states
    - Test keyboard navigation
    - _Requirements: 3.2, 9.3_
  
  - [ ]* 40.4 Write AnimatedSection tests
    - Test animation triggers
    - Test prefers-reduced-motion
    - Test performance
    - _Requirements: 4.1, 4.4, 10.3_

- [ ]* 41. Perform integration testing
  - [ ]* 41.1 Test navigation icon integration
    - Verify all navigation icons render correctly
    - Test responsive behavior
    - Test accessibility
    - _Requirements: 2.1, 8.1, 9.1_
  
  - [ ]* 41.2 Test home page icon integration
    - Verify all home page icons render correctly
    - Test animations and glass effects
    - Test performance
    - _Requirements: 2.2, 4.5, 10.5_

- [ ]* 42. Perform cross-browser testing
  - [ ]* 42.1 Test on Chrome, Firefox, Safari, Edge
    - Verify glass effects render correctly
    - Test backdrop-filter fallbacks
    - Verify icon rendering
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ]* 42.2 Test on mobile browsers
    - Test iOS Safari
    - Test Chrome Mobile
    - Test Firefox Mobile
    - _Requirements: 11.1, 11.2_

- [ ]* 43. Perform accessibility audits
  - [ ]* 43.1 Run automated accessibility tests
    - Use axe-core or similar tool
    - Fix any violations
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 43.2 Manual screen reader testing
    - Test with NVDA (Windows)
    - Test with JAWS (Windows)
    - Test with VoiceOver (macOS/iOS)
    - _Requirements: 9.5_

- [ ]* 44. Performance optimization
  - [ ]* 44.1 Optimize animations for 60fps
    - Profile animation performance
    - Optimize GPU acceleration
    - Reduce will-change usage
    - _Requirements: 4.5, 10.1, 10.3, 10.4_
  
  - [ ]* 44.2 Run Lighthouse audits
    - Achieve performance score > 90
    - Achieve accessibility score > 95
    - Fix any issues
    - _Requirements: 10.5_

- [ ] 45. Update documentation
  - [ ] 45.1 Update DESIGN_SYSTEM.md
    - Document all implemented components
    - Add usage examples
    - Update icon mapping reference
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ] 45.2 Create migration guide
    - Document breaking changes
    - Provide before/after examples
    - Create upgrade checklist
    - _Requirements: 12.1, 12.5_
  
  - [ ] 45.3 Update component documentation
    - Add JSDoc comments to all components
    - Document props and usage
    - Include accessibility guidelines
    - _Requirements: 12.3, 12.4_

- [ ] 46. Create implementation summary
  - [ ] 46.1 Document completed work
    - List all updated components
    - Document icon replacements
    - Note any deviations from plan
    - _Requirements: 12.1, 12.5_
  
  - [ ] 46.2 Create visual comparison
    - Take before/after screenshots
    - Document design improvements
    - Highlight key changes
    - _Requirements: 12.3_
