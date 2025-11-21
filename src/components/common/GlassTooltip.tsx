import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassTooltipProps } from '../../types/glass.types';

/**
 * Enhanced GlassTooltip component with configurable delay and keyboard support
 * Provides contextual information with glassmorphism styling
 */
export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  content,
  position = 'top',
  delay = 200,
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Position configuration
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white/70',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white/70',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white/70',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white/70',
  };

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Handle keyboard focus
  const handleFocus = () => {
    handleMouseEnter();
  };

  const handleBlur = () => {
    handleMouseLeave();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={`
              absolute z-tooltip glass px-3 py-2 text-sm whitespace-nowrap rounded-lg
              shadow-lg pointer-events-none
              ${positionClasses[position]}
              ${className}
            `}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div
              className={`
                absolute w-0 h-0 border-4 border-transparent
                ${arrowClasses[position]}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
