# Forest Theme Patterns

This directory contains SVG background patterns for the three pilot forests in the #GangGreen platform.

## Pattern Specifications

- **Format**: SVG (Scalable Vector Graphics)
- **ViewBox**: 0 0 400 400
- **Style**: Layered, semi-transparent elements
- **Opacity**: 0.15-0.3 for subtle background effect
- **Purpose**: Provide forest-specific visual identity to badges

## Available Patterns

### 1. Kakamega Forest (`kakamega-pattern.svg`)
**Theme**: Tropical Rainforest

**Color Palette**:
- Deep emerald: #1B4D3E
- Forest green: #2D5F4F
- Moss green: #4A7C59

**Visual Elements**:
- Dense leaf canopy with tropical leaves
- Vine border patterns
- Butterfly decorative elements
- Rainfall effect (subtle lines)
- Layered foliage for depth

**Characteristics**:
- Rich, dense vegetation
- Humid tropical atmosphere
- Biodiversity indicators (butterflies)
- Vertical layering (canopy to ground)

### 2. Karura Forest (`karura-pattern.svg`)
**Theme**: Urban Forest

**Color Palette**:
- Balanced green: #4A7C59
- Earth brown: #8B7355
- Sky blue: #87CEEB

**Visual Elements**:
- Mixed tree silhouettes (deciduous and conifer)
- City skyline in background
- Bird decorative elements
- Pathway lines
- Cloud formations
- Geometric nature border pattern

**Characteristics**:
- Balance between urban and natural
- Accessible pathways
- Mixed tree species
- Sky visibility
- Human-nature harmony

### 3. Mau Forest (`mau-pattern.svg`)
**Theme**: Highland Forest

**Color Palette**:
- Cool teal: #3A5F5F
- Highland green: #5B8A8A
- Mist gray: #B0C4C4

**Visual Elements**:
- Mountain ridges with forest coverage
- Water streams and cascades
- Cloud and mist layers
- Highland conifer vegetation
- Snow caps on peaks
- Wave and mountain border pattern

**Characteristics**:
- Elevated terrain
- Water tower ecosystem
- Cool, misty atmosphere
- Layered mountain ranges
- Highland vegetation

## Usage in Badges

Patterns are applied as semi-transparent overlays on badge backgrounds:

```xml
<!-- Example usage in badge -->
<g id="forest-theme" opacity="0.2">
  <image href="/src/assets/badges/patterns/kakamega-pattern.svg" 
         width="400" height="400"/>
</g>
```

## Design Principles

1. **Subtlety**: Patterns enhance without overwhelming the badge design
2. **Recognition**: Each forest has distinct, recognizable visual identity
3. **Layering**: Multiple opacity levels create depth
4. **Scalability**: Patterns work at any badge size
5. **Cohesion**: All patterns share similar complexity and style

## Pattern Composition

Each pattern includes:
- **Base gradient**: Establishes color foundation
- **Repeating pattern**: Creates texture and consistency
- **Decorative elements**: Adds forest-specific character
- **Border patterns**: Provides unique edge treatment
- **Atmospheric effects**: Adds environmental context

## Color Harmony with Tiers

Patterns are designed to work with all tier colors:

**Kakamega (Deep Greens)**:
- Complements: Gold, Platinum, Diamond
- Contrasts: Bronze, Silver

**Karura (Balanced Tones)**:
- Complements: All tiers (most versatile)
- Works well with earth-toned Bronze

**Mau (Cool Teals)**:
- Complements: Silver, Platinum, Diamond
- Creates interesting contrast with Gold

## Accessibility

- High contrast maintained with white icon overlays
- Patterns don't interfere with text readability
- Opacity levels ensure badge content remains primary focus
- Color combinations tested for color blindness compatibility

## File Size

- Kakamega: ~3-4 KB
- Karura: ~3-4 KB
- Mau: ~3-4 KB
- Total: ~10-12 KB

## Customization

To modify a pattern:
1. Edit the SVG file directly
2. Maintain 400x400 viewBox
3. Keep opacity levels between 0.15-0.3
4. Test with all tier colors
5. Ensure decorative elements don't overpower badge content

## Testing

Patterns should be tested:
- With all 5 tier backgrounds
- At multiple badge sizes
- With all 8 achievement icons
- On light and dark displays
- With glassmorphism effects applied
