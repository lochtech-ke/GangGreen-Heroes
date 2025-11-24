# Gang Green Glassmorphism Design System

## Overview

This design system defines the visual language, components, and patterns for the Gang Green platform's home page redesign. It emphasizes glassmorphism aesthetics, fluid animations, and a cohesive icon system to create a premium, modern user experience.

## Core Principles

1. **Transparency & Depth**: Use layered glass effects to create visual hierarchy
2. **Fluid Motion**: All interactions should feel smooth and natural
3. **Consistency**: Maintain uniform spacing, sizing, and styling across components
4. **Performance**: Optimize animations for 60fps on all devices
5. **Accessibility**: Ensure glass effects don't compromise readability or usability

## Icon System: Lucide React

### Installation

```bash
npm install lucide-react
```

### Usage Guidelines

**Import Pattern**:
```typescript
import { TreePine, Award, Users, Sparkles } from 'lucide-react';
```

**Sizing Standards**:
- UI Elements: 24px
- Feature Icons: 48px
- Hero Elements: 64px
- Large Decorative: 72-80px

**Styling**:
```tsx
<TreePine 
  size={24} 
  strokeWidth={2} 
  className="text-green-600"
/>
```

### Icon Mapping Reference

| Category | Icons | Usage |
|----------|-------|-------|
| **Nature** | `TreePine`, `Sprout`, `Trees`, `Leaf` | Tree planting, growth, forests |
| **Achievement** | `Award`, `Medal`, `Trophy`, `Star` | Badges, rewards, rankings |
| **Growth** | `TrendingUp`, `BarChart3`, `Activity` | Metrics, progress, analytics |
| **Community** | `Users`, `Heart`, `HandHeart` | Social features, participation |
| **Gamification** | `Sparkles`, `Zap`, `Target` | Points, challenges, goals |
| **Web3** | `Wallet`, `Coins`, `Shield` | Crypto, payments, security |
| **AI/Tech** | `Bot`, `Cpu`, `Lightbulb` | AI features, technology |
| **Location** | `MapPin`, `Globe`, `Navigation` | Maps, forests, geography |
| **Actions** | `ArrowRight`, `ChevronRight`, `ExternalLink` | CTAs, navigation, links |
| **Time** | `Clock`, `Calendar` | Timestamps, schedules |
| **Social** | `Quote`, `MessageCircle`, `Share2` | Testimonials, posts, sharing |

## Color System

### Primary Palette

```css
/* Green Spectrum */
--green-50: #F0FDF4;   /* Lightest background */
--green-100: #DCFCE7;  /* Subtle accents */
--green-500: #10B981;  /* Primary brand */
--green-600: #059669;  /* Hover states */
--green-700: #047857;  /* Active states */
--green-900: #064E3B;  /* Dark text */

/* Emerald Accent */
--emerald-500: #10B981;
--emerald-600: #059669;

/* Supporting Colors */
--blue-500: #3B82F6;   /* Info, water */
--amber-500: #F59E0B;  /* Legendary badges */
--purple-500: #A855F7; /* Epic badges */
--gold: #FFD700;       /* Rank #1 */
--silver: #C0C0C0;     /* Rank #2 */
--bronze: #CD7F32;     /* Rank #3 */
```

### Glass Effect Colors

```css
/* Glass Backgrounds */
--glass-white: rgba(255, 255, 255, 0.7);
--glass-white-light: rgba(255, 255, 255, 0.5);
--glass-white-heavy: rgba(255, 255, 255, 0.9);

--glass-dark: rgba(0, 0, 0, 0.05);
--glass-dark-medium: rgba(0, 0, 0, 0.1);
--glass-dark-heavy: rgba(0, 0, 0, 0.2);

--glass-green: rgba(16, 185, 129, 0.1);
--glass-green-medium: rgba(16, 185, 129, 0.2);

/* Glass Borders */
--glass-border: rgba(255, 255, 255, 0.3);
--glass-border-dark: rgba(255, 255, 255, 0.1);
--glass-border-green: rgba(16, 185, 129, 0.2);
```

## Typography

### Font Family

```css
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

```css
/* Display */
--text-hero: 64px;      /* Hero headlines */
--text-display: 48px;   /* Section headers */

/* Headings */
--text-h1: 40px;
--text-h2: 32px;
--text-h3: 24px;
--text-h4: 20px;

/* Body */
--text-lg: 18px;        /* Large body */
--text-base: 16px;      /* Default body */
--text-sm: 14px;        /* Small text */
--text-xs: 12px;        /* Captions */

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;
```

### Responsive Typography

```css
/* Mobile adjustments */
@media (max-width: 768px) {
  --text-hero: 40px;
  --text-display: 32px;
  --text-h1: 28px;
  --text-h2: 24px;
}
```

## Spacing System

### Scale

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 96px;
```

### Component Spacing

