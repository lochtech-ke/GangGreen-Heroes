# Home Page Integration Architecture

This document provides visual diagrams showing how the home page integrates with the SVG badge system and UnifiedFooter.

---

## Overall Home Page Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         HomePage                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Header (Sticky)                      │ │
│  │              #GangGreen Logo + Navigation               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                     HeroSection                         │ │
│  │         Brand Identity + Primary CTAs                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              NFTBadgeShowcase ⭐ NEW                    │ │
│  │                                                          │ │
│  │    ┌──────────────────────────────────────────────┐    │ │
│  │    │   Uses SVG Badge Design System               │    │ │
│  │    │   • BadgeSvgService                          │    │ │
│  │    │   • Tier-specific styling (5 tiers)          │    │ │
│  │    │   • Forest themes (3 forests)                │    │ │
│  │    │   • Achievement icons (8 types)              │    │ │
│  │    │   • Glassmorphism effects                    │    │ │
│  │    │   • Diamond tier animations                  │    │ │
│  │    └──────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  ImpactMetrics ⭐ UPDATED               │ │
│  │         Includes badge tier counts                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            UserJourneyVisualization                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               PilotForestsMap                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              FeatureHighlights                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             SocialProofSection                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            LeaderboardPreview                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            PartnershipSection                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              UnifiedFooter ⭐ NEW                       │ │
│  │                                                          │ │
│  │    ┌──────────────────────────────────────────────┐    │ │
│  │    │   Shared Component                           │    │ │
│  │    │   • Navigation links                         │    │ │
│  │    │   • Pilot forests info                       │    │ │
│  │    │   • Social media links                       │    │ │
│  │    │   • Partnership section                      │    │ │
│  │    │   • Legal links                              │    │ │
│  │    │   • Tax notice banner                        │    │ │
│  │    └──────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## SVG Badge System Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Badge Data Flow                           │
└─────────────────────────────────────────────────────────────┘

    Supabase Database
         │
         │ Query featured badges
         │ (tier, forest, achievement)
         ↓
    Badge Data Service
         │
         │ Fetch & transform
         ↓
    NFTBadgeShowcase Component
         │
         │ For each badge:
         ↓
    ┌─────────────────────────────────────┐
    │     BadgeSvgService.generateBadge   │
    │                                     │
    │  Input:                             │
    │  • tier: 'gold'                     │
    │  • forest: 'kakamega'               │
    │  • achievement: 'tree_planter'      │
    │  • metadata: { ... }                │
    │                                     │
    │  Process:                           │
    │  1. Load tier style ────────────┐   │
    │  2. Load forest theme ──────────┤   │
    │  3. Load achievement icon ──────┤   │
    │  4. Apply glassmorphism ────────┤   │
    │  5. Embed metadata ─────────────┤   │
    │  6. Add animations (if Diamond) │   │
    │                                 │   │
    │  Output: SVG string             │   │
    └─────────────────────────────────┘   │
         │                                 │
         │ Render SVG                      │
         ↓                                 │
    FeaturedBadgeCard                      │
         │                                 │
         │ Display with:                   │
         │ • Glass card container          │
         │ • Price info (GG Coins, KES)    │
         │ • Hover effects                 │
         │ • Tooltip with requirements     │
         ↓                                 │
    User sees beautiful badge              │
                                           │
    ┌──────────────────────────────────────┘
    │
    │ Badge Assets Used:
    │
    ├── src/assets/badges/templates/
    │   └── base-template.svg
    │
    ├── src/assets/badges/styles/
    │   ├── tierStyles.ts ──────────── Bronze, Silver, Gold, 
    │   │                              Platinum, Diamond
    │   ├── forestThemes.ts ────────── Kakamega, Karura, Mau
    │   └── achievementConfig.ts
    │
    ├── src/assets/badges/icons/
    │   ├── tree-planter.svg
    │   ├── carbon-warrior.svg
    │   ├── water-guardian.svg
    │   ├── biodiversity-champion.svg
    │   ├── community-leader.svg
    │   ├── climate-hero.svg
    │   ├── forest-protector.svg
    │   └── green-ambassador.svg
    │
    └── src/assets/badges/patterns/
        ├── kakamega-pattern.svg
        ├── karura-pattern.svg
        └── mau-pattern.svg
