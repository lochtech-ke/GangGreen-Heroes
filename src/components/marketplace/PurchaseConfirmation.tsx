import type { Transaction } from '../../types/carbonCredit.types';

interface PurchaseConfirmationProps {
  transaction: Transaction;
  onViewHistory?: () => void;
  onDownloadReceipt?: () => void;
}

export function PurchaseConfirmation({
  transaction,
  onViewHistory,
  onDownloadReceipt,
}: PurchaseConfirmationProps) {
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    } else if (currency === 'KES') {
      return `KES ${amount.toLocaleString()}`;
    }
    return `${amount} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-700 bg-green-100',
      pending: 'text-yellow-700 bg-yellow-100',
      failed: 'text-red-700 bg-red-100',
      refunded: 'text-gray-700 bg-gray-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-5xl">✓</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Purchase Successful!
        </h1>
        <p className="text-gray-600">
          Thank you for your contribution to environmental conservation
        </p>
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Transaction Details
        </h2>

        <div className="space-y-4">
          {/* Transaction ID */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-600">Transaction ID</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {transaction.id}
            </span>
          </div>

          {/* Date */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-600">Date & Time</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(transaction.transaction_date)}
            </span>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-600">Status</span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                transaction.payment_status
              )}`}
            >
              {transaction.payment_status === 'completed' && <span>✓</span>}
              {transaction.payment_status.charAt(0).toUpperCase() +
                transaction.payment_status.slice(1)}
            </span>
          </div>

          {/* Quantity */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-600">Carbon Credits</span>
            <span className="text-sm font-medium text-gray-900">
              {transaction.quantity_tons} tons CO₂
            </span>
          </div>

          {/* Payment Method */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-600">Payment Method</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {transaction.payment_method.replace('_', ' ')}
            </span>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-green-700">
              {formatCurrency(transaction.total_amount, transaction.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Your Environmental Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🌳</div>
            <div className="text-2xl font-bold text-green-700">
              {Math.round(transaction.quantity_tons * 20)}
            </div>
            <div className="text-xs text-gray-600">Trees Equivalent</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🚗</div>
            <div className="text-2xl font-bold text-green-700">
              {Math.round(transaction.quantity_tons * 2200)}
            </div>
            <div className="text-xs text-gray-600">Miles Not Driven</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💡</div>
            <div className="text-2xl font-bold text-green-700">
              {Math.round(transaction.quantity_tons * 1200)}
            </div>
            <div className="text-xs text-gray-600">kWh Saved</div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>A confirmation email has been sent to your registered email address</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Your carbon credits are now active in your account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>You can view all your transactions in your purchase history</span>
          </li>
          {transaction.receipt_url && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Your receipt is available for download below</span>
            </li>
          )}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {transaction.receipt_url && onDownloadReceipt && (
          <button
            onClick={onDownloadReceipt}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>📄</span>
            Download Receipt
          </button>
        )}
        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Purchase History
          </button>
        )}
      </div>

      {/* Share */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Share your contribution to inspire others!
        </p>
        <div className="flex justify-center gap-3">
          <button className="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            f
          </button>
          <button className="w-10 h-10 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors">
            t
          </button>
          <button className="w-10 h-10 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
            ✉
          </button>
        </div>
      </div>
    </div>
  );
}
