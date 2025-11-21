# Design Document

## Overview

The unified footer design consolidates the existing `Footer.tsx` and `HomeFooter.tsx` components into a single, reusable component that provides consistent branding, navigation, and information across all pages of the #GangGreen platform. The design leverages the established glassmorphism design system and ensures responsive behavior across all device sizes.

## Architecture

### Component Structure

```
src/components/common/
  └── UnifiedFooter.tsx       # Single footer component
  
src/components/layout/
  └── Layout.tsx              # Updated to use UnifiedFooter
  
src/pages/
  └── HomePage.tsx            # Updated to use UnifiedFooter
```

### Component Hierarchy

```
UnifiedFooter
├── Brand Section (Logo, tagline, mission statement)
├── Navigation Grid
│   ├── Platform Links (Initiatives, Trees, Marketplace, NFT Badges)
│   ├── Support Links (Help, Contact, FAQs)
│   └── Legal Links (Terms, Privacy, Cookies, Tax, Acceptable Use)
├── Pilot Forests Section
│   ├── Kakamega Forest
│   ├── Karura Forest
│   └── Mau Forest
├── Social Media Section
│   ├── Twitter
│   ├── Facebook
│   ├── Instagram
│   └── LinkedIn
├── Partnership Section
│   ├── Partner logos/names
│   └── Wangari Maathai tribute
├── Contact & Copyright Section
│   ├── Company info
│   ├── Email contact
│   └── Copyright & license
└── Tax Notice Banner
```

## Components and Interfaces

### UnifiedFooter Component

**File:** `src/components/common/UnifiedFooter.tsx`

**Props Interface:**
```typescript
interface UnifiedFooterProps {
  variant?: 'default' | 'minimal';  // Optional: minimal variant for specific pages
  className?: string;                // Optional: additional CSS classes
}
```

**Key Features:**
- Glassmorphism styling with backdrop blur
- Responsive grid layout (1 column mobile, 4 columns desktop)
- Icon integration using lucide-react
- React Router Link components for navigation
- External link handling with proper security attributes
- Hover effects and transitions
- Accessibility attributes (aria-labels, semantic HTML)

### Design Tokens

**Colors:**
- Background: `bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900`
- Glass overlay: `glass-dark backdrop-blur-sm`
- Text primary: `text-white`
- Text secondary: `text-gray-300`
- Text muted: `text-gray-400`
- Accent: `text-green-400`, `text-green-500`
- Borders: `border-white/10`

**Typography:**
- Section headings: `text-lg font-semibold text-green-400`
- Brand name: `text-2xl font-bold text-gradient`
- Body text: `text-sm text-gray-300`
- Links: `hover:text-green-400 transition-colors`

**Spacing:**
- Container padding: `px-4 sm:px-6 lg:px-8 py-12`
- Section gaps: `gap-8`
- List item spacing: `space-y-3`
- Border spacing: `pt-8 pb-8`

**Effects:**
- Glass card: `glass-card` (from design system)
- Hover scale: `hover:scale-110 transition-transform`
- Backdrop blur: `backdrop-blur-sm`

## Data Models

### Navigation Link Structure

```typescript
interface FooterLink {
  label: string;
  path: string;
  icon: LucideIcon;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}
```

### Social Media Link Structure

```typescript
interface SocialLink {
  label: string;
  url: string;
  icon: LucideIcon;
}
```

### Pilot Forest Structure

```typescript
interface PilotForest {
  name: string;
  description: string;
  icon?: LucideIcon;
}
```

### Partner Structure

```typescript
interface Partner {
  name: string;
  url?: string;
}
```

## Layout Design

### Desktop Layout (≥768px)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] #GangGreen                                          │
│  Mission statement text...                                  │
│  Built for Track 3 badge                                    │
│                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ Platform │ Support  │ Legal    │ Company  │            │
│  │ • Init   │ • Help   │ • Terms  │ About    │            │
│  │ • Trees  │ • Contact│ • Privacy│ Contact  │            │
│  │ • Market │ • FAQs   │ • Cookie │ Email    │            │
│  │ • Badges │ • Policy │ • Tax    │          │            │
│  │          │          │ • AUP    │          │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Pilot Forests                                              │
│  ┌──────────┬──────────┬──────────┐                       │
│  │ Kakamega │ Karura   │ Mau      │                       │
│  │ Primary  │ Urban    │ Water    │                       │
│  └──────────┴──────────┴──────────┘                       │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Connect With Us                                            │
│  [Twitter] [Facebook] [Instagram] [LinkedIn]               │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  In Partnership With                                        │
│  Green Belt Movement • GSMA • Antugrow                     │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  © 2025 Loch Tech Solutions                                │
│  Honoring Prof. Wangari Maathai                            │
│  Wangari Maathai Hackathon 2025 - Track 3                 │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🇰🇪 Kenyan Tax Relief: Donations may be eligible... │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

