# Design Document

## Overview

The Pixi.js-powered preloader will be implemented as a React component that displays a three-scene animated sequence while the #GangGreen platform loads. The design leverages Pixi.js for hardware-accelerated WebGL rendering, providing smooth, performant animations that integrate seamlessly with the existing React application architecture.

## Architecture

### Component Structure

```
PixiPreloader (Container Component)
├── Pixi.js Application instance
├── Scene management (Scene1, Scene2, Scene3)
├── Animation timeline control
├── Loading state management
└── Fade-out transition handling
```

### Integration Points

- **App Entry Point**: The preloader will be mounted in `src/main.tsx` or `src/App.tsx` to display before the main application renders
- **Loading State**: Will integrate with React's Suspense or a custom loading context to track application readiness
- **Pixi.js Canvas**: Canvas element will be managed within the React component lifecycle

## Components and Interfaces

### PixiPreloader Component

**Location**: `src/components/common/PixiPreloader.tsx`

**Props Interface**:
```typescript
interface PixiPreloaderProps {
  minDisplayDuration?: number;      // Minimum time to show (ms), default: 3000
  fadeOutDuration?: number;          // Fade-out animation time (ms), default: 500
  autoHide?: boolean;                // Auto-hide when app loads, default: true
  onComplete?: () => void;           // Callback when animation completes
  allowSkip?: boolean;               // Allow user to skip after min duration, default: false
}
```

**State Management**:
```typescript
interface PreloaderState {
  isVisible: boolean;
  isAnimationComplete: boolean;
  isAppReady: boolean;
  canSkip: boolean;
}
```

### Animation Specification

**Implementation**: Programmatic Pixi.js animations

**Scene Breakdown**:

