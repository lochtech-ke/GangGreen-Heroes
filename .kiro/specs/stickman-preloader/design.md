# Design Document

## Overview

The Stickman Preloader will be implemented as a lightweight React component using CSS animations and SVG graphics to create a playful, hand-sketch style loading experience. The design prioritizes simplicity, performance, and brand alignment with a dark green background, white stickman animation, and pulsating "Chill Kiasii..." text in rotating colors.

## Architecture

### Component Structure

```
StickmanPreloader (Container Component)
├── Dark green background layer
├── SVG Stickman animation
├── Pulsating text with light box effect
└── Fade-out transition handler
```

### Integration Points

- **App Component**: The preloader will be conditionally rendered in `src/App.tsx` based on route detection
- **Route Exclusion**: Will not display on `/login`, `/register`, or `/reset-password` routes
- **Loading State**: Will integrate with existing app readiness detection
- **Cleanup**: Will remove itself from DOM after fade-out completes

## Components and Interfaces

### StickmanPreloader Component

**Location**: `src/components/common/StickmanPreloader.tsx`

**Props Interface**:
```typescript
interface StickmanPreloaderProps {
  minDisplayDuration?: number;      // Minimum time to show (ms), default: 1500
  fadeOutDuration?: number;          // Fade-out animation time (ms), default: 500
  backgroundColor?: string;          // Background color, default: '#0D4D2D'
  textColorCycleSpeed?: number;      // Time per color in cycle (ms), default: 800
  onComplete?: () => void;           // Callback when animation completes
}
```

**State Management**:
```typescript
interface PreloaderState {
  isVisible: boolean;
  isFadingOut: boolean;
  startTime: number;
}
```

### Animation Specification

