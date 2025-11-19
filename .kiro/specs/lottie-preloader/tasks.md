# Implementation Plan

- [x] 1. Set up project dependencies and type definitions
  - Install pixi.js and @pixi/react packages via npm
  - Create TypeScript interfaces for preloader props, state, and scene configuration in `src/types/preloader.types.ts`
  - Export types from `src/types/index.ts`
  - _Requirements: 5.5, 6.1, 6.2, 6.3, 6.4_

- [x] 2. Implement Scene 1: African child planting seedling


  - Create `src/components/common/preloader/Scene1.ts` module
  - Implement setup function to create child character using Pixi.Graphics (simple geometric shapes)
  - Create seedling sprite and soil particles
  - Implement animate function with keyframe interpolation for planting motion (0-2s)
  - Use warm color palette: browns (#8B4513), greens (#228B22), skin tones (#8D5524)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Implement Scene 2: Seedling growth time-lapse


  - Create `src/components/common/preloader/Scene2.ts` module
  - Implement tree growth animation using scale transformations
  - Create tree trunk (rounded rectangle) and leaves (circles with alpha)
  - Animate from seedling (scale 0.1) to full tree (scale 1.0) over 2 seconds
  - Add optional root system and sun/rain particle effects
  - Use vibrant greens (#00FF00, #228B22), brown (#654321), sky blue (#87CEEB)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Implement geolocation detection service
  - Create `src/services/geolocation.service.ts` module
  - Implement function to detect user's country using browser Geolocation API
  - Integrate with free geolocation service (ipapi.co or ip-api.com) to convert coordinates to country
  - Implement localStorage caching to avoid repeated API calls
  - Add error handling and fallback to Kenya as default
  - Export GeolocationData interface and detection function
  - _Requirements: 4.2, 4.7_

- [ ] 5. Create flag color mappings
  - Create `src/components/common/preloader/flagColors.ts` module
  - Define FlagColors interface with primary, secondary, tertiary, and accent colors
  - Create FLAG_COLORS mapping for African countries (Kenya, Nigeria, South Africa, Ghana, Ethiopia, etc.)
  - Export function to get flag colors by country code with Kenya as default
  - _Requirements: 4.3, 4.7_

- [ ] 6. Create animation easing utilities
  - Create `src/components/common/preloader/easingFunctions.ts` module
  - Implement easing functions: easeInOutCubic, easeOutElastic, easeInOutQuad
  - Export utility functions for smooth animations
  - _Requirements: 7.2_

- [ ] 7. Enhance Scene 1 with visual improvements
  - Update `src/components/common/preloader/Scene1.ts` with particle effects
  - Add soil particle system for digging animation
  - Implement smooth easing for character movements
  - Add gradient background for depth
  - Apply drop shadows to character and seedling
  - Enhance color vibrancy and contrast
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.3, 7.4, 7.7_

- [ ] 8. Enhance Scene 2 with visual improvements
  - Update `src/components/common/preloader/Scene2.ts` with particle effects
  - Add leaf particle system for growth animation
  - Implement smooth easing for tree growth
  - Add gradient sky background with lighting effects
  - Apply glow effect to growing tree
  - Add subtle wind animation to leaves
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.7_

- [ ] 9. Implement Scene 3 with geolocation-based flag colors
  - Update `src/components/common/preloader/Scene3.ts` to accept flagColors parameter
  - Implement parallax background layers with dynamic flag colors
  - Add Pixi.js BlurFilter to background layers
  - Create text sprites for "Chill Kiasi..." message with crisp anti-aliasing
  - Add hashtags "#GangGreen" and "#GreenBeltMovement" below main text
  - Implement fade-in animation and parallax scrolling effect (1.5s duration)
  - Apply smooth color transitions and text shadows
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 7.5, 7.6, 7.7_

- [ ] 10. Update animation timeline controller
  - Update `src/components/common/preloader/AnimationTimeline.ts` to pass flagColors to Scene 3
  - Implement smooth scene transitions with color blending
  - Ensure 60 FPS performance monitoring
  - Add frame drop detection and quality adjustment
  - _Requirements: 1.4, 2.3, 3.3, 7.1, 7.6_

- [ ] 11. Update main PixiPreloader component with geolocation
  - Update `src/components/common/PixiPreloader.tsx` to detect user location on mount
  - Call geolocation service to get country and flag colors
  - Pass flag colors to Scene 3 setup function
  - Handle geolocation errors gracefully with Kenya fallback
  - Add loading state for geolocation detection
  - _Requirements: 4.2, 4.3, 4.7_

- [ ]*  11. Write unit tests for components and hooks
  - [ ]* 11.1 Test PixiPreloader component
    - Test component renders with default props
    - Test custom configuration props are applied
    - Test minimum display duration enforcement
    - Test fade-out animation triggers correctly
    - Test onComplete callback invocation
    - Test fallback loader on WebGL initialization failure
    - Test Pixi.js application is properly destroyed on unmount
    - _Requirements: 1.1, 1.3, 1.5, 5.4, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 11.2 Test FallbackLoader component
    - Test fallback loader renders correctly
    - Test responsive styling on different viewports
    - _Requirements: 5.4_

  - [ ]* 11.3 Test useAppReady hook
    - Test hook returns false during app initialization
    - Test hook returns true when app is ready
    - Test hook handles slow network conditions
    - _Requirements: 1.3_

  - [ ]* 11.4 Test scene modules
    - Test Scene1 setup and animation functions
    - Test Scene2 setup and animation functions
    - Test Scene3 setup and animation functions
    - Test AnimationTimeline scene transitions
    - _Requirements: 2.1, 3.1, 4.1_

- [ ]* 12. Perform integration and visual testing
  - [ ]* 12.1 Test preloader integration with app
    - Verify preloader displays on app initialization
    - Verify preloader hides when app is ready
    - Verify minimum display duration is respected
    - Test skip functionality (if enabled)
    - Test geolocation detection and flag color display
    - Test fallback to Kenya when geolocation fails
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 4.2, 4.7, 6.5_

  - [ ]* 12.2 Test responsive behavior
    - Test animation renders correctly on desktop (1920x1080)
    - Test animation scales on tablet (768x1024)
    - Test animation scales on mobile (375x667)
    - Verify aspect ratio is maintained
    - Test visual enhancements on different screen sizes
    - _Requirements: 5.2, 5.3, 7.1_

  - [ ]* 12.3 Test performance
    - Verify Pixi.js initializes within 500ms
    - Test animation renders at 60 FPS on mid-range devices
    - Monitor memory usage during animation playback
    - Check for memory leaks
    - Verify smooth fade-out transition
    - Verify WebGL context is properly released on cleanup
    - Test particle effects performance
    - _Requirements: 5.1, 5.2, 7.1, 7.3_

  - [ ]* 12.4 Test accessibility
    - Verify screen reader announcements
    - Test keyboard navigation for skip button
    - Verify prefers-reduced-motion support
    - _Requirements: 1.1_

  - [ ]* 12.5 Test visual quality
    - Verify smooth easing on all animations
    - Test particle effects in Scene 1 and Scene 2
    - Verify gradient backgrounds and lighting effects
    - Test text crispness and anti-aliasing
    - Verify shadow and glow effects
    - Test color transitions between scenes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ]* 13. Create documentation
  - Document component usage in README or component comments
  - Document configuration options and their defaults
  - Add examples of different preloader configurations
  - Document how to modify or extend scenes for future updates
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
