import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { NavItem } from './NavItem';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { getNavigationItems } from './navigationConfig';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get navigation items based on user role
  const navigationItems = getNavigationItems(user?.role);

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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm ${className}`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                />
              ))}
            </div>

            {/* User Menu */}
            {user && (
              <div className="flex items-center">
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
          navItems={navigationItems}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
