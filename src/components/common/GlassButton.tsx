import React from 'react';
import { Loader2 } from 'lucide-react';
import { GlassButtonProps } from '../../types/glass.types';

/**
 * Enhanced GlassButton component with loading states and icon integration
 * Supports multiple variants, sizes, and accessibility features
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  children,
  onClick,
  className = '',
  type = 'button',
  ariaLabel,
}) => {
  // Size configuration
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // Variant configuration with glass effects
  const variantClasses = {
    primary: 'glass-button-primary text-white hover:bg-green-500/90 hover:shadow-lg',
    secondary: 'glass-button-secondary text-gray-900 hover:bg-white/70 hover:shadow-md',
    ghost: 'glass-button-ghost text-green-600 hover:bg-green-50/50 hover:border-green-500/50',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${className}
        rounded-xl font-semibold
        flex items-center justify-center gap-2
        transition-smooth
        focus-ring
        disabled:opacity-50 disabled:cursor-not-allowed
        ${!isDisabled ? 'hover-lift-sm' : ''}
      `}
    >
      {loading ? (
        <>
          <Loader2 size={iconSizes[size]} className="animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon size={iconSizes[size]} aria-hidden="true" />
          )}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && (
            <Icon size={iconSizes[size]} aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
};
