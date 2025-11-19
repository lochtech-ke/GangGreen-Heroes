import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassTooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 glass px-3 py-2 text-sm whitespace-nowrap rounded-lg
              ${positionClasses[position]}
              ${className}
            `}
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
