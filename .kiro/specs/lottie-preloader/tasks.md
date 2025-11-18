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

- [x] 4. Implement Scene 3: Message display with Kenyan flag colors


  - Create `src/components/common/preloader/Scene3.ts` module
  - Implement parallax background layers with Kenyan flag colors (black, red, green, white)
  - Add Pixi.js BlurFilter to background layers
  - Create text sprites for "Chill Kiasi..." message
  - Add hashtags "#GangGreen" and "#GreenBeltMovement" below main text
  - Implement fade-in animation and parallax scrolling effect (1.5s duration)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Implement animation timeline controller



  - Create `src/components/common/preloader/AnimationTimeline.ts` module
  - Implement timeline management for sequential scene playback
  - Create scene transition logic with proper cleanup between scenes
  - Implement progress tracking and scene switching at correct timestamps
  - Handle Pixi.js ticker for 60 FPS animation loop
  - _Requirements: 1.4, 2.3, 3.3_

- [x] 6. Implement fallback loader component


  - Create `src/components/common/FallbackLoader.tsx` with simple CSS spinner
  - Style with Tailwind CSS using #GangGreen branding colors
  - Add #GangGreen text below spinner
  - Ensure responsive design for all screen sizes
  - _Requirements: 5.4_

- [x] 7. Implement app readiness tracking hook


  - Create `src/hooks/useAppReady.ts` custom hook
  - Track application initialization state (Supabase connection, route loading, etc.)
  - Return boolean indicating when app is ready to display
  - Handle edge cases for slow network conditions
  - _Requirements: 1.3, 6.3_

- [x] 8. Implement main PixiPreloader component

  - [x] 8.1 Create component structure and Pixi.js initialization


    - Create `src/components/common/PixiPreloader.tsx`
    - Initialize Pixi.js Application with WebGL renderer
    - Set up canvas element and attach to DOM
    - Implement component state management for visibility and animation status
    - Handle window resize events for responsive scaling
    - _Requirements: 1.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4_

  - [x] 8.2 Integrate scenes and animation timeline

    - Import Scene1, Scene2, Scene3 modules
    - Initialize AnimationTimeline with scene configurations
    - Wire up scene transitions and progress tracking
    - Implement animation completion detection
    - _Requirements: 1.4, 5.5_

  - [x] 8.3 Implement timing and visibility logic

    - Enforce minimum display duration using setTimeout
    - Track app readiness state using useAppReady hook
    - Calculate when to trigger fade-out based on animation completion and app readiness
    - Implement fade-out transition with configurable duration
    - _Requirements: 1.2, 1.3, 1.5, 6.1, 6.2_

  - [x] 8.4 Implement error handling and fallback

    - Detect WebGL support using feature detection
    - Display FallbackLoader component if WebGL initialization fails
    - Log errors to console for debugging
    - Ensure preloader doesn't block app initialization
    - _Requirements: 5.4_

  - [x] 8.5 Implement cleanup and resource management

    - Properly destroy Pixi.js application on component unmount
    - Release WebGL context and textures
    - Remove event listeners
    - Prevent memory leaks
    - _Requirements: 1.3_

  - [x] 8.6 Add accessibility features

    - Add ARIA attributes for screen readers (role, aria-live, aria-label)
    - Implement prefers-reduced-motion media query support
    - Ensure keyboard accessibility for skip functionality (if enabled)
    - _Requirements: 1.1_

  - [x] 8.7 Implement optional skip functionality

    - Add skip button that appears after minimum display duration
    - Wire skip button to immediately trigger fade-out
    - Make skip button keyboard accessible
    - Style skip button with Tailwind CSS
    - _Requirements: 6.5_

- [x] 9. Integrate preloader into application



  - Import PixiPreloader in `src/App.tsx` or `src/main.tsx`
  - Wrap main application content with conditional rendering based on preloader visibility
  - Pass appropriate configuration props to preloader
  - Test integration with React Suspense boundaries
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 10. Export components from index files


  - Export PixiPreloader from `src/components/common/index.ts`
  - Export FallbackLoader from `src/components/common/index.ts`
  - Export useAppReady hook from `src/hooks/index.ts`
  - _Requirements: 5.5_

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
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 6.5_

  - [ ]* 12.2 Test responsive behavior
    - Test animation renders correctly on desktop (1920x1080)
    - Test animation scales on tablet (768x1024)
    - Test animation scales on mobile (375x667)
    - Verify aspect ratio is maintained
    - _Requirements: 5.2, 5.3_

  - [ ]* 12.3 Test performance
    - Verify Pixi.js initializes within 500ms
    - Test animation renders at 60 FPS on mid-range devices
    - Monitor memory usage during animation playback
    - Check for memory leaks
    - Verify smooth fade-out transition
    - Verify WebGL context is properly released on cleanup
    - _Requirements: 5.1, 5.2_

  - [ ]* 12.4 Test accessibility
    - Verify screen reader announcements
    - Test keyboard navigation for skip button
    - Verify prefers-reduced-motion support
    - _Requirements: 1.1_

- [ ]* 13. Create documentation
  - Document component usage in README or component comments
  - Document configuration options and their defaults
  - Add examples of different preloader configurations
  - Document how to modify or extend scenes for future updates
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
