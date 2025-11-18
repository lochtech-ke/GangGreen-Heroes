import type { CarbonCredit } from '../../types/carbonCredit.types';

interface CreditCardProps {
  credit: CarbonCredit;
  onClick?: () => void;
  showInitiative?: boolean;
}

export function CreditCard({ credit, onClick, showInitiative: _showInitiative = true }: CreditCardProps) {
  const getVerificationColor = (status: string) => {
    const colors = {
      verified: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getVerificationIcon = (status: string) => {
    const icons = {
      verified: '✓',
      pending: '⏳',
      rejected: '✗',
    };
    return icons[status as keyof typeof icons] || '?';
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    } else if (currency === 'KES') {
      return `KES ${amount.toLocaleString()}`;
    }
    return `${amount} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const availabilityPercentage = Math.round(
    (credit.available_quantity / credit.quantity_tons) * 100
  );

  const isAvailable = credit.available_quantity > 0;
  const isVerified = credit.verification_status === 'verified';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 ${
        onClick ? 'cursor-pointer' : ''
      } ${!isAvailable ? 'opacity-60' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(credit.price_per_ton, credit.currency)}
            </h3>
            <span className="text-sm text-gray-600">per ton</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getVerificationColor(
                credit.verification_status
              )}`}
            >
              <span>{getVerificationIcon(credit.verification_status)}</span>
              {credit.verification_status.charAt(0).toUpperCase() +
                credit.verification_status.slice(1)}
            </span>
            {!isAvailable && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Available</span>
          <span className="text-sm font-semibold text-green-600">
            {credit.available_quantity.toLocaleString()} / {credit.quantity_tons.toLocaleString()} tons
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              availabilityPercentage > 50
                ? 'bg-green-600'
                : availabilityPercentage > 20
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${availabilityPercentage}%` }}
          />
        </div>
      </div>

      {/* Total Value */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Value</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(credit.quantity_tons * credit.price_per_ton, credit.currency)}
          </span>
        </div>
      </div>

      {/* Verification Certificate */}
      {isVerified && credit.verification_certificate_url && (
        <div className="mb-4">
          <a
            href={credit.verification_certificate_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>📄</span>
            View Verification Certificate
          </a>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>Listed: {formatDate(credit.created_at)}</span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-green-700">
              <span>✓</span> Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