**Stickman Animation**:
- **Implementation**: SVG with CSS keyframe animations
- **Style**: Hand-drawn sketch with slightly wobbly lines
- **Color**: White (#FFFFFF) with 2-3px stroke width
- **Actions**: Simple looping animation (e.g., waving, walking in place, or planting gesture)
- **Duration**: 2-3 second loop
- **Easing**: ease-in-out for organic movement

**Stickman Animation Options** (choose one):
1. **Waving**: Stickman waves hand back and forth
2. **Walking in Place**: Legs alternate in walking motion
3. **Planting Gesture**: Stickman bends down and plants something (ties to #GangGreen mission)

**Text Animation**:
- **Text**: "Chill Kiasii..."
- **Font**: Bold, modern sans-serif (e.g., 'Inter', 'Poppins', or system font)
- **Size**: Responsive (4rem on desktop, 2.5rem on mobile)
- **Position**: Centered below stickman
- **Color Cycle**: Red (#FF0000) → Green (#00FF00) → Black (#000000) → White (#FFFFFF)
- **Cycle Duration**: 800ms per color (3.2s total cycle)
- **Light Box Effect**: 
  - Text shadow with current color
  - Glow effect using multiple text-shadow layers
  - Smooth color transitions

**Background**:
- **Color**: Dark green (#0D4D2D)
- **Alternative shades**: #0A3D1F, #1A5C3A (can be configured)
- **Full viewport coverage**: 100vw x 100vh

## Data Models

### Configuration Object

```typescript
interface StickmanPreloaderConfig {
  minDisplayDuration: number;
  fadeOutDuration: number;
  backgroundColor: string;
  textColorCycleSpeed: number;
}

const DEFAULT_CONFIG: StickmanPreloaderConfig = {
  minDisplayDuration: 1500,
  fadeOutDuration: 500,
  backgroundColor: '#0D4D2D',
  textColorCycleSpeed: 800
};
```

### Color Cycle Definition

```typescript
const TEXT_COLORS = [
  { color: '#FF0000', name: 'red' },
  { color: '#00FF00', name: 'green' },
  { color: '#000000', name: 'black' },
  { color: '#FFFFFF', name: 'white' }
];
```

## Components and Interfaces

### SVG Stickman Structure

The stickman will be created using SVG paths with a hand-drawn aesthetic:

```typescript
interface StickmanParts {
  head: SVGCircleElement;      // Circle for head
  body: SVGLineElement;         // Line for torso
  leftArm: SVGPathElement;      // Path for left arm (animated)
  rightArm: SVGPathElement;     // Path for right arm (animated)
  leftLeg: SVGPathElement;      // Path for left leg (animated)
  rightLeg: SVGPathElement;     // Path for right leg (animated)
}
```

**SVG Styling**:
```css
.stickman-part {
  stroke: white;
  stroke-width: 3px;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
}
```

### CSS Animation Keyframes

**Stickman Animation** (example: waving):
```css
@keyframes stickman-wave {
  0%, 100% {
    transform: rotate(0deg);
    transform-origin: top center;
  }
  25% {
    transform: rotate(-20deg);
  }
  75% {
    transform: rotate(20deg);
  }
}
```

**Text Color Cycle**:
```css
@keyframes text-color-cycle {
  0% { color: #FF0000; text-shadow: 0 0 20px #FF0000, 0 0 40px #FF0000; }
  25% { color: #00FF00; text-shadow: 0 0 20px #00FF00, 0 0 40px #00FF00; }
  50% { color: #000000; text-shadow: 0 0 20px #666666, 0 0 40px #666666; }
  75% { color: #FFFFFF; text-shadow: 0 0 20px #FFFFFF, 0 0 40px #FFFFFF; }
  100% { color: #FF0000; text-shadow: 0 0 20px #FF0000, 0 0 40px #FF0000; }
}
```

**Fade Out**:
```css
@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

## Error Handling

### Browser Compatibility

**Scenario**: Browser doesn't support CSS animations or SVG
**Handling**:
- Display static text "Loading..." without animation
- Maintain dark green background
- Continue with application loading
- Fallback uses simple HTML/CSS without SVG

```typescript
const FallbackLoader = () => (
  <div className="preloader-fallback bg-[#0D4D2D] flex items-center justify-center">
    <p className="text-white text-2xl">Loading...</p>
  </div>
);
```

### Performance Degradation

**Scenario**: Device struggles with animations
**Handling**:
- Respect `prefers-reduced-motion` media query
- Disable animations and show static stickman
- Keep text visible without color cycling
- Ensure preloader doesn't block app initialization

### Timing Edge Cases

**Scenario**: App loads faster than minimum display duration
**Handling**:
- Track start time on mount
- Calculate remaining time before allowing fade-out
- Ensure smooth transition even with quick loads

**Scenario**: App takes very long to load
**Handling**:
- Continue animation loop indefinitely
- No timeout or forced dismissal
- Wait for app ready signal

## Testing Strategy

### Unit Tests

**File**: `src/components/common/StickmanPreloader.test.tsx`

Test cases:
1. Component renders with default props
2. Component accepts and applies custom configuration
3. Minimum display duration is enforced
4. Fade-out animation triggers correctly
5. onComplete callback is invoked
6. Component respects prefers-reduced-motion
7. Component unmounts cleanly
8. Background color can be customized

### Integration Tests

1. Preloader displays on app initialization
2. Preloader hides when app is ready
3. Preloader respects minimum display duration
4. Preloader does not show on authentication pages
5. Animation loops continuously until app ready

### Visual Tests

1. Stickman renders correctly on desktop (1920x1080)
2. Stickman scales properly on tablet (768x1024)
3. Stickman scales properly on mobile (375x667)
4. Text is readable during all color phases
5. Light box effect is visible and appealing
6. Dark green background displays correctly

### Accessibility Tests

1. Screen readers announce loading state
2. Reduced motion preference is respected
3. Color contrast meets WCAG standards (where applicable)
4. Keyboard navigation is not blocked

## Implementation Notes

### Stickman Animation Choice

**Recommended**: Planting gesture animation
- Aligns with #GangGreen mission
- Simple 3-4 frame animation
- Stickman bends down → places seedling → stands up → repeat

**Animation Sequence**:
1. Frame 1 (0-25%): Standing upright
2. Frame 2 (25-50%): Bending down
3. Frame 3 (50-75%): Planting gesture (hands to ground)
4. Frame 4 (75-100%): Standing back up

### React Implementation

```typescript
import { useEffect, useState } from 'react';

const StickmanPreloader = ({
  minDisplayDuration = 1500,
  fadeOutDuration = 500,
  backgroundColor = '#0D4D2D',
  textColorCycleSpeed = 800,
  onComplete
}: StickmanPreloaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [startTime] = useState(Date.now());

  const handleAppReady = () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDisplayDuration - elapsed);

    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, fadeOutDuration);
    }, remaining);
  };

  useEffect(() => {
    // Listen for app ready event or use context
    // handleAppReady();
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-${fadeOutDuration}`}
      style={{
        backgroundColor,
        opacity: isFadingOut ? 0 : 1
      }}
    >
      {/* SVG Stickman */}
      <svg
        className="w-48 h-48 md:w-64 md:h-64"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stickman paths with animations */}
      </svg>

      {/* Pulsating Text */}
      <h2
        className="mt-8 text-4xl md:text-6xl font-bold"
        style={{
          animation: `text-color-cycle ${textColorCycleSpeed * 4}ms infinite`
        }}
      >
        Chill Kiasii...
      </h2>
    </div>
  );
};

export default StickmanPreloader;
```

### Styling with Tailwind CSS

**Tailwind Configuration** (if needed):
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'gang-green-dark': '#0D4D2D',
      },
      animation: {
        'text-pulse': 'text-color-cycle 3.2s infinite',
        'stickman-wave': 'stickman-wave 2s ease-in-out infinite',
      }
    }
  }
}
```

### App.tsx Integration

```typescript
// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import StickmanPreloader from './components/common/StickmanPreloader';

