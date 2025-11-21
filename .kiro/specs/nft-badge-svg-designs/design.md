# Design Document

## Overview

The NFT Badge SVG Design System creates a scalable, visually stunning collection of conservation achievement badges for the #GangGreen platform. The system uses pure SVG with embedded CSS for styling, SVG filters for glassmorphism effects, and a template-based architecture for programmatic generation. Each badge combines tier-specific styling, forest-themed elements, and achievement icons into a cohesive design that celebrates environmental conservation.

## Architecture

### Component Structure

```
BadgeGenerator
├── BadgeTemplate (SVG structure)
├── TierStyler (colors, gradients, effects)
├── ForestThemer (forest-specific elements)
├── IconRenderer (achievement icons)
├── MetadataEmbedder (badge information)
└── ExportManager (PNG/SVG output)
```

### Design System Hierarchy

1. **Base Layer**: SVG canvas (400x400 viewBox) with background gradient
2. **Glassmorphism Layer**: Frosted glass effect using SVG filters
3. **Border Layer**: Tier-specific metallic border with shine effects
4. **Content Layer**: Forest theme elements and achievement icons
5. **Text Layer**: Achievement count, date, and badge name
6. **Metadata Layer**: Embedded structured data
7. **Animation Layer** (optional): CSS animations for premium tiers

## Components and Interfaces

### 1. Badge Template System

**SVG Structure**:
```xml
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients, filters, patterns -->
  </defs>
  <metadata>
    <!-- Badge metadata -->
  </metadata>
  <g id="background"><!-- Tier gradient --></g>
  <g id="glass-effect"><!-- Glassmorphism --></g>
  <g id="border"><!-- Metallic border --></g>
  <g id="forest-theme"><!-- Forest elements --></g>
  <g id="achievement-icon"><!-- Central icon --></g>
  <g id="text-content"><!-- Achievement info --></g>
</svg>
```


### 2. Tier Style System

**Tier Definitions**:

| Tier | Primary Color | Gradient Start | Gradient End | Border Style |
|------|--------------|----------------|--------------|--------------|
| Bronze | #CD7F32 | #CD7F32 | #8B4513 | Brushed metal |
| Silver | #C0C0C0 | #E8E8E8 | #A0A0A0 | Polished shine |
| Gold | #FFD700 | #FFD700 | #FFA500 | Radiant glow |
| Platinum | #E5E4E2 | #FFFFFF | #C0C0C0 | Mirror finish |
| Diamond | #B9F2FF | #E0FFFF | #87CEEB | Prismatic sparkle |

**Gradient Implementation**:
```xml
<linearGradient id="tierGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stop-color="{gradientStart}" />
  <stop offset="50%" stop-color="{primaryColor}" />
  <stop offset="100%" stop-color="{gradientEnd}" />
</linearGradient>
```

### 3. Glassmorphism Effects

**SVG Filter Definition**:
```xml
<filter id="glassEffect">
  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
  <feColorMatrix in="blur" type="matrix" 
    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.2 0" result="glass"/>
  <feBlend in="SourceGraphic" in2="glass" mode="normal"/>
</filter>
```

**Glass Overlay**:
- Semi-transparent white overlay (opacity: 0.15)
- Blur radius: 10px
- Border: 1px solid rgba(255, 255, 255, 0.3)
- Backdrop blur effect for modern browsers


### 4. Forest Theme Elements

