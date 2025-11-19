import React from 'react';

interface GlassCardProps {
  variant?: 'default' | 'dark' | 'green' | 'heavy';
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  variant = 'default', 
  className = '',
  children,
  hover = true,
  onClick,
}) => {
  const variantClasses = {
    default: 'glass',
    dark: 'glass-dark',
    green: 'glass-green',
    heavy: 'glass bg-white/90',
  };

  const hoverClass = hover ? 'hover-lift cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${variantClasses[variant]} rounded-2xl p-6 ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
