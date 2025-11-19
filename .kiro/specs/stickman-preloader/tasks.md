# Implementation Plan

- [x] 1. Create StickmanPreloader component with basic structure



  - Create `src/components/common/StickmanPreloader.tsx` with TypeScript interfaces
  - Implement props interface (minDisplayDuration, fadeOutDuration, backgroundColor, textColorCycleSpeed, onComplete)
  - Set up component state management (isVisible, isFadingOut, startTime)
  - Add dark green background container with full viewport coverage
  - _Requirements: 1.1, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3_

- [x] 2. Implement SVG stickman with hand-sketch styling


  - Create SVG element with responsive sizing (w-48 h-48 md:w-64 md:h-64)
  - Draw stickman parts using SVG paths (head circle, body line, arms, legs)
  - Apply white stroke styling with 3px width and rounded caps
  - Add subtle drop shadow for depth effect
  - Ensure stickman is centered in viewport
  - _Requirements: 1.2, 1.3, 3.4_

- [x] 3. Create planting gesture animation for stickman


  - Define CSS keyframes for 4-frame planting animation sequence
  - Frame 1: Standing upright (0-25%)
  - Frame 2: Bending down (25-50%)
  - Frame 3: Planting gesture with hands to ground (50-75%)
  - Frame 4: Standing back up (75-100%)
  - Apply animation to stickman SVG with 2-3 second loop duration
  - Use ease-in-out easing for organic movement
  - _Requirements: 1.4, 1.5_

- [x] 4. Implement pulsating text with light box effect



  - Add "Chill Kiasii..." text element below stickman
  - Apply responsive font sizing (text-4xl md:text-6xl)
  - Create CSS keyframes for color cycle animation (red → green → black → white)
  - Implement text-shadow glow effect for each color phase
  - Set animation duration to 800ms per color (3.2s total cycle)
  - Ensure text remains readable against dark green background
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Add timing control and fade-out logic

  - Track component mount time with startTime state
  - Implement handleAppReady function to calculate remaining display time
  - Enforce minimum display duration before allowing fade-out
  - Trigger fade-out animation when app is ready and minimum time elapsed
  - Apply opacity transition for smooth fade-out effect
  - Remove component from DOM after fade-out completes
  - Invoke onComplete callback after removal
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.4_

- [x] 6. Integrate with App.tsx for conditional rendering


  - Update `src/App.tsx` to import StickmanPreloader
  - Restructure App to use BrowserRouter at root level
  - Create AppWithRouter inner component that uses useLocation hook
  - Define excludedRoutes array with ['/login', '/register', '/reset-password']
  - Implement route checking logic to determine shouldShowPreloader
  - Conditionally render StickmanPreloader based on route and showPreloader state
  - Pass configuration props (minDisplayDuration: 1500, fadeOutDuration: 500)
  - Handle onComplete callback to update showPreloader state
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 7. Add accessibility and reduced motion support


  - Add role="status" and aria-live="polite" to preloader container
  - Add aria-label="Loading application" for screen readers
  - Create CSS media query for prefers-reduced-motion
  - Disable stickman animation when reduced motion is preferred
  - Set text to static white color when reduced motion is preferred
  - Ensure keyboard navigation is not blocked by preloader
  - _Requirements: 4.5_

- [x] 8. Implement fallback for unsupported browsers



  - Create FallbackLoader component with simple "Loading..." text
  - Add feature detection for CSS animation support
  - Conditionally render FallbackLoader when animations not supported
  - Maintain dark green background in fallback
  - Ensure fallback doesn't block app initialization

- [x]* 9. Create custom CSS animations file




  - Create `src/components/common/StickmanPreloader.css` if not using Tailwind
  - Define @keyframes for stickman-wave animation
  - Define @keyframes for text-color-cycle animation
  - Define @keyframes for fade-out animation
  - Add .stickman-part class with stroke styling
  - Add .pulsating-text class with animation
  - Include @media query for prefers-reduced-motion
  - _Requirements: 1.4, 2.2, 2.3, 5.1_

- [ ]* 10. Write unit tests for StickmanPreloader
  - Create `src/components/common/StickmanPreloader.test.tsx`
  - Test component renders with default props
  - Test component accepts and applies custom configuration
  - Test minimum display duration is enforced
  - Test fade-out animation triggers correctly
  - Test onComplete callback is invoked
  - Test component respects prefers-reduced-motion
  - Test component unmounts cleanly
  - Test background color can be customized
  - _Requirements: All_

- [ ]* 11. Update Tailwind configuration for custom animations
  - Open `tailwind.config.js`
  - Add 'gang-green-dark': '#0D4D2D' to theme.extend.colors
  - Add 'text-pulse' animation to theme.extend.animation
  - Add 'stickman-wave' animation to theme.extend.animation
  - Define corresponding keyframes in theme.extend.keyframes
  - _Requirements: 3.1, 6.3_

- [ ]* 12. Test responsive behavior across devices
  - Test stickman renders correctly on desktop (1920x1080)
  - Test stickman scales properly on tablet (768x1024)
  - Test stickman scales properly on mobile (375x667)
  - Verify text is readable during all color phases on all devices
  - Verify light box effect is visible on all devices
  - Test fade-out transition smoothness on all devices
  - _Requirements: 1.4, 2.5, 5.1_