**Kakamega Forest (Tropical Rainforest)**:
- Background pattern: Dense leaf canopy silhouette
- Color palette: Deep emerald (#1B4D3E), Forest green (#2D5F4F), Moss (#4A7C59)
- Decorative elements: Tropical leaves, butterflies, rainfall
- Border accent: Vine pattern

**Karura Forest (Urban Forest)**:
- Background pattern: Mixed tree silhouettes with city skyline
- Color palette: Balanced green (#4A7C59), Earth brown (#8B7355), Sky blue (#87CEEB)
- Decorative elements: Urban trees, birds, pathways
- Border accent: Geometric nature pattern

**Mau Forest (Highland Forest)**:
- Background pattern: Mountain ridges with forest coverage
- Color palette: Cool teal (#3A5F5F), Highland green (#5B8A8A), Mist gray (#B0C4C4)
- Decorative elements: Mountains, water streams, clouds
- Border accent: Wave and mountain pattern

### 5. Achievement Icon Set

**Icon Specifications**:
- Size: 120x120px (centered in badge)
- Style: Line art with 4px stroke width
- Color: White with subtle shadow for contrast
- Background: Circular backdrop with tier color at 30% opacity

**Icon Designs**:

1. **Tree Planter**: Stylized tree with roots and branches
2. **Carbon Warrior**: Shield with CO2 molecule crossed out
3. **Water Guardian**: Water drop with protective hands
4. **Biodiversity Champion**: Multiple species silhouettes in harmony
5. **Community Leader**: Group of people forming a tree shape
6. **Climate Hero**: Sun and leaf with upward arrow
7. **Forest Protector**: Forest silhouette within a shield
8. **Green Ambassador**: Megaphone with leaf symbol


## Data Models

### Badge Configuration Interface

```typescript
interface BadgeConfig {
  id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  forest: 'kakamega' | 'karura' | 'mau';
  achievement: AchievementType;
  metadata: BadgeMetadata;
  animated?: boolean;
}

interface BadgeMetadata {
  badgeName: string;
  tierLevel: number;
  forestName: string;
  achievementType: string;
  achievementCount: number;
  earnedDate: string;
  uniqueBadgeId: string;
  userId: string;
}

type AchievementType = 
  | 'tree_planter'
  | 'carbon_warrior'
  | 'water_guardian'
  | 'biodiversity_champion'
  | 'community_leader'
  | 'climate_hero'
  | 'forest_protector'
  | 'green_ambassador';

interface TierStyle {
  primaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  borderStyle: string;
  glowIntensity: number;
}

interface ForestTheme {
  name: string;
  colors: string[];
  pattern: string;
  decorativeElements: string[];
  borderAccent: string;
}
```


### SVG Template Structure

```typescript
interface SVGTemplate {
  viewBox: string;
  width: number;
  height: number;
  defs: SVGDefs;
  layers: SVGLayer[];
}

interface SVGDefs {
  gradients: Gradient[];
  filters: Filter[];
  patterns: Pattern[];
  clipPaths: ClipPath[];
}

interface SVGLayer {
  id: string;
  type: 'background' | 'glass' | 'border' | 'theme' | 'icon' | 'text';
  elements: SVGElement[];
  transform?: string;
  opacity?: number;
}
```

## Error Handling

### SVG Generation Errors

1. **Invalid Configuration**: Validate all badge parameters before generation
   - Check tier exists in TierStyle definitions
   - Verify forest theme is available
   - Ensure achievement type is valid

2. **Rendering Failures**: Graceful fallbacks for unsupported features
   - Provide static version if animations fail
   - Use solid colors if gradients don't render
   - Fallback to basic shapes if complex patterns fail

3. **Export Errors**: Handle conversion issues
   - Retry PNG export up to 3 times
   - Validate file size constraints
   - Ensure proper encoding for social media

4. **Metadata Validation**: Ensure data integrity
   - Validate date formats (ISO 8601)
   - Check unique ID format (UUID v4)
   - Verify achievement count is positive integer


## Testing Strategy

### Visual Regression Testing

1. **Snapshot Tests**: Capture SVG output for each tier/forest/achievement combination
   - Generate reference images for all 120 badge variations (5 tiers × 3 forests × 8 achievements)
   - Compare generated badges against reference snapshots
   - Flag any visual differences exceeding 2% pixel variance

2. **Cross-Browser Testing**: Verify rendering consistency
   - Test in Chrome, Firefox, Safari, Edge
   - Validate glassmorphism effects and fallbacks
   - Check animation performance on different devices

3. **Responsive Testing**: Ensure badges scale properly
   - Test at sizes: 50x50, 100x100, 200x200, 400x400, 1200x1200
   - Verify text remains readable at minimum size
   - Check icon clarity at all scales

### Functional Testing

1. **Badge Generation**: Test programmatic creation
   - Generate badges with all parameter combinations
   - Verify metadata embedding
   - Validate SVG syntax and structure

2. **Export Functionality**: Test output formats
   - Export to PNG at various resolutions
   - Verify file size constraints (< 50KB)
   - Test social media compatibility

3. **Performance Testing**: Measure generation speed
   - Target: Generate badge in < 100ms
   - Batch generation of 100 badges in < 5 seconds
   - Memory usage stays under 50MB during generation

### Accessibility Testing

1. **Color Contrast**: Ensure WCAG AA compliance
   - Text on tier backgrounds meets 4.5:1 ratio
   - Icon visibility on all tier colors
   - Test with color blindness simulators

2. **Alternative Text**: Provide descriptive metadata
   - SVG title and desc elements
   - Semantic structure for screen readers
   - Meaningful badge descriptions


## Implementation Details

### Badge Generation Service

**File**: `src/services/badgeSvg.service.ts`

```typescript
class BadgeSvgService {
  generateBadge(config: BadgeConfig): string {
    // 1. Load tier style
    // 2. Load forest theme
    // 3. Load achievement icon
    // 4. Compose SVG layers
    // 5. Embed metadata
    // 6. Apply animations if needed
    // 7. Return SVG string
  }

  exportToPng(svgString: string, size: number): Promise<Blob> {
    // Convert SVG to PNG using canvas
  }

  validateBadge(svgString: string): boolean {
    // Validate SVG syntax and structure
  }
}
```

### Template Engine

**File**: `src/utils/badgeTemplate.ts`

- Use template literals for SVG structure
- Parameter substitution for dynamic values
- Modular composition of SVG elements
- Caching of frequently used patterns

### Asset Organization

```
src/assets/badges/
├── templates/
│   ├── base-template.svg
│   └── animated-template.svg
├── icons/
│   ├── tree-planter.svg
│   ├── carbon-warrior.svg
│   └── [other achievement icons]
├── patterns/
│   ├── kakamega-pattern.svg
│   ├── karura-pattern.svg
│   └── mau-pattern.svg
└── styles/
    ├── tier-styles.ts
    └── forest-themes.ts
```

### Integration Points

1. **NFT Badge Purchase Flow**: Generate badge after successful purchase
2. **User Profile**: Display earned badges in gallery
3. **Social Sharing**: Export badges for social media
4. **Admin Dashboard**: Preview and manage badge designs
5. **Gamification System**: Trigger badge generation on achievement unlock


## Animation System (Premium Tiers)

### Diamond Tier Sparkle Effect

```css
@keyframes sparkle {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.diamond-sparkle {
  animation: sparkle 2s ease-in-out infinite;
  animation-delay: var(--sparkle-delay);
}
```

### Badge Reveal Animation

```css
@keyframes badgeReveal {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.badge-reveal {
  animation: badgeReveal 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Hover Effects

```css
.badge-interactive:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
  transition: all 0.3s ease;
}

.badge-interactive:hover .icon {
  transform: rotate(5deg);
  transition: transform 0.3s ease;
}
```

## Performance Optimization

1. **SVG Optimization**: Minimize file size
   - Remove unnecessary whitespace
   - Combine similar paths
   - Use shorthand attributes
   - Compress gradients and filters

2. **Caching Strategy**: Reduce generation overhead
   - Cache tier styles and forest themes
   - Reuse common SVG elements
   - Store generated badges in memory (LRU cache, max 100 items)

3. **Lazy Loading**: Optimize initial page load
   - Load badge assets on demand
   - Progressive enhancement for animations
   - Defer non-critical badge rendering

4. **CDN Delivery**: Fast asset loading
   - Host static badge assets on CDN
   - Use appropriate cache headers
   - Implement image optimization pipeline


## Design Mockups

### Badge Layout Structure

```
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║   [Forest Pattern Background] ║  │
│  ║                               ║  │
│  ║         ┌─────────┐           ║  │
│  ║         │         │           ║  │
│  ║         │  ICON   │           ║  │
│  ║         │         │           ║  │
│  ║         └─────────┘           ║  │
│  ║                               ║  │
│  ║      Achievement Name         ║  │
│  ║      [50 Trees Planted]       ║  │
│  ║                               ║  │
│  ║   #GangGreen  |  Tier Badge   ║  │
│  ╚═══════════════════════════════╝  │
│         [Metallic Border]           │
└─────────────────────────────────────┘
```

### Color Harmony Examples

**Bronze + Kakamega**:
- Background: Gradient from #CD7F32 to #8B4513
- Forest overlay: #1B4D3E at 20% opacity
- Icon: White (#FFFFFF)
- Text: White with subtle shadow

**Gold + Mau**:
- Background: Gradient from #FFD700 to #FFA500
- Forest overlay: #3A5F5F at 15% opacity
- Icon: White (#FFFFFF) with golden glow
- Text: Dark teal (#2C4F4F) for contrast

**Diamond + Karura**:
- Background: Gradient from #E0FFFF to #87CEEB
- Forest overlay: #4A7C59 at 25% opacity
- Icon: White (#FFFFFF) with prismatic effect
- Text: Deep green (#1B4D3E)

## Social Media Specifications

### Platform Requirements

**Twitter/X**:
- Optimal size: 1200x675px (landscape) or 1200x1200px (square)
- Format: PNG with transparency
- File size: < 5MB
- Badge positioned center with #GangGreen branding

**Facebook**:
- Optimal size: 1200x630px (landscape) or 1200x1200px (square)
- Format: PNG or JPG
- File size: < 8MB
- Include share text overlay option

**Instagram**:
- Optimal size: 1080x1080px (square) or 1080x1350px (portrait)
- Format: PNG or JPG
- File size: < 30MB
- Vibrant colors for feed visibility

**LinkedIn**:
- Optimal size: 1200x627px (landscape)
- Format: PNG or JPG
- File size: < 5MB
- Professional presentation with achievement details