function AppWithRouter() {
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(true);
  
  const excludedRoutes = ['/login', '/register', '/reset-password'];
  const shouldShowPreloader = !excludedRoutes.includes(location.pathname);
  
  return (
    <>
      {shouldShowPreloader && showPreloader && (
        <StickmanPreloader
          minDisplayDuration={1500}
          fadeOutDuration={500}
          onComplete={() => setShowPreloader(false)}
        />
      )}
      {/* Rest of app */}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>
  );
}
```

### Accessibility Considerations

```typescript
<div
  role="status"
  aria-live="polite"
  aria-label="Loading application"
  className="preloader"
>
  {/* Content */}
</div>
```

**Reduced Motion Support**:
```css
@media (prefers-reduced-motion: reduce) {
  .stickman-part {
    animation: none;
  }
  
  .pulsating-text {
    animation: none;
    color: white;
  }
}
```

## Dependencies

### No New Dependencies Required

The implementation uses only:
- React (existing)
- Tailwind CSS (existing)
- Native SVG and CSS animations

### Browser Support

- Modern browsers with CSS animation support
- SVG support (all modern browsers)
- Graceful degradation for older browsers

## File Structure

```
src/
├── components/
│   └── common/
│       ├── StickmanPreloader.tsx        # Main component
│       ├── StickmanPreloader.test.tsx   # Unit tests
│       └── StickmanPreloader.css        # Custom animations (if not using Tailwind)
├── hooks/
│   └── useAppReady.ts                   # Hook to track app loading state (existing)
└── App.tsx                              # Updated to conditionally render preloader
```

## Performance Considerations

### Optimization Strategies

1. **CSS-only animations**: No JavaScript animation loops
2. **Hardware acceleration**: Use `transform` and `opacity` for animations
3. **Minimal DOM**: Simple structure with few elements
4. **No external assets**: SVG is inline, no image loading
5. **Lazy cleanup**: Remove from DOM only after fade-out completes

### Performance Targets

- Initial render: < 50ms
- Animation frame rate: 60 FPS
- Memory footprint: < 1MB
- No layout thrashing or reflows

## Timeline Estimate

- SVG stickman creation: 2 hours
- CSS animations: 2 hours
- React component implementation: 2 hours
- Integration with App.tsx: 1 hour
- Testing and refinement: 2 hours
- **Total: 9 hours**

## Alternative Design Considerations

### Alternative 1: Multiple Stickman Actions
Instead of a single looping animation, cycle through different actions (waving, jumping, planting)
**Trade-off**: More complex but more engaging

### Alternative 2: Interactive Stickman
Allow user to click/tap stickman for different reactions
**Trade-off**: More engaging but adds complexity and may distract from loading

### Alternative 3: Progress Indicator
Add a progress bar or percentage below the text
**Trade-off**: More informative but requires actual loading progress tracking

**Recommendation**: Start with simple planting gesture loop for MVP, can enhance later based on user feedback
