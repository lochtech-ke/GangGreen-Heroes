import type { ForestPreference } from '../../types/user.types';

interface ForestSelectorProps {
  value: ForestPreference;
  onChange: (forest: ForestPreference) => void;
  disabled?: boolean;
}

const FORESTS = [
  {
    value: 'kakamega' as ForestPreference,
    name: 'Kakamega Forest',
    description: 'Primary pilot site - Indigenous rainforest',
    area: '238 km²',
    color: 'green',
  },
  {
    value: 'karura' as ForestPreference,
    name: 'Karura Forest',
    description: 'Urban conservation area in Nairobi',
    area: '10.5 km²',
    color: 'blue',
  },
  {
    value: 'mau' as ForestPreference,
    name: 'Mau Forest',
    description: 'Critical water tower ecosystem',
    area: '400 km²',
    color: 'purple',
  },
];

export function ForestSelector({ value, onChange, disabled }: ForestSelectorProps) {
  const getColorClasses = (forest: string, isSelected: boolean) => {
    const colors = {
      green: isSelected
        ? 'border-green-500 bg-green-50'
        : 'border-gray-300 hover:border-green-300',
      blue: isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-300 hover:border-blue-300',
      purple: isSelected
        ? 'border-purple-500 bg-purple-50'
        : 'border-gray-300 hover:border-purple-300',
    };
    return colors[forest as keyof typeof colors] || colors.green;
  };

  const getCheckmarkColor = (forest: string) => {
    const colors = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
    };
    return colors[forest as keyof typeof colors] || colors.green;
  };

  return (
    <div className="space-y-3">
      {FORESTS.map((forest) => {
        const isSelected = value === forest.value;
        return (
          <button
            key={forest.value}
            type="button"
            onClick={() => !disabled && onChange(forest.value)}
            disabled={disabled}
            className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-left ${getColorClasses(
              forest.color,
              isSelected
            )} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {forest.name}
                  </h3>
                  {isSelected && (
                    <span className={`text-xl ${getCheckmarkColor(forest.color)}`}>
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{forest.description}</p>
                <p className="text-xs text-gray-500">Area: {forest.area}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