1. **Scene 1 (0-2s)**: African Child Planting
   - Duration: 2000ms
   - Animation: Simple sprite-based character with tweened movements
   - Keyframes: Child kneeling → digging motion → placing seedling → covering with soil
   - Colors: Warm browns (#8B4513), greens (#228B22), skin tones (#8D5524)
   - Elements: 
     - Child sprite (simple geometric shapes)
     - Seedling sprite
     - Soil particles (small circles)
     - Background gradient (earth tones)

2. **Scene 2 (2-4s)**: Seedling Growth Time-lapse
   - Duration: 2000ms
   - Animation: Scale and morph transformations
   - Keyframes: Seedling (scale 0.1) → small plant (scale 0.3) → sapling (scale 0.6) → full tree (scale 1.0)
   - Colors: Vibrant greens (#00FF00, #228B22), brown trunk (#654321), sky blue (#87CEEB)
   - Elements:
     - Tree trunk (rectangle with rounded corners)
     - Leaves (circles with alpha blending)
     - Roots (lines extending downward)
     - Sun/rain particles (animated sprites)

3. **Scene 3 (4-5.5s)**: Message Display with Geolocation-Based Flag
   - Duration: 1500ms
   - Text: "Chill Kiasi..." (Swahili/Sheng for "Relax a bit...")
   - Background: Parallax layers with user's country flag colors (detected via geolocation)
     - Default (Kenya): Black (#000000), Red (#BB0000), Green (#006600), White (#FFFFFF)
     - Colors dynamically loaded based on detected country
     - Fallback to Kenyan colors if geolocation fails or is denied
   - Blur effect: Pixi.js BlurFilter on background layers
   - Hashtags: "#GangGreen" and "#GreenBeltMovement" below main text
   - Font: Bold, modern sans-serif for main text; lighter weight for hashtags
   - Animation: Fade in text, parallax scroll background with smooth color transitions

**Animation Properties**:
- Total duration: 5500ms
- Frame rate: 60 FPS (Pixi.js ticker)
- Dimensions: Responsive (scales to viewport)
- Aspect ratio: 16:9
- Loop: false (plays once)

## Data Models

### Pixi.js Scene Structure

Each scene will be implemented as a Pixi.js Container with animated sprites:

```typescript
interface SceneConfig {
  duration: number;
  startTime: number;
  endTime: number;
  setup: (container: Container, flagColors?: FlagColors) => void;
  animate: (container: Container, progress: number) => void;
  cleanup: (container: Container) => void;
}

interface AnimationTimeline {
  scenes: SceneConfig[];
  currentScene: number;
  startTime: number;
  totalDuration: number;
}

interface FlagColors {
  primary: number;
  secondary: number;
  tertiary: number;
  accent: number;
}

interface GeolocationData {
  country: string;
  countryCode: string;
  flagColors: FlagColors;
}
```

### Configuration Object

```typescript
interface PreloaderConfig {
  minDisplayDuration: number;
  fadeOutDuration: number;
  autoHide: boolean;
  allowSkip: boolean;
  backgroundColor: number;
  antialias: boolean;
}

const DEFAULT_CONFIG: PreloaderConfig = {
  minDisplayDuration: 3000,
  fadeOutDuration: 500,
  autoHide: true,
  allowSkip: false,
  backgroundColor: 0xFFFFFF,
  antialias: true
};
```

## Error Handling

### WebGL Initialization Failures

**Scenario**: WebGL is not available or fails to initialize
**Handling**:
- Display fallback loading spinner (CSS-based)
- Log error to console for debugging
- Continue with application loading
- Fallback component: Simple spinner with #GangGreen branding

```typescript
const FallbackLoader = () => (
  <div className="preloader-fallback">
    <div className="spinner" />
    <p>#GangGreen</p>
  </div>
);
```

### Performance Issues

**Scenario**: Device cannot maintain 60 FPS
**Handling**:
- Automatically reduce animation complexity
- Skip non-essential visual effects
- Continue tracking app readiness independently

### Browser Compatibility

**Scenario**: Browser doesn't support WebGL
**Handling**:
- Detect WebGL support using feature detection
- Gracefully degrade to Canvas2D or fallback loader
- Ensure preloader doesn't block app initialization

## Testing Strategy

### Unit Tests

**File**: `src/components/common/LottiePreloader.test.tsx`

Test cases:
1. Component renders with default props
2. Component accepts and applies custom configuration
3. Minimum display duration is enforced
4. Fade-out animation triggers correctly
5. onComplete callback is invoked
6. Fallback loader displays on WebGL initialization failure
7. Component unmounts cleanly without memory leaks
8. Pixi.js application is properly destroyed on unmount

### Integration Tests

1. Preloader displays on app initialization
2. Preloader hides when app is ready
3. Preloader respects minimum display duration even if app loads quickly
4. Skip functionality works after minimum duration (if enabled)
5. Animation plays through all three scenes

### Visual Regression Tests

1. Animation renders correctly on desktop (1920x1080)
2. Animation scales properly on tablet (768x1024)
3. Animation scales properly on mobile (375x667)
4. Kenyan flag colors are accurate
5. Text is readable and properly positioned

### Performance Tests

1. Pixi.js application initializes within 500ms
2. Animation renders at 60 FPS on mid-range devices
3. No memory leaks during animation playback
4. Smooth fade-out transition without jank
5. WebGL context is properly released on cleanup

## Implementation Notes

### Geolocation and Flag Colors

The preloader will detect the user's country and display their flag colors:

**Geolocation Strategy**:
1. Use browser Geolocation API to get coordinates
2. Call a geolocation service (e.g., ipapi.co or ip-api.com) to convert coordinates to country
3. Map country code to flag colors using a predefined color palette
4. Cache the result in localStorage to avoid repeated API calls
5. Fallback to Kenyan colors if detection fails

**Flag Color Mapping** (sample countries):
```typescript
const FLAG_COLORS: Record<string, FlagColors> = {
  KE: { primary: 0x000000, secondary: 0xBB0000, tertiary: 0x006600, accent: 0xFFFFFF }, // Kenya
  NG: { primary: 0x008751, secondary: 0xFFFFFF, tertiary: 0x008751, accent: 0xFFFFFF }, // Nigeria
  ZA: { primary: 0x007A4D, secondary: 0xFFB612, tertiary: 0xDE3831, accent: 0x002395 }, // South Africa
  GH: { primary: 0xCE1126, secondary: 0xFCD116, tertiary: 0x006B3F, accent: 0x000000 }, // Ghana
  ET: { primary: 0x078930, secondary: 0xFCDD09, tertiary: 0xDA121A, accent: 0x0F47AF }, // Ethiopia
  // Add more countries as needed
};
```

### Pixi.js Animation Creation

The animations will be created programmatically using Pixi.js primitives and sprites:
- **Graphics API** for shapes (circles, rectangles, lines)
- **Sprites** for character and tree elements
- **Text** for message display
- **Filters** for blur, glow, and shadow effects
- **Particle systems** for enhanced visual effects

**Visual Enhancement Techniques**:
- Smooth easing functions (easeInOutCubic, easeOutElastic)
- Particle effects for soil, leaves, and ambient elements
- Gradient fills for depth and lighting
- Drop shadows on text and key elements
- Glow effects on interactive elements
- Color transitions between scenes

### React Integration

```typescript
import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';

const PixiPreloader = ({ minDisplayDuration = 3000, ... }) => {
  const [isVisible, setIsVisible] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  
  useEffect(() => {
    // Initialize Pixi.js application
    const app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xFFFFFF,
      antialias: true,
    });
    
    canvasRef.current?.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;
    
    // Setup scenes and animation timeline
    // ...
    
    return () => {
      app.destroy(true, { children: true, texture: true });
    };
  }, []);
  
  return (
    <div className={`preloader ${isVisible ? 'visible' : 'hidden'}`}>
      <div ref={canvasRef} />
    </div>
  );
};
```

### Styling Approach

Use Tailwind CSS with custom animations:
- Full-screen overlay with z-index management
- Fade-out transition using Tailwind's transition utilities
- Responsive sizing with aspect-ratio utilities
- Backdrop blur for loading state

### Accessibility Considerations

- Add `role="status"` and `aria-live="polite"` for screen readers
- Include `aria-label="Loading application"` text
- Ensure skip button (if enabled) is keyboard accessible
- Respect `prefers-reduced-motion` media query to disable animation

## Dependencies

### New Dependencies

```json
{
  "pixi.js": "^8.0.0",
  "@pixi/react": "^7.1.0"
}
```

**Note**: Geolocation detection will use browser APIs and a free geolocation service (no additional npm packages required)

### Existing Dependencies (No Changes)

- React 18+
- TypeScript
- Tailwind CSS

## File Structure

```
src/
├── components/
│   └── common/
│       ├── PixiPreloader.tsx            # Main component
│       ├── PixiPreloader.test.tsx       # Unit tests
│       ├── FallbackLoader.tsx           # Fallback component
│       └── preloader/
│           ├── Scene1.ts                # Scene 1: Child planting
│           ├── Scene2.ts                # Scene 2: Tree growth
│           ├── Scene3.ts                # Scene 3: Message display
│           ├── AnimationTimeline.ts     # Timeline controller
│           ├── flagColors.ts            # Flag color mappings
│           └── easingFunctions.ts       # Animation easing utilities
├── hooks/
│   └── useAppReady.ts                   # Hook to track app loading state
├── services/
│   └── geolocation.service.ts           # Geolocation detection service
└── types/
    └── preloader.types.ts               # TypeScript interfaces
```

## Timeline Estimate

- Pixi.js scene implementation: 6-8 hours (3 scenes + timeline)
- React component implementation: 3-4 hours
- Integration and testing: 2-3 hours
- Total: 11-15 hours

## Open Questions

1. Should we add a "Skip" button for users who've seen the animation before?
2. Should the animation play on every page load or only on initial app load?
3. Do we need different animations for different user types (organizations vs individuals)?
4. Should we add particle effects for enhanced visual appeal?
