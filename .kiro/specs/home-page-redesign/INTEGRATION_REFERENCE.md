# Home Page Redesign - Integration Reference

This document provides a quick reference for how the home page redesign integrates with other platform systems.

## SVG Badge Design System Integration

**Spec Location**: `.kiro/specs/nft-badge-svg-designs/`

### Overview
The NFT Badge Showcase section on the home page uses the comprehensive SVG badge design system to display visually stunning, tier-based achievement badges.

### Key Components

**Badge Service**: `src/services/badgeSvg.service.ts`
- Generates SVG badges programmatically
- Applies tier-specific styling
- Embeds metadata
- Exports to PNG for social sharing

**Badge Assets**: `src/assets/badges/`
```
badges/
├── templates/          # Base SVG templates
├── icons/             # Achievement icons (Tree Planter, Carbon Warrior, etc.)
├── patterns/          # Forest-specific patterns (Kakamega, Karura, Mau)
└── styles/            # Tier styles and forest themes
    ├── tierStyles.ts
    ├── forestThemes.ts
    └── achievementConfig.ts
```

### Badge Tiers

| Tier | Color | Effect | Animation |
|------|-------|--------|-----------|
| Bronze | #CD7F32 | Brushed metal | None |
| Silver | #C0C0C0 | Polished shine | None |
| Gold | #FFD700 | Radiant glow | None |
| Platinum | #E5E4E2 | Mirror finish | None |
| Diamond | #B9F2FF | Prismatic sparkle | Sparkle animation |

### Forest Themes

