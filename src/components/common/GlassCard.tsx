import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCardProps } from '../../types/glass.types';

/**
 * Enhanced GlassCard component with variant system and hover effects
 * Supports glassmorphism design with multiple variants and interactive hover states
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  hover = 'none',
  className = '',
  children,
  onClick,
  as = 'div',
}) => {
  const [tiltStyle, setTiltStyle] = useState({});
  const cardRef = useRef<HTMLDivElement>(null);

  // Variant class mapping
  const variantClasses = {
    default: 'glass',
    dark: 'glass-dark',
    green: 'glass-green',
    heavy: 'glass-heavy',
  };

  // Hover effect class mapping
  const hoverClasses = {
    lift: 'hover-lift-sm',
    glow: 'hover-glow',
    tilt: '', // Handled by motion and mouse events
    none: '',
  };

  // Handle 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover !== 'tilt' || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    if (hover === 'tilt') {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.3s ease-out',
      });
    }
  };

  const clickableClass = onClick ? 'cursor-pointer' : '';
  const focusClass = onClick ? 'focus-ring' : '';

  const Component = as;

  // For tilt effect, use motion.div
  if (hover === 'tilt') {
    return (
      <motion.div
        ref={cardRef}
        className={`${variantClasses[variant]} rounded-2xl p-6 ${clickableClass} ${focusClass} ${className}`}
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </motion.div>
    );
  }

  // For other hover effects, use regular div or custom element
  return (
    <Component
      className={`${variantClasses[variant]} rounded-2xl p-6 ${hoverClasses[hover]} ${clickableClass} ${focusClass} ${className}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </Component>
  );
};
