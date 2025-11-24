import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { ggCoinService } from '../../services/ggCoin.service';
import type { GGCoinTransaction } from '../../types/ggCoin.types';

interface GGCoinDisplayProps {
  userId: string;
  showAnimation?: boolean;
}

export function GGCoinDisplay({ userId, showAnimation = true }: GGCoinDisplayProps) {
  const [balance, setBalance] = useState<number>(0);
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<GGCoinTransaction[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const currentBalance = await ggCoinService.getBalance(userId);
        setBalance(currentBalance);
        setPreviousBalance(currentBalance);
      } catch (error) {
        console.error('Error loading GG Coin balance:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBalance();

    // Subscribe to real-time balance updates
    const unsubscribe = ggCoinService.subscribeToBalance(userId, (newBalance) => {
      if (newBalance !== balance) {
        setPreviousBalance(balance);
        setBalance(newBalance);
        if (showAnimation) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, balance, showAnimation]);

  // Load recent transactions for tooltip
  useEffect(() => {
    const loadRecentTransactions = async () => {
      try {
        const transactions = await ggCoinService.getTransactionHistory(userId, 3);
        setRecentTransactions(transactions);
      } catch (error) {
        console.error('Error loading recent transactions:', error);
      }
    };

    if (showTooltip) {
      loadRecentTransactions();
    }
  }, [userId, showTooltip]);

  const balanceChange = balance - previousBalance;
  const showChange = isAnimating && balanceChange !== 0;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="w-5 h-5 bg-yellow-200 rounded-full animate-pulse" />
        <div className="w-12 h-4 bg-yellow-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link
        to="/gamification"
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all duration-200 group"
      >
        {/* GG Coin Icon */}
        <div className="relative">
          <Coins
            className={`w-5 h-5 text-yellow-600 transition-transform duration-300 ${
              isAnimating ? 'scale-125 rotate-12' : 'group-hover:scale-110'
            }`}
          />
          {showChange && (
            <span
              className={`absolute -top-4 -right-2 text-xs font-bold animate-bounce ${
                balanceChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {balanceChange > 0 ? '+' : ''}
              {ggCoinService.formatGGCoins(Math.abs(balanceChange), false)}
            </span>
          )}
        </div>

        {/* Balance Display with Decimal Precision */}
        <span
          className={`text-sm font-bold transition-all duration-300 ${
            isAnimating ? 'scale-110 text-green-600' : 'text-yellow-800'
          }`}
        >
          {ggCoinService.formatGGCoins(balance, true)}
        </span>
      </Link>

      {/* Tooltip with Recent Transactions */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-yellow-600" />
              <h3 className="text-sm font-semibold text-gray-900">GG Coins</h3>
            </div>
            <p className="text-xs text-gray-500">
              Your current balance: <span className="font-bold text-yellow-700">{ggCoinService.formatGGCoins(balance, true)}</span> GG Coins
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Earn 1 GG Coin per 200 KES spent - even small purchases count!
            </p>
          </div>

          {recentTransactions.length > 0 && (
            <div className="px-4 py-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Recent Activity</h4>
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate flex-1">
                      {transaction.description || transaction.transaction_type}
                    </span>
                    <span
                      className={`font-semibold ml-2 ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                      title={`${transaction.amount > 0 ? '+' : ''}${ggCoinService.formatGGCoins(Math.abs(transaction.amount), true)} GG Coins`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {ggCoinService.formatGGCoins(Math.abs(transaction.amount), true)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <Link
              to="/gamification"
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              View transaction history →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
