import {
  Home,
  Trophy,
  Users,
  Hash,
  MessageSquare,
  Calendar,
  Trees,
  Leaf,
  Map,
  Plus,
  ShoppingBag,
  Cloud,
  Award,
  Heart,
  Shield,
  BarChart,
  User,
  type LucideIcon,
} from 'lucide-react';

// Map of icon names to Lucide icon components
export const iconMap: Record<string, LucideIcon> = {
  home: Home,
  trophy: Trophy,
  users: Users,
  hash: Hash,
  'message-square': MessageSquare,
  calendar: Calendar,
  tree: Trees,
  leaf: Leaf,
  map: Map,
  plus: Plus,
  'shopping-bag': ShoppingBag,
  cloud: Cloud,
  award: Award,
  heart: Heart,
  shield: Shield,
  'bar-chart': BarChart,
  user: User,
};

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className = 'w-5 h-5' }: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return <div className={className} />;
  }
  
  return <IconComponent className={className} />;
}
