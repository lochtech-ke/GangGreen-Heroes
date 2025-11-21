import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from './iconMap';
import { useAuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { NavItem } from './NavItem';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { NavDropdown } from './NavDropdown';
import { QuickActions } from './QuickActions';
import { NotificationCenter } from './NotificationCenter';
import { GGCoinDisplay } from './GGCoinDisplay';
import {
  getNavigationGroups,
  getStandaloneItems,
  getAdminItems,
} from './navigationConfig';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get navigation items based on user role
  const navigationGroups = getNavigationGroups(user?.role);
  const standaloneItems = getStandaloneItems(user?.role);
  const adminItems = getAdminItems(user?.role);

  // Handle logout
  const handleLogout = async () => {
    const { error } = await authService.logout();
    if (error) {
      console.error('Logout failed:', error);
      // Could show a toast notification here
    } else {
      navigate('/login');
    }
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (groupId: string) => {
    setOpenDropdown(openDropdown === groupId ? null : groupId);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-fixed glass backdrop-blur-md border-b border-white/20 shadow-lg ${className}`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Left Section: Mobile Menu Button + Logo */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-md text-gray-600 hover:bg-white/50 focus-ring transition-smooth"
                  aria-label="Open menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <Icon name="menu" size="ui" ariaHidden />
                </button>
              </div>

              {/* Logo */}
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#GG</span>
                </div>
                <span className="text-xl font-bold text-green-700 hidden sm:inline">
                  #GangGreen
                </span>
              </Link>
            </div>

            {/* Center Section: Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              {/* Standalone Items */}
              {standaloneItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  badge={typeof item.badge === 'function' ? item.badge() : item.badge}
                />
              ))}

              {/* Navigation Groups (Dropdowns) */}
              {navigationGroups.map((group) => (
                <NavDropdown
                  key={group.id}
                  group={group}
                  isOpen={openDropdown === group.id}
                  onToggle={() => handleDropdownToggle(group.id)}
                  onClose={closeAllDropdowns}
                />
              ))}

              {/* Admin Items */}
              {adminItems.length > 0 && (
                <div className="border-l border-gray-200 pl-2 ml-2">
                  {adminItems.map((item) => (
                    <NavItem
                      key={item.to}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      badge={typeof item.badge === 'function' ? item.badge() : item.badge}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Section: Actions + User Menu */}
            {user && (
              <div className="flex items-center gap-2">
                {/* Quick Actions - Desktop Only */}
                <div className="hidden lg:block">
                  <QuickActions userId={user.id} userRole={user.role} />
                </div>

                {/* GG Coin Display - Desktop Only */}
                <div className="hidden md:block">
                  <GGCoinDisplay userId={user.id} />
                </div>

                {/* Notification Center */}
                <NotificationCenter userId={user.id} />

                {/* User Menu */}
                <UserMenu user={user} onLogout={handleLogout} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {user && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          standaloneItems={standaloneItems}
          navigationGroups={navigationGroups}
          adminItems={adminItems}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