```

---

## Badge Tier System Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    Badge Tier Hierarchy                      │
└─────────────────────────────────────────────────────────────┘

    ╔═══════════════════════════════════════════════════════╗
    ║                    💎 DIAMOND                         ║
    ║  Color: #B9F2FF (Cyan)                               ║
    ║  Effect: Prismatic sparkle                           ║
    ║  Animation: ✨ Sparkle effect                        ║
    ║  Border: Animated gradient                           ║
    ╚═══════════════════════════════════════════════════════╝
                            ↑
    ╔═══════════════════════════════════════════════════════╗
    ║                   🏆 PLATINUM                         ║
    ║  Color: #E5E4E2 (Silver-white)                       ║
    ║  Effect: Mirror finish                               ║
    ║  Animation: None                                     ║
    ║  Border: Polished shine                              ║
    ╚═══════════════════════════════════════════════════════╝
                            ↑
    ╔═══════════════════════════════════════════════════════╗
    ║                     🥇 GOLD                          ║
    ║  Color: #FFD700 (Gold)                               ║
    ║  Effect: Radiant glow                                ║
    ║  Animation: None                                     ║
    ║  Border: Glowing gradient                            ║
    ╚═══════════════════════════════════════════════════════╝
                            ↑
    ╔═══════════════════════════════════════════════════════╗
    ║                     🥈 SILVER                        ║
    ║  Color: #C0C0C0 (Silver)                             ║
    ║  Effect: Polished shine                              ║
    ║  Animation: None                                     ║
    ║  Border: Metallic gradient                           ║
    ╚═══════════════════════════════════════════════════════╝
                            ↑
    ╔═══════════════════════════════════════════════════════╗
    ║                     🥉 BRONZE                        ║
    ║  Color: #CD7F32 (Bronze)                             ║
    ║  Effect: Brushed metal                               ║
    ║  Animation: None                                     ║
    ║  Border: Matte finish                                ║
    ╚═══════════════════════════════════════════════════════╝
```

---

