# Home Page Redesign - Quick Start Guide

## Getting Started

This guide will help you quickly implement the glassmorphism home page redesign.

## 1. Install Dependencies

```bash
# Install icon library
npm install lucide-react

# Install animation libraries
npm install framer-motion react-intersection-observer

# Verify installation
npm list lucide-react framer-motion react-intersection-observer
```

## 2. Configure Tailwind

Update `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.glass': {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
        '.glass-green': {
          background: 'rgba(16, 185, 129, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
        },
      });
    },
  ],
};
```

## 3. Update Global CSS

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply transition-smooth;
  }
  
  html {
    scroll-behavior: smooth;
  }
}

@layer utilities {
  .transition-smooth {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .transition-elastic {
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600;
  }
  
  .hover-lift {
    @apply hover:-translate-y-2 hover:shadow-2xl;
  }
}

/* Backdrop filter fallback */
@supports not (backdrop-filter: blur(12px)) {
  .glass {
    background: rgba(255, 255, 255, 0.95);
  }
  .glass-dark {
    background: rgba(255, 255, 255, 0.15);
  }
  .glass-green {
    background: rgba(16, 185, 129, 0.2);
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 4. Create Base Components

### GlassCard Component

Create `src/components/common/GlassCard.tsx`:

```tsx
import React from 'react';

interface GlassCardProps {
  variant?: 'default' | 'dark' | 'green' | 'heavy';
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  variant = 'default', 
  className = '',
  children,
  hover = true,
}) => {
  const variantClasses = {
    default: 'glass',
    dark: 'glass-dark',
    green: 'glass-green',
    heavy: 'glass bg-white/90',
  };

  const hoverClass = hover ? 'hover-lift cursor-pointer' : '';

  return (
    <div className={`${variantClasses[variant]} rounded-2xl p-6 ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};
```

### GlassButton Component

Create `src/components/common/GlassButton.tsx`:

```tsx
import React from 'react';
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
    primary: 'glass bg-green-500/20 border-green-500/30 text-green-900 hover:bg-green-500/30',
    secondary: 'glass bg-white/70 border-white/30 text-gray-900 hover:bg-white/90',
    ghost: 'glass bg-transparent border-white/20 text-white hover:bg-white/10',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${className}
        rounded-xl font-semibold
        flex items-center justify-center gap-2
        transition-smooth hover-lift
      `}
    >
      {Icon && iconPosition === 'left' && <Icon size={20} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={20} />}
    </button>
  );
};
```

### AnimatedSection Component

Create `src/components/common/AnimatedSection.tsx`:

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, 
  className = '',
  delay = 0,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
```

## 5. Icon Usage Examples

### Basic Icon Usage

```tsx
import { TreePine, Award, Users, Sparkles } from 'lucide-react';

// Simple icon
<TreePine size={24} className="text-green-600" />

// Icon with animation
<Sparkles size={32} className="text-amber-500 animate-pulse" />

// Icon in button
<button className="flex items-center gap-2">
  <Award size={20} />
  Earn Badge
</button>
```

### Icon in Glass Card

```tsx
import { TreePine } from 'lucide-react';
import { GlassCard } from '@/components/common/GlassCard';

<GlassCard>
  <div className="flex flex-col items-center">
    <div className="w-20 h-20 rounded-full glass-green flex items-center justify-center mb-4">
      <TreePine size={40} className="text-green-600" />
    </div>
    <h3 className="text-xl font-bold">Trees Planted</h3>
    <p className="text-3xl font-bold text-gradient">12,543</p>
  </div>
</GlassCard>
```

## 6. Animation Examples

### Fade In Up

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <h1>Welcome to Gang Green</h1>
</motion.div>
```

### Staggered Children

```tsx
import { motion } from 'framer-motion';

const container = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="initial" animate="animate">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Hover Scale

```tsx
import { motion } from 'framer-motion';

<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="glass rounded-2xl p-6"
>
  <h3>Hover me!</h3>
</motion.div>
```

## 7. Common Patterns

### Glass Card with Icon Header

```tsx
import { Award } from 'lucide-react';
import { GlassCard } from '@/components/common/GlassCard';

<GlassCard variant="green">
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
      <Award size={24} className="text-green-600" />
    </div>
    <div>
      <h3 className="text-lg font-bold mb-2">Achievement Unlocked</h3>
      <p className="text-gray-600">You've planted your first tree!</p>
    </div>
  </div>
</GlassCard>
```

### Metric Card with Counter

```tsx
import { TreePine, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/common/GlassCard';
import { AnimatedSection } from '@/components/common/AnimatedSection';

<AnimatedSection>
  <GlassCard className="text-center">
    <div className="w-20 h-20 mx-auto rounded-full glass-green flex items-center justify-center mb-4 animate-pulse-glow">
      <TreePine size={40} className="text-green-600 animate-float" />
    </div>
    <div className="text-4xl font-bold text-gradient mb-2">12,543</div>
    <div className="text-gray-600 mb-2">Trees Planted</div>
    <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
      <TrendingUp size={16} />
      <span>+15% this month</span>
    </div>
  </GlassCard>
</AnimatedSection>
```

### CTA Button with Icon

```tsx
import { ArrowRight } from 'lucide-react';
import { GlassButton } from '@/components/common/GlassButton';

<GlassButton 
  variant="primary" 
  size="lg" 
  icon={ArrowRight}
  onClick={() => navigate('/signup')}
>
  Start Your Journey
</GlassButton>
```

## 8. Testing Checklist

- [ ] Glass effects render correctly in Chrome
- [ ] Glass effects render correctly in Firefox
- [ ] Glass effects render correctly in Safari
- [ ] Fallback styles work in older browsers
- [ ] Icons load and display correctly
- [ ] Animations run smoothly at 60fps
- [ ] Hover effects work on desktop
- [ ] Touch interactions work on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Reduced motion preference is respected
- [ ] Page loads in under 3 seconds
- [ ] Lighthouse score > 85

## 9. Common Issues & Solutions

### Issue: Backdrop filter not working

**Solution**: Check browser support and ensure fallback is in place:

```css
@supports not (backdrop-filter: blur(12px)) {
  .glass {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

### Issue: Icons not displaying

**Solution**: Verify import and check console for errors:

```tsx
// Correct import
import { TreePine } from 'lucide-react';

// Not this
import TreePine from 'lucide-react/TreePine';
```

### Issue: Animations causing performance issues

**Solution**: Use GPU-accelerated properties and reduce complexity:

```css
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}
```

### Issue: Glass cards hard to read

**Solution**: Increase opacity or add darker background:

```tsx
<GlassCard variant="heavy">
  {/* More opaque background */}
</GlassCard>
```

## 10. Next Steps

1. Review the full [Design System documentation](./DESIGN_SYSTEM.md)
2. Check the [Requirements](./requirements.md) for feature details
3. Follow the [Tasks](./tasks.md) for implementation order
4. Refer to [Design Document](./design.md) for component specifications

## Resources

- [Lucide Icons](https://lucide.dev/) - Icon library documentation
- [Framer Motion](https://www.framer.com/motion/) - Animation library docs
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Glassmorphism](https://hype4.academy/tools/glassmorphism-generator) - Glass effect generator

## Support

For questions or issues:
1. Check the design system documentation
2. Review component examples in this guide
3. Test in multiple browsers
4. Verify accessibility compliance
