/**
 * GG Coin Types
 * Types for the GG Coin reward system
 */

export type GGCoinTransactionType =
  | 'credit'
  | 'debit'
  | 'purchase_reward'
  | 'referral_bonus'
  | 'achievement_reward'
  | 'admin_adjustment';

export type GGCoinReferenceType =
  | 'badge_purchase'
  | 'referral'
  | 'achievement'
  | 'admin'
  | 'other';

export interface GGCoinTransaction {
  id: string;
  user_id: string;
  transaction_type: GGCoinTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type?: GGCoinReferenceType;
  reference_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface GGCoinBalance {
  user_id: string;
  balance: number;
  last_updated: string;
}

export interface CreditGGCoinsParams {
  userId: string;
  amount: number;
  transactionType: GGCoinTransactionType;
  referenceType?: GGCoinReferenceType;
  referenceId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface DebitGGCoinsParams {
  userId: string;
  amount: number;
  transactionType: GGCoinTransactionType;
  referenceType?: GGCoinReferenceType;
  referenceId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface GGCoinOperationResult {
  success: boolean;
  transaction_id?: string;
  balance_before?: number;
  balance_after?: number;
  amount_credited?: number;
  amount_debited?: number;
  error?: string;
}
