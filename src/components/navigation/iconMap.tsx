import {
  // Nature & Environment
  TreePine,
  Sprout,
  Trees,
  Leaf,
  // Achievement & Rewards
  Award,
  Medal,
  Trophy,
  Star,
  // Growth & Analytics
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  // Community & Social
  Users,
  Heart,
  HandHeart,
  MessageCircle,
  Share2,
  Quote,
  // Gamification
  Sparkles,
  Zap,
  Target,
  // Web3 & Finance
  Wallet,
  Coins,
  Shield,
  DollarSign,
  // AI & Tech
  Bot,
  Cpu,
  Lightbulb,
  // Location
  MapPin,
  Globe,
  Navigation,
  Map,
  // Actions
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Plus,
  Minus,
  // Social Actions
  Bookmark,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2,
  // Filters & Views
  Filter,
  SortAsc,
  Grid,
  List,
  // Navigation
  Home,
  Calendar,
  ShoppingBag,
  Bell,
  Settings,
  LogOut,
  // Status & Feedback
  Lock,
  CheckCircle,
  Clock,
  Key,
  Link,
  Download,
  // Communication
  MessageSquare,
  Hash,
  // Admin
  Cloud,
  BarChart,
  // User
  User,
  // Menu
  Menu,
  // Governance
  Vote,
  FileText,
  PenTool,
  LayoutDashboard,
  Inbox,
  ShieldCheck,
  Info,
  FilePlus,
} from 'lucide-react';
import { IconMapEntry, IconProps } from '../../types/icon.types';

/**
 * Comprehensive icon mapping with category metadata and size variants
 */
export const iconMap: Record<string, IconMapEntry> = {
  // Nature & Environment
  'tree-pine': {
    component: TreePine,
    category: 'nature',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  sprout: {
    component: Sprout,
    category: 'nature',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  trees: {
    component: Trees,
    category: 'nature',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  tree: {
    component: Trees,
    category: 'nature',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  leaf: {
    component: Leaf,
    category: 'nature',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Achievement & Rewards
  award: {
    component: Award,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  medal: {
    component: Medal,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  trophy: {
    component: Trophy,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  star: {
    component: Star,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Growth & Analytics
  'trending-up': {
    component: TrendingUp,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'trending-down': {
    component: TrendingDown,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'bar-chart-3': {
    component: BarChart3,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'bar-chart': {
    component: BarChart,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  activity: {
    component: Activity,
    category: 'achievement',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Community & Social
  users: {
    component: Users,
    category: 'community',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  heart: {
    component: Heart,
    category: 'social',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'hand-heart': {
    component: HandHeart,
    category: 'community',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'message-circle': {
    component: MessageCircle,
    category: 'social',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'share-2': {
    component: Share2,
    category: 'social',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  quote: {
    component: Quote,
    category: 'social',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Gamification
  sparkles: {
    component: Sparkles,
    category: 'gamification',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  zap: {
    component: Zap,
    category: 'gamification',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  target: {
    component: Target,
    category: 'gamification',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Web3 & Finance
  wallet: {
    component: Wallet,
    category: 'web3',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  coins: {
    component: Coins,
    category: 'web3',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  shield: {
    component: Shield,
    category: 'web3',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'dollar-sign': {
    component: DollarSign,
    category: 'web3',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // AI & Tech
  bot: {
    component: Bot,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  cpu: {
    component: Cpu,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  lightbulb: {
    component: Lightbulb,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Location
  'map-pin': {
    component: MapPin,
    category: 'location',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  globe: {
    component: Globe,
    category: 'location',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  navigation: {
    component: Navigation,
    category: 'location',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  map: {
    component: Map,
    category: 'location',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Actions
  'arrow-right': {
    component: ArrowRight,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'chevron-right': {
    component: ChevronRight,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'chevron-down': {
    component: ChevronDown,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'external-link': {
    component: ExternalLink,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  plus: {
    component: Plus,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  minus: {
    component: Minus,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Social Actions
  bookmark: {
    component: Bookmark,
    category: 'social',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'more-horizontal': {
    component: MoreHorizontal,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  flag: {
    component: Flag,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  edit: {
    component: Edit,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'trash-2': {
    component: Trash2,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Filters & Views
  filter: {
    component: Filter,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'sort-asc': {
    component: SortAsc,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  grid: {
    component: Grid,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  list: {
    component: List,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Navigation
  home: {
    component: Home,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  calendar: {
    component: Calendar,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'shopping-bag': {
    component: ShoppingBag,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  bell: {
    component: Bell,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  settings: {
    component: Settings,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'log-out': {
    component: LogOut,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Status & Feedback
  lock: {
    component: Lock,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'check-circle': {
    component: CheckCircle,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  clock: {
    component: Clock,
    category: 'time',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  key: {
    component: Key,
    category: 'web3',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  link: {
    component: Link,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  download: {
    component: Download,
    category: 'action',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Communication
  'message-square': {
    component: MessageSquare,
    category: 'social',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  hash: {
    component: Hash,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Admin
  cloud: {
    component: Cloud,
    category: 'admin',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // User
  user: {
    component: User,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Menu
  menu: {
    component: Menu,
    category: 'navigation',
    size: { ui: 24, feature: 48, hero: 64 },
  },

  // Governance
  vote: {
    component: Vote,
    category: 'governance',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'file-text': {
    component: FileText,
    category: 'governance',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'pen-tool': {
    component: PenTool,
    category: 'governance',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'layout-dashboard': {
    component: LayoutDashboard,
    category: 'governance',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  inbox: {
    component: Inbox,
    category: 'governance',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'shield-check': {
    component: ShieldCheck,
    category: 'governance',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  info: {
    component: Info,
    category: 'governance',
    size: { ui: 24, feature: 48, hero: 64 },
  },
  'file-plus': {
    component: FilePlus,
    category: 'governance',
    size: { ui: 24, feature: 48, hero: 64 },
  },
};

/**
 * Enhanced Icon component with size variants and accessibility
 */
export function Icon({
  name,
  size = 'ui',
  className = '',
  strokeWidth = 2,
  ariaLabel,
  ariaHidden = false,
  onClick,
}: IconProps) {
  const iconEntry = iconMap[name];

  if (!iconEntry) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return <div className={`icon-placeholder ${className}`} aria-hidden="true" />;
  }

  const IconComponent = iconEntry.component;
  const sizeValue = typeof size === 'number' ? size : iconEntry.size[size] || 24;

  return (
    <IconComponent
      size={sizeValue}
      strokeWidth={strokeWidth}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      onClick={onClick}
    />
  );
}