```
┌─────────────────────────┐
│  [Logo] #GangGreen      │
│  Mission statement...   │
│  Track 3 badge          │
│                         │
│  Platform               │
│  • Initiatives          │
│  • Trees                │
│  • Marketplace          │
│  • Badges               │
│                         │
│  Support                │
│  • Help                 │
│  • Contact              │
│  • FAQs                 │
│  • Privacy              │
│                         │
│  Legal                  │
│  • Terms                │
│  • Privacy              │
│  • Cookies              │
│  • Tax                  │
│  • AUP                  │
│                         │
│  ───────────────────    │
│                         │
│  Pilot Forests          │
│  Kakamega Forest        │
│  Primary pilot site     │
│                         │
│  Karura Forest          │
│  Urban conservation     │
│                         │
│  Mau Forest             │
│  Water tower ecosystem  │
│                         │
│  ───────────────────    │
│                         │
│  Connect With Us        │
│  [T] [F] [I] [L]       │
│                         │
│  ───────────────────    │
│                         │
│  Partners               │
│  GBM • GSMA • Antugrow │
│                         │
│  ───────────────────    │
│                         │
│  © 2025 Loch Tech      │
│  Prof. Wangari Maathai │
│  Hackathon Track 3     │
│                         │
│  ┌───────────────────┐ │
│  │ 🇰🇪 Tax Relief... │ │
│  └───────────────────┘ │
└─────────────────────────┘
```

## Error Handling

### Navigation Errors

- **Invalid Routes:** Links use React Router's `Link` component which handles invalid routes gracefully
- **External Link Failures:** External links open in new tabs with `rel="noopener noreferrer"` for security
- **Missing Icons:** Fallback to text-only display if icon import fails

### Responsive Behavior

- **Breakpoint Handling:** Use Tailwind's responsive classes (`md:`, `lg:`) for graceful degradation
- **Overflow Protection:** Apply `overflow-hidden` and proper text truncation where needed
- **Touch Targets:** Ensure minimum 44x44px touch targets on mobile devices

### Accessibility

- **Semantic HTML:** Use `<footer>`, `<nav>`, `<ul>`, `<li>` elements appropriately
- **ARIA Labels:** Add `aria-label` to icon-only buttons and social links
- **Keyboard Navigation:** Ensure all interactive elements are keyboard accessible
- **Focus Indicators:** Maintain visible focus states for keyboard users
- **Screen Readers:** Use descriptive link text and proper heading hierarchy

## Testing Strategy

### Unit Tests

**File:** `src/components/common/UnifiedFooter.test.tsx`

Test cases:
1. Component renders without errors
2. All navigation links are present and correct
3. Social media links open in new tabs
4. External links have proper security attributes
5. Responsive classes are applied correctly
6. Icons render alongside link text
7. Tax notice banner is displayed
8. Copyright year is current

### Integration Tests

1. Footer renders correctly in Layout component
2. Footer renders correctly in HomePage
3. Navigation links route to correct pages
4. External links open properly
5. Footer maintains consistent styling across pages

### Visual Regression Tests

1. Desktop layout matches design specifications
2. Mobile layout stacks correctly
3. Tablet layout adapts appropriately
4. Hover states work as expected
5. Glassmorphism effects render correctly
6. Dark mode compatibility (if applicable)

### Accessibility Tests

1. Keyboard navigation works through all links
2. Screen reader announces sections correctly
3. Focus indicators are visible
4. Color contrast meets WCAG AA standards
5. Touch targets meet minimum size requirements

## Implementation Notes

### Migration Strategy

1. Create `UnifiedFooter.tsx` component with all features
2. Update `Layout.tsx` to import and use `UnifiedFooter`
3. Update `HomePage.tsx` to import and use `UnifiedFooter`
4. Remove old `Footer.tsx` and `HomeFooter.tsx` components
5. Update any imports in other files
6. Test across all pages to ensure consistency

### Performance Considerations

- Use React.memo() if footer re-renders unnecessarily
- Lazy load social media icons if bundle size is a concern
- Optimize glassmorphism effects for lower-end devices
- Consider reducing backdrop blur on mobile for performance

### Maintenance

- Keep navigation links in sync with routing configuration
- Update copyright year automatically
- Maintain partner list in a configuration file for easy updates
- Document any customization options for future developers

## Dependencies

- `react-router-dom`: For Link component and navigation
- `lucide-react`: For icons
- Tailwind CSS: For styling
- Existing glassmorphism design system classes
