import { Leaf, Users, Award, TrendingUp } from 'lucide-react';

interface ActivityIconProps {
  type: string;
}

export function ActivityIcon({ type }: ActivityIconProps) {
  const getIcon = () => {
    switch (type) {
      case 'tree_planted':
        return <Leaf className="w-5 h-5 text-green-600" />;
      case 'initiative_joined':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'badge_earned':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'milestone_reached':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Leaf className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'tree_planted':
        return 'bg-green-100';
      case 'initiative_joined':
        return 'bg-blue-100';
      case 'badge_earned':
        return 'bg-yellow-100';
      case 'milestone_reached':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor()}`}>
      {getIcon()}
    </div>
  );
}
