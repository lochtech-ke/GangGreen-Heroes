import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  TreeDeciduous,
  Leaf,
  ShoppingCart,
  Trophy,
  Plus,
  Shield,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  badge?: number;
  onClick?: () => void;
}

// Icon mapping
const iconMap = {
  home: Home,
  tree: TreeDeciduous,
  leaf: Leaf,
  'shopping-cart': ShoppingCart,
  trophy: Trophy,
  plus: Plus,
  shield: Shield,
};

export function NavItem({ to, icon, label, badge, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Home;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`
        relative flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
        transition-colors duration-200
        ${
          isActive
            ? 'text-green-700 bg-green-50'
            : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
        }
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <IconComponent className="w-5 h-5" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}
