import { BadgeSocialShare } from './BadgeSocialShare';
import { BADGE_PURCHASE_GG_COIN_REWARD } from '../../types/badgePurchase.types';

interface BadgePurchaseConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  badgeName: string;
  badgeType: string;
  tier: string;
  badgeImage: string;
  transactionReference: string;
  ggCoinsEarned?: number;
  userProfileUrl?: string;
}

export const BadgePurchaseConfirmation: React.FC<BadgePurchaseConfirmationProps> = ({
  isOpen,
  onClose,
  badgeName,
  badgeType,
  tier,
  badgeImage,
  transactionReference,
  ggCoinsEarned = BADGE_PURCHASE_GG_COIN_REWARD,
  userProfileUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful! 🎉</h2>
          <p className="text-gray-600">Your badge has been purchased successfully</p>
        </div>

        {/* Badge Display */}
        <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-4">
            <img
              src={badgeImage}
              alt={badgeName}
              className="w-24 h-24 rounded-lg object-cover shadow-md"
            />
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1">{badgeName}</h3>
              <p className="text-sm text-gray-600 capitalize mb-2">{tier} Tier • {badgeType}</p>
              <div className="flex items-center gap-2 text-sm text-green-700 bg-white px-3 py-1 rounded-full w-fit">
                <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">GG</span>
                </div>
                <span className="font-semibold">+{ggCoinsEarned} GG Coin{ggCoinsEarned !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Transaction Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Reference:</span>
              <span className="font-mono text-gray-900">{transactionReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GG Coins Earned:</span>
              <span className="font-semibold text-green-600">+{ggCoinsEarned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">Completed</span>
            </div>
          </div>
        </div>

        {/* GG Coins Highlight */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">GG</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">GG Coins Credited!</h4>
              <p className="text-sm text-gray-700">
                You've earned <span className="font-bold">{ggCoinsEarned} GG Coin{ggCoinsEarned !== 1 ? 's' : ''}</span> for this purchase. 
                Use GG Coins for exclusive rewards and benefits in the #GangGreen community!
              </p>
            </div>
          </div>
        </div>

        {/* Social Share Section */}
        <div className="mb-6">
          <BadgeSocialShare
            badgeName={badgeName}
            badgeType={badgeType}
            tier={tier}
            userProfileUrl={userProfileUrl}
            badgeImageUrl={badgeImage}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <a
            href={userProfileUrl || '/profile'}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
          >
            View in Profile
          </a>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Your badge will appear in your profile shortly. Thank you for supporting #GangGreen!
          </p>
        </div>
      </div>
    </div>
  );
};