**Kakamega Forest** (Tropical Rainforest)
- Colors: Deep emerald (#1B4D3E), Forest green (#2D5F4F)
- Elements: Dense leaf canopy, tropical leaves, butterflies

**Karura Forest** (Urban Forest)
- Colors: Balanced green (#4A7C59), Earth brown (#8B7355)
- Elements: Mixed trees, city skyline, birds, pathways

**Mau Forest** (Highland Forest)
- Colors: Cool teal (#3A5F5F), Highland green (#5B8A8A)
- Elements: Mountain ridges, water streams, clouds

### Achievement Icons

- Tree Planter: Stylized tree with roots
- Carbon Warrior: Shield with CO2 crossed out
- Water Guardian: Water drop with hands
- Biodiversity Champion: Multiple species
- Community Leader: People forming tree
- Climate Hero: Sun and leaf with arrow
- Forest Protector: Forest in shield
- Green Ambassador: Megaphone with leaf

### Usage in Home Page

**NFTBadgeShowcase Component** (`src/components/home/NFTBadgeShowcase.tsx`):

```typescript
import { BadgeSvgService } from '@/services/badgeSvg.service';

// Generate badge SVG
const badgeSvg = BadgeSvgService.generateBadge({
  tier: 'gold',
  forest: 'kakamega',
  achievement: 'tree_planter',
  metadata: {
    badgeName: 'Kakamega Tree Planter',
    achievementCount: 50,
    earnedDate: '2025-11-20',
    // ... other metadata
  }
});

// Render in component
<div dangerouslySetInnerHTML={{ __html: badgeSvg }} />
```

**Display Specifications**:
- Badge size: 200x200px in showcase
- Hover effects: Lift, enhanced glass, tier-specific glow
- Diamond tier: Activate sparkle animation on hover
- Tooltip: Show unlock requirements

### Data Requirements

Badges fetched from database should include:
```typescript
interface FeaturedBadge {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  forest: 'kakamega' | 'karura' | 'mau';
  achievement: AchievementType;
  priceGGCoins: number;
  priceKES: number;
  unlockRequirement?: string;
}
```

---

## UnifiedFooter Integration

**Spec Location**: `.kiro/specs/unified-footer/`

### Overview
The home page uses the UnifiedFooter component to provide consistent navigation, branding, and information across all pages.

### Component Details

**Location**: `src/components/common/UnifiedFooter.tsx`

**Features**:
- Glassmorphism styling matching home page design
- Responsive layout (4 columns desktop, stacked mobile)
- Comprehensive navigation and legal links
- Pilot forests information
- Social media integration
- Partnership section
- Tax notice banner

### Footer Sections

**1. Brand Section**
- #GangGreen logo and tagline
- Mission statement
- Track 3 badge

**2. Navigation Grid**
- Platform Links: Initiatives, Trees, Marketplace, NFT Badges
- Support Links: Help, Contact, FAQs, Privacy
- Legal Links: Terms, Privacy, Cookies, Tax Receipt, AUP
- Company Info: About, Contact, Email

**3. Pilot Forests**
- Kakamega Forest: Primary pilot site
- Karura Forest: Urban conservation area
- Mau Forest: Water tower ecosystem

**4. Social Media**
- Twitter, Facebook, Instagram, LinkedIn
- Glassmorphism icon buttons
- Opens in new tabs

**5. Partnership Section**
- Green Belt Movement
- GSMA
- Antugrow
- Wangari Maathai Hackathon 2025

**6. Contact & Copyright**
- Loch Tech Solutions
- Email contact
- Copyright & MIT license
- Prof. Wangari Maathai tribute

**7. Tax Notice Banner**
- Kenyan tax relief information
- Link to tax receipt policy

### Usage in Home Page

**HomePage Component** (`src/pages/HomePage.tsx`):

```typescript
import { UnifiedFooter } from '@/components/common/UnifiedFooter';

function HomePage() {
  return (
    <div>
      {/* Hero, sections, etc. */}
      
      <UnifiedFooter />
    </div>
  );
}
```

**No customization needed** - the default variant works perfectly for the home page.

### Design Consistency

The UnifiedFooter uses the same design tokens as the home page:
- Glassmorphism effects (`glass-dark`, `backdrop-blur-sm`)
- Green accent colors (`text-green-400`, `text-green-500`)
- Lucide React icons
- Smooth transitions and hover effects
- Responsive breakpoints

### Testing Checklist

- [ ] Footer displays at bottom of home page
- [ ] All navigation links work correctly
- [ ] Pilot forests section displays properly
- [ ] Social media links open in new tabs
- [ ] Partnership logos display correctly
- [ ] Legal links navigate to correct pages
- [ ] Tax notice banner shows for Kenyan users
- [ ] Responsive layout works on mobile
- [ ] Glassmorphism effects match home page
- [ ] Hover effects work smoothly

---

## Cross-Component Dependencies

### Shared Design System

Both the SVG badge system and UnifiedFooter use:
- Glassmorphism design patterns
- Lucide React icons
- Tailwind CSS utilities
- Green color palette (#10B981, #059669)
- Smooth transitions and animations

### Data Flow

```
Database (Supabase)
    ↓
Badge Data Service
    ↓
NFTBadgeShowcase Component
    ↓
BadgeSvgService (generates SVG)
    ↓
Rendered Badge Display
```

### Performance Considerations

**Badge Rendering**:
- Generate badges on-demand
- Cache generated SVGs (LRU cache, max 100)
- Lazy load badges below the fold
- Optimize SVG file size (< 50KB)

**Footer**:
- Static component, minimal re-renders
- Use React.memo() if needed
- Lazy load social media icons if bundle size is concern

---

## Related Documentation

- **Home Page Redesign**: `.kiro/specs/home-page-redesign/`
  - `requirements.md` - User stories and acceptance criteria
  - `design.md` - Detailed design specifications
  - `tasks.md` - Implementation task list
  - `DESIGN_SYSTEM.md` - Design system guidelines
  - `QUICK_START.md` - Quick start guide

- **SVG Badge Design System**: `.kiro/specs/nft-badge-svg-designs/`
  - `requirements.md` - Badge system requirements
  - `design.md` - Badge design specifications
  - `tasks.md` - Implementation tasks
  - `INTEGRATION_COMPLETE.md` - Integration summary

- **UnifiedFooter**: `.kiro/specs/unified-footer/`
  - `requirements.md` - Footer requirements
  - `design.md` - Footer design specifications
  - `tasks.md` - Implementation tasks

- **Badge Assets**: `src/assets/badges/`
  - `README.md` - Asset organization guide
  - `INTEGRATION_GUIDE.md` - Integration instructions

---

## Quick Reference Commands

**Install Dependencies**:
```bash
npm install lucide-react framer-motion react-intersection-observer
```

**Generate Badge**:
```typescript
import { BadgeSvgService } from '@/services/badgeSvg.service';

const badge = BadgeSvgService.generateBadge(config);
```

**Use UnifiedFooter**:
```typescript
import { UnifiedFooter } from '@/components/common/UnifiedFooter';

<UnifiedFooter />
```

**Test Badge Rendering**:
```bash
npm run test -- badgeSvg.service.test.ts
```

**Check Footer Integration**:
```bash
npm run test -- UnifiedFooter.test.tsx
```

---

## Support

For questions or issues:
- Review the detailed design documents in each spec folder
- Check the implementation guides in `src/assets/badges/`
- Refer to the component source code with inline documentation
- Test with the provided test suites
