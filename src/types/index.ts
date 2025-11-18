/**
 * Types Index
 * Central export point for all type definitions
 */

export type {
  User,
  UserProfile,
  UserRole,
  ForestPreference,
  RegisterData,
  LoginCredentials,
  AuthResponse,
} from './user.types';

export type {
  GGCoinTransaction,
  GGCoinBalance,
  GGCoinTransactionType,
  GGCoinReferenceType,
  CreditGGCoinsParams,
  DebitGGCoinsParams,
  GGCoinOperationResult,
} from './ggCoin.types';

export type {
  BadgePurchase,
  BadgePurchaseStatus,
  InitiatePurchaseParams,
  InitiatePurchaseResult,
  CompletePurchaseParams,
  CompletePurchaseResult,
  VerifyAndRewardParams,
  VerifyAndRewardResult,
} from './badgePurchase.types';

export { BADGE_PRICE_KES, BADGE_PURCHASE_GG_COIN_REWARD } from './badgePurchase.types';