## Forest Theme System Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    Forest Theme System                       │
└─────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════╗
║              🌳 KAKAMEGA FOREST                           ║
║              Tropical Rainforest                          ║
╠═══════════════════════════════════════════════════════════╣
║  Primary Color: #1B4D3E (Deep Emerald)                   ║
║  Secondary: #2D5F4F (Forest Green)                        ║
║  Accent: #4A7C59 (Moss)                                   ║
║                                                           ║
║  Pattern: Dense leaf canopy silhouette                    ║
║  Elements: 🦋 Butterflies, 🌿 Tropical leaves, 🌧️ Rain  ║
║  Border: Vine pattern                                     ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║              🏙️ KARURA FOREST                            ║
║              Urban Forest                                 ║
╠═══════════════════════════════════════════════════════════╣
║  Primary Color: #4A7C59 (Balanced Green)                 ║
║  Secondary: #8B7355 (Earth Brown)                         ║
║  Accent: #87CEEB (Sky Blue)                               ║
║                                                           ║
║  Pattern: Mixed trees with city skyline                   ║
║  Elements: 🐦 Birds, 🌳 Urban trees, 🛤️ Pathways         ║
║  Border: Geometric nature pattern                         ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║              ⛰️ MAU FOREST                               ║
║              Highland Forest / Water Tower                ║
╠═══════════════════════════════════════════════════════════╣
║  Primary Color: #3A5F5F (Cool Teal)                      ║
║  Secondary: #5B8A8A (Highland Green)                      ║
║  Accent: #B0C4C4 (Mist Gray)                              ║
║                                                           ║
║  Pattern: Mountain ridges with forest coverage            ║
║  Elements: 🏔️ Mountains, 💧 Water streams, ☁️ Clouds    ║
║  Border: Wave and mountain pattern                        ║
╚═══════════════════════════════════════════════════════════╝
```

---

## UnifiedFooter Integration

```
┌─────────────────────────────────────────────────────────────┐
│                  UnifiedFooter Component                     │
│              src/components/common/UnifiedFooter.tsx         │
└─────────────────────────────────────────────────────────────┘

    Used By:
    ├── HomePage.tsx ⭐ NEW
    ├── Layout.tsx (Dashboard pages)
    └── Other pages...

    ┌───────────────────────────────────────────────────────┐
    │                    Footer Structure                    │
    └───────────────────────────────────────────────────────┘

    ╔═══════════════════════════════════════════════════════╗
    ║  [Logo] #GangGreen                                    ║
    ║  Catalyzing a Carbon-Negative Africa                  ║
    ║  🏆 Built for Wangari Maathai Hackathon Track 3      ║
    ╚═══════════════════════════════════════════════════════╝

    ┌──────────┬──────────┬──────────┬──────────┐
    │ Platform │ Support  │ Legal    │ Company  │
    ├──────────┼──────────┼──────────┼──────────┤
    │ • Init   │ • Help   │ • Terms  │ • About  │
    │ • Trees  │ • Contact│ • Privacy│ • Contact│
    │ • Market │ • FAQs   │ • Cookie │ • Email  │
    │ • Badges │          │ • Tax    │          │
    │          │          │ • AUP    │          │
    └──────────┴──────────┴──────────┴──────────┘

    ─────────────────────────────────────────────────────

    🌳 Pilot Forests
    ┌──────────────┬──────────────┬──────────────┐
    │  Kakamega    │   Karura     │     Mau      │
    │  Primary     │   Urban      │   Water      │
    │  pilot site  │   forest     │   tower      │
    └──────────────┴──────────────┴──────────────┘

    ─────────────────────────────────────────────────────

    Connect With Us
    [🐦 Twitter] [📘 Facebook] [📷 Instagram] [💼 LinkedIn]

    ─────────────────────────────────────────────────────

    In Partnership With
    Green Belt Movement • GSMA • Antugrow

    ─────────────────────────────────────────────────────

    © 2025 Loch Tech Solutions • MIT License
    Honoring Prof. Wangari Maathai
    Wangari Maathai Hackathon 2025 - Track 3

    ┌───────────────────────────────────────────────────┐
    │ 🇰🇪 Kenyan Tax Relief: Donations may be eligible │
    │ for tax deductions. Learn more →                 │
    └───────────────────────────────────────────────────┘
```

---

## Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                  Component Dependencies                      │
└─────────────────────────────────────────────────────────────┘

HomePage
    │
    ├─→ Header
    │
    ├─→ HeroSection
    │
    ├─→ NFTBadgeShowcase
    │       │
    │       ├─→ BadgeSvgService ──────┐
    │       │                         │
    │       └─→ FeaturedBadgeCard     │
    │                                 │
    ├─→ ImpactMetrics                 │
    │                                 │
    ├─→ UserJourneyVisualization      │
    │                                 │
    ├─→ PilotForestsMap               │
    │                                 │
    ├─→ FeatureHighlights             │
    │                                 │
    ├─→ SocialProofSection            │
    │                                 │
    ├─→ LeaderboardPreview            │
    │                                 │
    ├─→ PartnershipSection            │
    │                                 │
    └─→ UnifiedFooter                 │
                                      │
    ┌─────────────────────────────────┘
    │
    │ Shared Dependencies:
    │
    ├─→ lucide-react (Icons)
    ├─→ framer-motion (Animations)
    ├─→ react-intersection-observer
    ├─→ Tailwind CSS (Styling)
    └─→ Glassmorphism utilities

    Badge System Assets:
    │
    ├─→ src/assets/badges/templates/
    ├─→ src/assets/badges/styles/
    ├─→ src/assets/badges/icons/
    └─→ src/assets/badges/patterns/
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Data Flow                               │
└─────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  Supabase DB     │
    └────────┬─────────┘
             │
             ├─→ Badge Data
             │   • id, name, tier
             │   • forest, achievement
             │   • priceGGCoins, priceKES
             │   • unlockRequirement
             │
             ├─→ Metrics Data
             │   • treesPlanted
             │   • carbonSequestered
             │   • activeUsers
             │   • badgesEarned (by tier)
             │
             └─→ User Data
                 • testimonials
                 • achievements
                 • leaderboard
                 
             ↓
             
    ┌──────────────────┐
    │  Data Services   │
    └────────┬─────────┘
             │
             ├─→ badgeService.ts
             ├─→ metricsService.ts
             └─→ userService.ts
             
             ↓
             
    ┌──────────────────┐
    │  HomePage        │
    └────────┬─────────┘
             │
             ├─→ NFTBadgeShowcase
             │       │
             │       └─→ BadgeSvgService
             │               │
             │               └─→ Generate SVG
             │
             ├─→ ImpactMetrics
             │       │
             │       └─→ Display tier counts
             │
             └─→ Other sections...
             
             ↓
             
    ┌──────────────────┐
    │  User sees       │
    │  beautiful       │
    │  home page       │
    └──────────────────┘
```

