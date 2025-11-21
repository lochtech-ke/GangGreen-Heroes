# Achievement Icons

This directory contains SVG icons for all 8 achievement types in the NFT badge system.

## Icon Specifications

- **Format**: SVG (Scalable Vector Graphics)
- **ViewBox**: 0 0 120 120
- **Style**: Line art with 4px stroke width
- **Color**: White (#FFFFFF) with subtle shadows
- **Size**: Designed for 120x120px, scalable to any size
- **Minimum Display Size**: 50x50px (per requirements)

## Available Icons

### 1. Tree Planter (`tree-planter.svg`)
- **Symbol**: Stylized tree with roots and branches
- **Represents**: Tree planting achievements
- **Category**: Conservation

### 2. Carbon Warrior (`carbon-warrior.svg`)
- **Symbol**: Shield with CO2 molecule crossed out
- **Represents**: Carbon offset achievements
- **Category**: Impact

### 3. Water Guardian (`water-guardian.svg`)
- **Symbol**: Water drop with protective hands
- **Represents**: Water conservation achievements
- **Category**: Conservation

### 4. Biodiversity Champion (`biodiversity-champion.svg`)
- **Symbol**: Multiple species silhouettes in harmony
- **Represents**: Biodiversity support achievements
- **Category**: Conservation

### 5. Community Leader (`community-leader.svg`)
- **Symbol**: Group of people forming a tree shape
- **Represents**: Community leadership achievements
- **Category**: Community

### 6. Climate Hero (`climate-hero.svg`)
- **Symbol**: Sun and leaf with upward arrow
- **Represents**: Climate action achievements
- **Category**: Impact

### 7. Forest Protector (`forest-protector.svg`)
- **Symbol**: Forest silhouette within a shield
- **Represents**: Forest protection achievements
- **Category**: Conservation

### 8. Green Ambassador (`green-ambassador.svg`)
- **Symbol**: Megaphone with leaf symbol
- **Represents**: Environmental advocacy achievements
- **Category**: Community

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