- **Card Padding**: 24px (desktop), 16px (mobile)
- **Section Padding**: 64px vertical, 24px horizontal
- **Grid Gap**: 24px (desktop), 16px (mobile)
- **Button Padding**: 16px horizontal, 12px vertical

## Glassmorphism Components

### Glass Card

**Base Style**:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

**Variants**:
```css
/* Dark Glass */
.glass-card-dark {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Green Tinted Glass */
.glass-card-green {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
}

/* Heavy Glass (more opaque) */
.glass-card-heavy {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
}
```

**React Component**:
```tsx
interface GlassCardProps {
  variant?: 'default' | 'dark' | 'green' | 'heavy';
  className?: string;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  variant = 'default', 
  className = '',
  children 
}) => {
  const variantClasses = {
    default: 'glass-card',
    dark: 'glass-card-dark',
    green: 'glass-card-green',
    heavy: 'glass-card-heavy',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};
```

### Glass Button

**Base Style**:
```css
.glass-button {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.glass-button:active {
  transform: translateY(0);
}
```

**React Component**:
```tsx
import { LucideIcon } from 'lucide-react';

interface GlassButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  children,
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'glass-button bg-green-500/20 border-green-500/30 text-green-900 hover:bg-green-500/30',
    secondary: 'glass-button bg-white/70 border-white/30 text-gray-900 hover:bg-white/90',
    ghost: 'glass-button bg-transparent border-white/20 text-white hover:bg-white/10',
  };

  return (
    <button
      onClick={onClick}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} flex items-center gap-2`}
    >
      {Icon && iconPosition === 'left' && <Icon size={20} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={20} />}
    </button>
  );
};
```

### Glass Tooltip

```tsx
import { motion, AnimatePresence } from 'framer-motion';

interface GlassTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 glass-card px-3 py-2 text-sm whitespace-nowrap"
            style={{
              [position]: '100%',
              left: position === 'top' || position === 'bottom' ? '50%' : undefined,
              transform: position === 'top' || position === 'bottom' ? 'translateX(-50%)' : undefined,
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

## Animation System

### Timing Functions

```css
/* Easing curves */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-bounce: cubic-bezier(0.68, -0.6, 0.32, 1.6);
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
```

### Keyframe Animations

```css
/* Float Animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Pulse Glow */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.6);
  }
}

/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide In Right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Rotate In */
@keyframes rotateIn {
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}
```

### Framer Motion Presets

```typescript
// Fade in up
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
};

// Stagger children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Scale in
export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] }
};

// Slide in from right
export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
};
```

### Scroll-Triggered Animations

```tsx
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

export const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
};
```

## Hover Effects

### Lift Effect

```css
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}
```

### Glow Effect

```css
.hover-glow {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-glow:hover {
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
}
```

### 3D Tilt Effect

```tsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const TiltCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="glass-card hover-lift"
    >
      {children}
    </motion.div>
  );
};
```

## Gradient System

### Text Gradients

```css
.text-gradient-green {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Background Gradients

```css
.bg-gradient-green {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
}

.bg-gradient-dark {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
}
```

### Border Gradients

```css
.border-gradient-green {
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #10B981, #059669) border-box;
}
```

## Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

### Usage

```css
/* Mobile first */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

## Accessibility Guidelines

### Color Contrast

- Ensure text on glass backgrounds maintains 4.5:1 contrast ratio
- Test glass overlays with contrast checker tools
- Provide fallback solid backgrounds for older browsers

### Keyboard Navigation

```css
/* Focus indicators */
.focusable:focus {
  outline: 2px solid #10B981;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

/* Glass focus state */
.glass-card:focus-within {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
```

### Screen Reader Support

```tsx
// Always include ARIA labels
<button aria-label="Start your journey">
  <ArrowRight size={24} />
</button>

// Provide alt text for decorative icons
<TreePine aria-hidden="true" />
<span className="sr-only">Trees planted</span>
```

## Performance Optimization

### GPU Acceleration

```css
/* Use transform and opacity for animations */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU acceleration */
}
```

### Reduce Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Backdrop Filter Fallback

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(12px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

## Browser Support

### Minimum Requirements

- Chrome 76+
- Firefox 103+
- Safari 15.4+
- Edge 79+

### Fallbacks

```tsx
// Detect backdrop-filter support
const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(12px)');

// Conditional styling
<div className={supportsBackdropFilter ? 'glass-card' : 'solid-card'}>
  {children}
</div>
```

## Implementation Checklist

- [ ] Install Lucide React icons
- [ ] Install Framer Motion
- [ ] Install react-intersection-observer
- [ ] Configure Tailwind with glass utilities
- [ ] Create global CSS with design tokens
- [ ] Build reusable glass components
- [ ] Test glass effects across browsers
- [ ] Verify accessibility compliance
- [ ] Optimize animations for performance
- [ ] Test on mobile devices
- [ ] Implement fallbacks for older browsers
