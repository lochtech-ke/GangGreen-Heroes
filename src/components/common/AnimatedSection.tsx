import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AnimatedSectionProps } from '../../types/glass.types';

/**
 * Animation presets for different entrance effects
 */
export const animationPresets = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] as const },
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -180, scale: 0.5 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  },
};

/**
 * Enhanced AnimatedSection component with scroll-triggered animations
 * Supports multiple animation presets and respects user motion preferences
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  animation = 'fadeInUp',
  threshold = 0.1,
  triggerOnce = true,
  delay = 0,
  children,
  className = '',
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
  });

  // Get animation configuration
  const preset = animationPresets[animation];

  // If user prefers reduced motion, skip animations
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={preset.initial}
      animate={inView ? preset.animate : preset.initial}
      transition={{
        ...preset.transition,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