---

## File Structure

```
ganggreen-platform/
│
├── .kiro/specs/
│   ├── home-page-redesign/
│   │   ├── requirements.md ⭐ UPDATED
│   │   ├── design.md ⭐ UPDATED
│   │   ├── tasks.md ⭐ UPDATED
│   │   ├── INTEGRATION_REFERENCE.md ⭐ NEW
│   │   ├── INTEGRATION_DIAGRAM.md ⭐ NEW (this file)
│   │   └── UPDATE_SUMMARY.md ⭐ NEW
│   │
│   ├── nft-badge-svg-designs/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   ├── tasks.md
│   │   └── INTEGRATION_COMPLETE.md
│   │
│   └── unified-footer/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
├── src/
│   ├── assets/badges/
│   │   ├── templates/
│   │   ├── icons/
│   │   ├── patterns/
│   │   ├── styles/
│   │   ├── README.md
│   │   └── INTEGRATION_GUIDE.md
│   │
│   ├── components/
│   │   ├── common/
│   │   │   └── UnifiedFooter.tsx ⭐ USED
│   │   │
│   │   └── home/
│   │       ├── NFTBadgeShowcase.tsx ⭐ UPDATED
│   │       ├── ImpactMetrics.tsx ⭐ UPDATED
│   │       └── [other components]
│   │
│   ├── services/
│   │   └── badgeSvg.service.ts ⭐ USED
│   │
│   └── pages/
│       └── HomePage.tsx ⭐ UPDATED
│
└── [other files]
```

---

## Quick Visual Reference

### Badge Showcase Section

```
┌─────────────────────────────────────────────────────────────┐
│              🏆 Earn NFT Badges                              │
│     Celebrate your conservation achievements                 │
└─────────────────────────────────────────────────────────────┘

    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  💎      │  │  🥇      │  │  🥈      │
    │ Diamond  │  │  Gold    │  │ Silver   │
    │ Kakamega │  │  Karura  │  │   Mau    │
    │ 500 GGC  │  │ 300 GGC  │  │ 150 GGC  │
    └──────────┘  └──────────┘  └──────────┘
    
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  🥉      │  │  🏆      │  │  💎      │
    │ Bronze   │  │ Platinum │  │ Diamond  │
    │ Kakamega │  │  Karura  │  │   Mau    │
    │  50 GGC  │  │ 400 GGC  │  │ 500 GGC  │
    └──────────┘  └──────────┘  └──────────┘

            [View All Badges →]
```

### Impact Metrics Section

```
┌─────────────────────────────────────────────────────────────┐
│                    Our Impact                                │
└─────────────────────────────────────────────────────────────┘

    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   🌳     │  │   🍃     │  │   👥     │  │   🏆     │
    │ 12,543   │  │  45.2    │  │  3,421   │  │  8,765   │
    │  Trees   │  │ Tons CO₂ │  │  Active  │  │  Badges  │
    │ Planted  │  │Sequester │  │  Users   │  │  Earned  │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
                                                    │
                                                    ├─ 💎 1,234
                                                    ├─ 🏆 2,345
                                                    ├─ 🥇 3,456
                                                    ├─ 🥈 1,234
                                                    └─ 🥉   496
```

---

This diagram provides a comprehensive visual reference for understanding how the home page integrates with the SVG badge system and UnifiedFooter component.
