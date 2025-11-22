import { ReactNode } from 'react';
import { Navigation, BottomNavBar } from '../navigation';
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

      {/* Main Content Wrapper - Add left padding for desktop sidebar */}
      <div className="flex-1 flex flex-col lg:pl-72">
        {/* Main Content - Add padding for fixed navigation */}
        <main className="pt-18 pb-20 md:pb-0 lg:pt-0 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Bottom Navigation Bar - Mobile Only */}
        {user && <BottomNavBar />}
      </div>
    </div>
  );
}