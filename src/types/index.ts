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

export type {
  Platform,
  MediaType,
  ModerationStatus,
  FlagType,
  ReviewDecision,
  SocialPostRow,
  PostEngagementRow,
  ModerationFlagRow,
  SavedPostRow,
  SocialPost,
  PostEngagement,
  ModerationFlag,
  SavedPost,
  FeedFilters,
  PaginationParams,
  FeedQueryParams,
  PlatformBreakdown,
  EngagementTrend,
  FeedAnalytics,
  DateRange,
  GetPostsResponse,
  SavePostResponse,
  UnsavePostResponse,
  GetAnalyticsResponse,
  InstagramPost,
  TwitterPost,
  TwitterUser,
  TwitterMedia,
  FacebookPost,
  ModerationResult,
  ModerationRequest,
  TransformFunction,
  ApiError,
  ServiceResponse,
} from './socialFeed.types';

export type {
  PixiPreloaderProps,
  PreloaderState,
  PreloaderConfig,
  SceneConfig,
  AnimationTimeline,
  FlagColors,
} from './preloader.types';

export { DEFAULT_PRELOADER_CONFIG } from './preloader.types';

export type {
  JourneyProgress,
  JourneyProgressRow,
  Milestone,
  MilestoneAction,
  UserAction,
  Recommendation,
  StageRequirements,
  JourneyServiceResponse,
} from './journey.types';

export { JourneyStage } from './journey.types';

export type {
  MicroChallenge,
  MicroChallengeRow,
  UserChallengeProgress,
  UserChallengeProgressRow,
  ChallengeRequirement,
  ChallengeDifficulty,
  ChallengeStatus,
  ChallengeFilters,
  JoinChallengeParams,
  UpdateProgressParams,
  CompleteChallengeParams,
  ChallengeServiceResponse,
} from './microChallenge.types';

export type {
  UserReferral,
  UserReferralRow,
  ReferralStats,
  ReferralMilestone,
  ReferralStatus,
  CreateReferralParams,
  ActivateReferralParams,
  ReferralServiceResponse,
} from './referral.types';

export type {
  Petition,
  PetitionRow,
  PetitionSignature,
  PetitionSignatureRow,
  PetitionWithSignature,
  PetitionStatus,
  CreatePetitionParams,
  SignPetitionParams,
  PetitionFilters,
  PetitionServiceResponse,
} from './petition.types';

export type {
  BadgeTier,
  ForestType,
  AchievementType,
  BadgeMetadata,
  BadgeConfig,
  TierStyle,
  ForestTheme,
  SVGGradient,
  SVGFilter,
  SVGPattern,
  SVGClipPath,
  SVGDefs,
  SVGElement,
  SVGLayer,
  SVGTemplate,
  BadgeExportOptions,
  BadgeGenerationResult,
  BadgeValidationResult,
} from './badge.types';
