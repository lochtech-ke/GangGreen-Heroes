# Implementation Plan

- [ ] 1. Implement hover intent system in NavDropdown component
  - Add timer refs for enter and leave delays using useRef hooks
  - Implement handleMouseEnter with 150ms delay and timer cancellation logic
  - Implement handleMouseLeave with 300ms delay and timer cancellation logic
  - Add cleanup effect to clear timers on component unmount
  - _Requirements: 1.1, 1.3, 1.4, 3.2_

- [ ] 2. Update mouse event handlers and container structure
  - Wrap trigger button and dropdown menu in unified container div
  - Apply onMouseEnter and onMouseLeave handlers to container level
  - Update handleClick to only trigger on mobile (preserve existing mobile behavior)
  - Ensure mobile detection logic properly disables hover behavior
  - _Requirements: 1.2, 2.1, 3.3_

- [ ] 3. Test and verify hover behavior across viewports
  - Test desktop hover flow: trigger hover, cursor movement to dropdown, delayed closing
  - Test mobile touch flow: tap toggle, backdrop close, menu item navigation
  - Test edge cases: rapid hovers, window resize, route changes
  - Verify no flickering or visual glitches during cursor movement
  - _Requirements: 1.5, 2.2, 2.3, 2.4, 3.1, 3.4_
