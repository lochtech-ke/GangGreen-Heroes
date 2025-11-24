import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { QuickActions } from './QuickActions';
import { NotificationCenter } from './NotificationCenter';
import { GGCoinDisplay } from './GGCoinDisplay';
import { Icon } from './iconMap';
import {
  getNavigationGroups,
  getStandaloneItems,
  getAdminItems,
  getFooterItems,
} from './navigationConfig';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedSidebarGroups, setExpandedSidebarGroups] = useState<Set<string>>(new Set());

  // Get navigation items based on user role
  const navigationGroups = getNavigationGroups(user?.role);
  const standaloneItems = getStandaloneItems(user?.role);
  const adminItems = getAdminItems(user?.role);
  const footerItems = getFooterItems(user?.role);

  // Handle logout
  const handleLogout = async () => {
    const { error } = await authService.logout();
    if (error) {
      console.error('Logout failed:', error);
    } else {
      navigate('/login');
    }
  };

  // Handle dropdown toggle
  // const handleDropdownToggle = (groupId: string) => {
  //   setOpenDropdown(openDropdown === groupId ? null : groupId);
  // };

  // Close all dropdowns
  // const closeAllDropdowns = () => {
  //   setOpenDropdown(null);
  // };

  // Toggle sidebar group expansion
  const toggleSidebarGroup = (groupId: string) => {
    const newExpanded = new Set(expandedSidebarGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedSidebarGroups(newExpanded);
  };

  // Check if a path is active
  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Check if any item in group is active
  const isGroupActive = (group: any) => {
    return group.items.some((item: any) => isPathActive(item.to));
  };

  return (
    <>
      {/* Top Navigation Bar - Mobile & Tablet */}
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

            {/* Center Section: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search initiatives, challenges, community..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                />
              </div>
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

      {/* Desktop Sidebar - Only visible on large screens */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-green-700 via-green-800 to-green-900 shadow-2xl z-40 flex-col"
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header */}
        <header className="flex items-center gap-3 p-6 border-b border-white/10">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-green-700 font-bold text-sm">#GG</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight">
                Gang Green
              </h1>
              <p className="text-white/70 text-xs">Environmental Action Hub</p>
            </div>
          </Link>
        </header>

        {/* Navigation Items - Scrollable */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-2" role="navigation">
            {/* Standalone Navigation Items */}
            {standaloneItems.map((item) => {
              const isActive = isPathActive(item.to);
              const badge = typeof item.badge === 'function' ? item.badge() : item.badge;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg shadow-black/10'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium flex-1">{item.label}</span>
                  {badge && typeof badge === 'number' && badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Navigation Groups (Collapsible in Sidebar) */}
            {navigationGroups.map((group) => {
              const isActive = isGroupActive(group);
              const isExpanded = expandedSidebarGroups.has(group.id);

              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header Button */}
                  <button
                    onClick={() => toggleSidebarGroup(group.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon name={group.icon} className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium flex-1 text-left">
                      {group.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Group Items (Collapsible) */}
                  {isExpanded && (
                    <div className="pl-4 space-y-1">
                      {group.items.map((item) => {
                        const itemActive = isPathActive(item.to);
                        const itemBadge =
                          typeof item.badge === 'function'
                            ? item.badge()
                            : item.badge;

                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 text-sm border-l-2 ${
                              itemActive
                                ? 'bg-white/10 text-white border-white'
                                : 'text-white/70 hover:bg-white/5 hover:text-white border-transparent hover:border-white/30'
                            }`}
                          >
                            <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-white/50 mt-0.5 line-clamp-1">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {itemBadge &&
                              typeof itemBadge === 'number' &&
                              itemBadge > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                  {itemBadge > 9 ? '9+' : itemBadge}
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
                <div className="my-4 border-t border-white/10" />
                <div className="space-y-2">
                  {adminItems.map((item) => {
                    const isActive = isPathActive(item.to);
                    const badge =
                      typeof item.badge === 'function' ? item.badge() : item.badge;

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-white/20 text-white shadow-lg'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium flex-1">{item.label}</span>
                        {badge && typeof badge === 'number' && badge > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {badge > 9 ? '9+' : badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer - NEW UPDATED SECTION */}
        {user && (
          <footer className="border-t border-white/10 p-4 space-y-3">
            {/* GG Coin Display */}
            {/* <div className="bg-white/10 rounded-lg p-3">
              <GGCoinDisplay userId={user.id} />
            </div>

            {/* Quick Actions & Notifications */}
            {/* <div className="flex items-center gap-2">
              <div className="flex-1">
                <QuickActions userId={user.id} userRole={user.role} />
              </div>
              <NotificationCenter userId={user.id} />
            </div> */}

            {/* Settings & Profile Links - NEW */}
            <div className="pt-2 border-t border-white/10 space-y-1">
              {footerItems.map((item) => {
                const isActive = isPathActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    title={item.description}
                  >
                    <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu - Keep for logout */}
            {/* <div className="pt-2 border-t border-white/10">
              <UserMenu user={user} onLogout={handleLogout} />
            </div> */}
          </footer>
        )}
      </aside>

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