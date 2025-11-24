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

export type {
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  GitHubPullRequest,
  GitHubReview,
  GitHubIssue,
  GitHubContributor,
  ProcessedCommit,
  ProcessedPullRequest,
  ProcessedReview,
  ProcessedIssue,
  GitHubAccountLink,
  GitHubOAuthConfig,
  GitHubOAuthResponse,
  GitHubAPIConfig,
  GitHubServiceResponse,
  ContributionSyncResult,
  GitHubCache,
  CacheEntry,
  GitHubPaginationParams,
  GitHubPaginatedResponse,
  RepositoryConfig,
  GitHubError,
  GitHubErrorCode,
} from './github.types';

export type {
  ContributionScore,
  ContributionScoreRow,
  ContributionWeights,
  DistributionCycle,
  DistributionCycleRow,
  RawContributionData,
  ContributionAnalysis,
  SuspiciousActivityPattern,
  SuspiciousActivityResult,
  ContributorRanking,
  CycleStatistics,
  ContributionAnalyzerResponse,
  AnalyzerConfig,
  BatchAnalysisJob,
  BatchAnalysisProgress,
  ContributionAnalyzerError,
  ContributionAnalyzerErrorCode,
} from './contributionAnalyzer.types';
export type {
  HeroBadgeConfig,
  HeroBadgeHolder,
  HeroBadgePurchaseParams,
  HeroBadgePurchaseResult,
  HeroStatusResult,
  GrantHeroStatusParams,
  SuspendHeroStatusParams,
  ReinstateHeroStatusParams,
  HeroBadgeOperationResult,
  GetHeroHoldersResult,
  HeroBadgeConfigRow,
  HeroBadgeHolderRow,
} from './heroBadge.types';

export {
  HERO_BADGE_TYPE,
  HERO_BADGE_TIER,
  DEFAULT_HERO_PRICE_KES,
  DEFAULT_DAILY_REWARD,
  DEFAULT_INITIATIVE_MULTIPLIER,
  DEFAULT_MARKETPLACE_DISCOUNT,
  DEFAULT_CONTENT_PRIORITY_BOOST,
  isHeroBadgeConfig,
  isHeroBadgeHolder,
} from './heroBadge.types';

export type {
  HeroBenefits,
  BenefitType,
  BenefitUsageParams,
  BenefitUsageRecord,
  BenefitUsageAnalytics,
  RewardMultiplierParams,
  FeeDiscountParams,
  ContentPriorityParams,
  HeroBenefitsOperationResult,
  BenefitAnalyticsResult,
  BenefitUsageRow,
} from './heroBenefit.types';

export {
  DEFAULT_HERO_BENEFITS,
  isBenefitUsageRecord,
  isBenefitUsageAnalytics,
} from './heroBenefit.types';

export type {
  DailyRewardConfig,
  RewardDistributionResult,
  UserRewardCalculation,
  HeroDailyReward,
  DistributeRewardsParams,
  RewardHistoryParams,
  RewardHistoryResult,
  RewardAnalytics,
  FailedRewardDistribution,
  RewardDistributionStatus,
  UserActivityLevel,
  HeroDailyRewardRow,
  HeroRewardOperationResult,
  RewardRetryConfig,
} from './heroReward.types';

export {
  DEFAULT_DAILY_REWARD_CONFIG,
  DEFAULT_RETRY_CONFIG,
  isHeroDailyReward,
  isRewardDistributionResult,
} from './heroReward.types';