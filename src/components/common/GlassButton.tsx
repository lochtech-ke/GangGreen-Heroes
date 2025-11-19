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
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
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

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${className}
        rounded-xl font-semibold
        flex items-center justify-center gap-2
        transition-smooth hover-lift
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
      `}
    >
      {Icon && iconPosition === 'left' && <Icon size={iconSize[size]} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={iconSize[size]} />}
    </button>
  );
};
