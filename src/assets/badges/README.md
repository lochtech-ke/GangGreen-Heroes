# NFT Badge Assets

This directory contains all assets and configurations for the NFT badge generation system.

## Directory Structure

```
badges/
├── templates/          # SVG templates for badge generation
│   ├── base-template.svg       # Base badge template with placeholders
│   └── animated-template.svg   # Template with animation support (to be created)
├── icons/             # Achievement icon SVG files
│   ├── tree-planter.svg
│   ├── carbon-warrior.svg
│   ├── water-guardian.svg
│   ├── biodiversity-champion.svg
│   ├── community-leader.svg
│   ├── climate-hero.svg
│   ├── forest-protector.svg
│   └── green-ambassador.svg
├── patterns/          # Forest-specific background patterns
│   ├── kakamega-pattern.svg    # Tropical rainforest pattern
│   ├── karura-pattern.svg      # Urban forest pattern
│   └── mau-pattern.svg         # Highland forest pattern
├── styles/            # Style configurations and themes
│   ├── tierStyles.ts           # Tier color schemes and effects
│   ├── forestThemes.ts         # Forest theme configurations
│   └── achievementConfig.ts    # Achievement metadata
└── index.ts           # Central export point
```

## Badge Tiers

- **Bronze**: Entry-level achievements (#CD7F32)
- **Silver**: Intermediate achievements (#C0C0C0)
- **Gold**: Advanced achievements (#FFD700)
- **Platinum**: Expert achievements (#E5E4E2)
- **Diamond**: Elite achievements (#B9F2FF)

## Forest Themes

- **Kakamega**: Tropical rainforest with deep greens
- **Karura**: Urban forest with balanced earth tones
- **Mau**: Highland forest with cool teals and blues

## Achievement Types

1. **Tree Planter**: Planted trees to restore ecosystems
2. **Carbon Warrior**: Offset carbon through verified credits
3. **Water Guardian**: Protected water sources
4. **Biodiversity Champion**: Supported diverse species
5. **Community Leader**: Led conservation initiatives
6. **Climate Hero**: Took climate action
7. **Forest Protector**: Defended forests from threats
8. **Green Ambassador**: Spread environmental awareness

## Usage

Import badge configurations and utilities:

```typescript
import {
  BadgeConfig,
  getTierStyle,
  getForestTheme,
  getAchievementConfig,
  BADGE_SIZE,
  SOCIAL_MEDIA_SIZES,
} from '@/assets/badges';
```

## Template Placeholders

The base template uses the following placeholders:

- `{{gradientStart}}` - Tier gradient start color
- `{{primaryColor}}` - Tier primary color
- `{{gradientEnd}}` - Tier gradient end color
- `{{badgeName}}` - Badge display name
- `{{tierLevel}}` - Numeric tier level (1-5)
- `{{forestName}}` - Forest name
- `{{achievementType}}` - Achievement type identifier
- `{{achievementName}}` - Achievement display name
- `{{achievementCount}}` - Number of achievements
- `{{achievementUnit}}` - Unit text (e.g., "Trees Planted")
- `{{earnedDate}}` - ISO 8601 date string
- `{{uniqueBadgeId}}` - UUID v4 identifier
- `{{userId}}` - User identifier
- `{{tierName}}` - Tier display name

## File Size Targets

- SVG: < 50KB
- PNG (1200x1200): Optimized for social media
- Maintain quality at all scales (50px to 1200px)

## Design Principles

1. **Scalability**: Vector-based for crisp rendering at any size
2. **Glassmorphism**: Frosted glass effects with transparency
3. **Accessibility**: WCAG AA color contrast compliance
4. **Performance**: Fast generation (< 100ms per badge)
5. **Social-Ready**: Optimized for sharing on all platforms
