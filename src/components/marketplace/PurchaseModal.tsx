import { useEffect } from 'react';
import type { CarbonCredit, Transaction } from '../../types/carbonCredit.types';
import { PurchaseFlow } from './PurchaseFlow';

interface PurchaseModalProps {
  credit: CarbonCredit | null;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (transaction: Transaction) => void;
}

export function PurchaseModal({
  credit,
  userId,
  isOpen,
  onClose,
  onComplete,
}: PurchaseModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !credit) {
    return null;
  }

  const handleComplete = (transaction: Transaction) => {
    onComplete?.(transaction);
    // Keep modal open to show confirmation, user can close manually
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <span className="text-2xl">×</span>
          </button>

          {/* Purchase Flow */}
          <PurchaseFlow
            credit={credit}
            userId={userId}
            onComplete={handleComplete}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
