import type { QuickAction } from '../../types/chatbot.types';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
}

export function QuickActions({ actions, onActionClick }: QuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" role="region" aria-label="Suggested actions">
      <p className="text-xs text-gray-500 font-medium" id="quick-actions-label">Suggested actions:</p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="quick-actions-label">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action)}
            className="px-3 py-2 text-sm font-medium text-green-700 bg-white border-2 border-green-500 rounded-lg hover:bg-green-50 hover:border-green-600 transition-all duration-200 text-left min-h-[44px]"
            aria-label={`Quick action: ${action.label}`}
            title={action.query}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
