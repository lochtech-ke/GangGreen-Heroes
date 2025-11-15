import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import type { User as UserType } from '../../types/user.types';

interface UserMenuProps {
  user: UserType;
  onLogout: () => Promise<void>;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get user initials for avatar
  const getInitials = () => {
    const name = user.profile?.full_name || user.email;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {getInitials()}
        </div>
        {/* User Name */}
        <span className="hidden md:block">
          {user.profile?.full_name || user.email}
        </span>
        {/* Dropdown Icon */}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1 capitalize">
                {user.role}
              </p>
            </div>

            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              tabIndex={isOpen ? 0 : -1}
            >
              <User className="w-4 h-4 mr-3" />
              Profile
            </Link>

            {/* Settings Link */}
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              tabIndex={isOpen ? 0 : -1}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:bg-red-50"
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
            >
              <LogOut className="w-4 h-4 mr-3" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
