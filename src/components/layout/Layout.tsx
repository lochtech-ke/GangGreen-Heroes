import { ReactNode } from 'react';
import { Navigation, BottomNavBar } from '../navigation';
import { Footer } from './Footer';
import { useAuthContext } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <Navigation />

      {/* Main Content - Add padding for fixed navigation (top and bottom on mobile) */}
      <main className="pt-18 pb-20 md:pb-0 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar - Mobile Only */}
      {user && <BottomNavBar />}

      {/* Footer - Hidden on mobile to avoid conflict with bottom nav */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
