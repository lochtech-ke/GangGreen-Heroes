interface ActivityIconProps {
  type: string;
}

export function ActivityIcon({ type }: ActivityIconProps) {
  const getIcon = () => {
    switch (type) {
      case 'initiative': return '🌱';
      case 'tree_plant': return '🌳';
      case 'transaction': return '💳';
      case 'milestone': return '🏆';
      default: return '📌';
    }
  };

  return (
    <div className="text-2xl flex-shrink-0">
      {getIcon()}
    </div>
  );
}