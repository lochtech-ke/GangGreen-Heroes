import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, User, Settings, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { Icon } from './iconMap';
import type { NavItemConfig, NavGroupConfig } from './types';
import type { User as UserType } from '../../types/user.types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  standaloneItems: NavItemConfig[];
  navigationGroups: NavGroupConfig[];
  adminItems: NavItemConfig[];
  user: UserType;
  onLogout: () => Promise<void>;
}

export function MobileMenu({
  isOpen,
  onClose,
  standaloneItems,
  navigationGroups,
  adminItems,
  user,
  onLogout,
}: MobileMenuProps) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Auto-expand active group
  useEffect(() => {
    if (isOpen) {
      navigationGroups.forEach((group) => {
        const hasActiveItem = group.items.some(
          (item) => item.to === location.pathname || location.pathname.startsWith(`${item.to}/`)
        );
        if (hasActiveItem) {
          setExpandedGroups((prev) => new Set(prev).add(group.id));
        }
      });
    }
  }, [isOpen, location.pathname, navigationGroups]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">#GG</span>
            </div>
            <span className="text-lg font-bold text-green-700">#GangGreen</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.profile?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || user.email.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {/* Standalone Items */}
            {standaloneItems.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors
                    ${isActive ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <Icon name={item.icon} className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Navigation Groups */}
            {navigationGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const hasActiveItem = group.items.some(
                (item) => item.to === location.pathname || location.pathname.startsWith(`${item.to}/`)
              );

              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors
                      ${hasActiveItem ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <Icon name={group.icon} className="w-5 h-5" />
                    <span className="flex-1 text-left">{group.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="ml-8 space-y-1">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                              transition-colors
                              ${isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}
                            `}
                          >
                            <Icon name={item.icon} className="w-4 h-4" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && typeof item.badge === 'number' && item.badge > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                {item.badge > 9 ? '9+' : item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Admin Items */}
            {adminItems.length > 0 && (
              <>
                <div className="my-3 border-t border-gray-200" />
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </div>
                {adminItems.map((item) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-colors
                        ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}
                      `}
                    >
                      <Icon name={item.icon} className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* User Menu Items */}
          <div className="space-y-1">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button
              onClick={async () => {
                await onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
