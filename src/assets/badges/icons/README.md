# Achievement Icons

This directory contains SVG icons for all 8 achievement types in the NFT badge system.

## Icon Specifications

- **Format**: SVG (Scalable Vector Graphics)
- **ViewBox**: 0 0 120 120
- **Style**: Line art with 4px stroke width
- **Color**: White (#FFFFFF) with subtle shadows
- **Size**: Designed for 120x120px, scalable to any size
- **Minimum Display Size**: 50x50px (per requirements)

## Available Icons (Track 3: Community Engagement Focus)

### 1. Community Builder (`community-builder.svg`)
- **Symbol**: Connected people forming a network
- **Represents**: Community building and engagement achievements
- **Category**: Community
- **Icons**: People, hands joining, hearts, connection nodes

### 2. Social Mobilizer (`social-mobilizer.svg`)
- **Symbol**: Group of people with upward momentum arrow
- **Represents**: Social mobilization and referral achievements
- **Category**: Community
- **Icons**: People in motion, megaphone, sharing symbols

### 3. Collaboration Champion (`collaboration-champion.svg`)
- **Symbol**: Hands joining together in unity
- **Represents**: Collaborative initiative achievements
- **Category**: Community
- **Icons**: Hands, teamwork symbols, unity circles

### 4. Knowledge Sharer (`knowledge-sharer.svg`)
- **Symbol**: Book or lightbulb with sharing arrows
- **Represents**: Educational content and knowledge sharing
- **Category**: Community
- **Icons**: Book, lightbulb, speech bubbles, teaching symbols

### 5. Community Leader (`community-leader.svg`)
- **Symbol**: Person with community members around them
- **Represents**: Community leadership achievements
- **Category**: Community
- **Icons**: Leader figure, people group, guiding star

### 6. Climate Advocate (`climate-advocate.svg`)
- **Symbol**: Megaphone with climate action symbols
- **Represents**: Climate advocacy and awareness achievements
- **Category**: Impact
- **Icons**: Megaphone, voice symbols, action arrows

### 7. Initiative Champion (`initiative-champion.svg`)
- **Symbol**: Trophy or star with initiative symbols
- **Represents**: Initiative participation and completion
- **Category**: Impact
- **Icons**: Trophy, checkmark, goal symbols

### 8. Green Ambassador (`green-ambassador.svg`)
- **Symbol**: Person with environmental message symbols
- **Represents**: Environmental advocacy and outreach
- **Category**: Community
- **Icons**: Ambassador figure, message symbols, outreach icons

## Design Principles

1. **Simplicity**: Clean, recognizable symbols that work at small sizes
2. **Consistency**: All icons use 4px stroke width and white color
3. **Scalability**: Vector-based for crisp rendering at any size
4. **Accessibility**: High contrast with descriptive titles and descriptions
5. **Cohesion**: Unified visual style across all icons

## Usage

### In Badge Generation

Icons are automatically loaded and rendered by the `badgeIconRenderer` utility:

```typescript
import { renderIcon, renderMultipleIcons } from '@/utils/badgeIconRenderer';

// Render single icon
const iconSVG = await renderIcon('tree_planter', 200, 180);

// Render multiple icons (up to 3)
const multiIconSVG = await renderMultipleIcons(
  ['tree_planter', 'carbon_warrior', 'water_guardian'],
  200,
  180
);
```

### Direct Import

```typescript
import { getIconFilePath, ICON_SPECS } from '@/assets/badges/icons';

const iconPath = getIconFilePath('tree_planter');
// Returns: '/src/assets/badges/icons/tree-planter.svg'
```

## Icon Rendering Features

- **Circular Backdrop**: Semi-transparent circle behind icon (30% opacity)
- **Glass Effect**: Applied via SVG filter for glassmorphism aesthetic
- **Shadow**: Subtle shadow for depth and contrast
- **Scaling**: Automatic scaling to fit badge size
- **Multi-Icon Layout**: Balanced composition for 1-3 icons

## Accessibility

Each icon includes:
- `<title>` element for screen readers
- `<desc>` element with detailed description
- High contrast (white on colored backgrounds)
- Minimum size of 50x50px for visibility

## File Size

- Average size: 1-2 KB per icon
- Total icons size: ~12 KB
- Optimized for fast loading

## Customization

To modify an icon:
1. Edit the SVG file directly
2. Maintain the 120x120 viewBox
3. Keep stroke-width at 4px for consistency
4. Use white (#FFFFFF) for primary color
5. Test at multiple sizes (50px to 200px)

## Adding New Icons

To add a new achievement icon:

1. Create SVG file in this directory
2. Follow naming convention: `achievement-name.svg`
3. Use 120x120 viewBox
4. Add to `ICON_FILES` in `index.ts`
5. Update `achievementConfig.ts` with metadata
6. Add entry to this README

## Testing

Icons should be tested:
- At minimum size (50x50px)
- At standard size (120x120px)
- At maximum size (200x200px)
- On all tier color backgrounds
- With glassmorphism effects applied
