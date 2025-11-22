import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { NavGroupConfig } from './types';
import { ChevronDown } from 'lucide-react';
import { Icon } from './iconMap';

interface NavDropdownProps {
  group: NavGroupConfig;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function NavDropdown({ group, isOpen, onToggle, onClose }: NavDropdownProps) {
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if any item in the group is active
  const isGroupActive = group.items.some(
    (item) => item.to === location.pathname || location.pathname.startsWith(`${item.to}/`)
  );

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current);
      }
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return;
    
    // Cancel any pending close
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    
    // Open with slight delay for hover intent
    if (!isOpen) {
      enterTimerRef.current = setTimeout(() => {
        onToggle();
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    
    // Cancel any pending open
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    
    // Close with delay to allow cursor movement to dropdown
    leaveTimerRef.current = setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    if (isMobile) {
      onToggle();
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      {/* Unified container for hover intent - wraps trigger and dropdown */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Dropdown Trigger Button */}
        <button
          onClick={handleClick}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg
            text-sm font-medium transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            ${
              isGroupActive
                ? 'text-green-600 bg-green-50'
                : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
            }
          `}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={`${group.label} menu`}
        >
          <Icon name={group.icon} className="w-5 h-5" />
          <span>{group.label}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={onClose}
              aria-hidden="true"
            />
          )}
          
          <div
            className={`
              absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50
              animate-in fade-in slide-in-from-top-2 duration-200
            `}
            role="menu"
            aria-orientation="vertical"
            aria-label={`${group.label} navigation menu`}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center gap-2">
                <Icon name={group.icon} className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">{group.label}</h3>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-2 max-h-96 overflow-y-auto">
              {group.items.map((item) => {
                const isActive =
                  item.to === location.pathname ||
                  location.pathname.startsWith(`${item.to}/`);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`
                      flex items-start gap-3 px-4 py-3 transition-all duration-150
                      focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500
                      ${
                        isActive
                          ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                          : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200'
                      }
                    `}
                    role="menuitem"
                  >
                    <div className={`flex-shrink-0 mt-0.5 ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      <Icon name={item.icon} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && typeof item.badge === 'number' && item.badge > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
}
