import { useState } from 'react';
import { Trophy, Award, Target, Star, Crown, Zap, TrendingUp, Medal, Flame, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GGCoinBalance } from '../components/gamification/GGCoinBalance';

// Mock data based on documentation - replace with actual service calls
// Achievement Categories from docs: Getting Started, Tree Planter, Supporter, Community, Master
const ACHIEVEMENTS = [
  {
    id: 1,
    category: 'Getting Started',
    title: 'Welcome Aboard',
    description: 'Complete your profile',
    icon: '👋',
    progress: 1,
    total: 1,
    completed: true,
    points: 50,
    rarity: 'common',
    color: 'from-gray-400 to-gray-500'
  },
  {
    id: 2,
    category: 'Tree Planter',
    title: 'Seedling',
    description: 'Plant 10 trees',
    icon: '🌱',
    progress: 7,
    total: 10,
    completed: false,
    points: 100,
    rarity: 'common',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 3,
    category: 'Tree Planter',
    title: 'Forest Guardian',
    description: 'Plant 50 trees',
    icon: '🌳',
    progress: 7,
    total: 50,
    completed: false,
    points: 500,
    rarity: 'rare',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 4,
    category: 'Supporter',
    title: 'Generous Donor',
    description: 'Donate $100 total',
    icon: '💰',
    progress: 45,
    total: 100,
    completed: false,
    points: 200,
    rarity: 'rare',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 5,
    category: 'Community',
    title: 'Silver Recruiter',
    description: 'Refer 5 friends',
    icon: '👥',
    progress: 3,
    total: 5,
    completed: false,
    points: 250,
    rarity: 'epic',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 6,
    category: 'Master',
    title: 'Daily Devotee',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    progress: 4,
    total: 7,
    completed: false,
    points: 150,
    rarity: 'epic',
    color: 'from-orange-400 to-orange-600'
  },
];

// Leaderboard types from docs: Global, Forest-specific, Time-based
const LEADERBOARD = [
  { rank: 1, name: 'EcoWarrior99', points: 12450, forest: 'Kakamega', change: 0, avatar: '🌟' },
  { rank: 2, name: 'GreenHero', points: 11200, forest: 'Karura', change: 1, avatar: '🌿' },
  { rank: 3, name: 'TreePlanter', points: 9800, forest: 'Mau', change: -1, avatar: '🌲' },
  { rank: 4, name: 'ClimateChampion', points: 8650, forest: 'Kakamega', change: 2, avatar: '🏆' },
  { rank: 5, name: 'NatureGuardian', points: 7920, forest: 'Karura', change: 0, avatar: '🛡️' },
  { rank: 6, name: 'You', points: 6530, forest: 'Kakamega', change: 3, isUser: true, avatar: '👤' },
];

// NFT Badge tiers from docs: Bronze, Silver, Gold, Platinum, Diamond
// Badge types from docs: Tree Planter, Carbon Warrior, Crypto Donor, Community Leader, Forest Guardian, Quest Master
const BADGES = [
  {
    id: 1,
    name: 'Tree Planter',
    tier: 'Bronze',
    icon: '🌱',
    type: 'tree_planter',
    description: 'Plant 10 trees',
    requirement: '10 trees planted',
    earned: true,
    minted: true,
    supply: '500/1000'
  },
  {
    id: 2,
    name: 'Carbon Warrior',
    tier: 'Silver',
    icon: '☁️',
    type: 'carbon_warrior',
    description: 'Offset 10 tonnes CO₂',
    requirement: '10 tonnes CO₂',
    earned: true,
    minted: false,
    supply: '250/500'
  },
  {
    id: 3,
    name: 'Crypto Donor',
    tier: 'Gold',
    icon: '💎',
    type: 'crypto_donor',
    description: 'Donate $500 in crypto',
    requirement: '$500 crypto donated',
    earned: false,
    minted: false,
    supply: '100/200'
  },
  {
    id: 4,
    name: 'Community Leader',
    tier: 'Silver',
    icon: '👥',
    type: 'community_leader',
    description: 'Recruit 20 members',
    requirement: '20 referrals',
    earned: false,
    minted: false,
    supply: '200/500'
  },
  {
    id: 5,
    name: 'Forest Guardian',
    tier: 'Platinum',
    icon: '🌲',
    type: 'forest_guardian',
    description: 'Complete forest challenges',
    requirement: 'All forest quests',
    earned: false,
    minted: false,
    supply: '50/100'
  },
  {
    id: 6,
    name: 'Quest Master',
    tier: 'Gold',
    icon: '⭐',
    type: 'quest_master',
    description: 'Complete 25 quests',
    requirement: '25 quests completed',
    earned: true,
    minted: true,
    supply: '150/300'
  },
];

// User gamification data based on docs schema
const USER_STATS = {
  totalPoints: 6530,
  level: 12,
  experienceToNextLevel: 240,
  rankGlobal: 6,
  rankForest: 3,
  badgesEarned: 3,
  achievementsUnlocked: 2,
  referralsCount: 3,
  streakDays: 4,
  forest: 'Kakamega'
};

export function GamificationPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'leaderboard' | 'badges'>('achievements');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gamification</h1>
          <p className="text-gray-600 mt-1">Track your progress and compete with others</p>
        </div>
        {user && <GGCoinBalance userId={user.id} className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200" />}
      </div>

      {/* Level Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Crown className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Level {USER_STATS.level}</h2>
              <p className="text-green-100">Environmental Hero</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{USER_STATS.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-green-100">Total Points</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress to Level {USER_STATS.level + 1}</span>
            <span className="font-semibold">{Math.round((USER_STATS.experienceToNextLevel / 1000) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((USER_STATS.experienceToNextLevel / 1000) * 100)}%` }}
            />
          </div>
          <div className="text-sm text-green-100">
            {USER_STATS.experienceToNextLevel} points to next level
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{USER_STATS.streakDays}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {USER_STATS.streakDays >= 7 ? '🔥 On fire!' : `${7 - USER_STATS.streakDays} days to 2x bonus`}
          </div>
        </div>

        {/* Referrals Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{USER_STATS.referralsCount}</div>
              <div className="text-sm text-gray-600">Referrals</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {5 - USER_STATS.referralsCount} more for Silver Recruiter
          </div>
        </div>

        {/* Global Rank Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">#{USER_STATS.rankGlobal}</div>
              <div className="text-sm text-gray-600">Global Rank</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Top contributor this week
          </div>
        </div>

        {/* Forest Rank Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">#{USER_STATS.rankForest}</div>
              <div className="text-sm text-gray-600">{USER_STATS.forest} Rank</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Forest leader
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedTab('achievements')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              selectedTab === 'achievements'
                ? 'bg-green-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Target className="w-5 h-5" />
            Achievements
          </button>
          <button
            onClick={() => setSelectedTab('leaderboard')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              selectedTab === 'leaderboard'
                ? 'bg-green-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
          <button
            onClick={() => setSelectedTab('badges')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              selectedTab === 'badges'
                ? 'bg-green-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Award className="w-5 h-5" />
            Badges
          </button>
        </div>
      </div>

      {/* Content */}
      {selectedTab === 'achievements' && <AchievementsSection achievements={ACHIEVEMENTS} />}
      {selectedTab === 'leaderboard' && <LeaderboardSection leaderboard={LEADERBOARD} />}
      {selectedTab === 'badges' && <BadgesSection badges={BADGES} />}
    </div>
  );
}

// Achievements Section
function AchievementsSection({ achievements }: { achievements: typeof ACHIEVEMENTS }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`bg-white rounded-xl p-6 border-2 transition-all ${
            achievement.completed
              ? 'border-green-500 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
              {achievement.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-lg text-gray-900">{achievement.title}</h3>
                {achievement.completed && (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {achievement.progress}/{achievement.total}
                  </span>
                  <span className="font-semibold text-green-600">+{achievement.points} pts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${achievement.color} transition-all duration-500`}
                    style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Leaderboard Section
function LeaderboardSection({ leaderboard }: { leaderboard: typeof LEADERBOARD }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Top Contributors</h2>
        <p className="text-sm text-gray-600 mt-1">This week's environmental leaders</p>
      </div>

      <div className="divide-y divide-gray-100">
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
              entry.isUser ? 'bg-green-50 border-l-4 border-l-green-600' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  entry.rank === 1
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                    : entry.rank === 2
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                    : entry.rank === 3
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {entry.rank}
              </div>
              <div className="text-2xl">{entry.avatar}</div>
              <div>
                <div className="font-semibold text-gray-900">
                  {entry.name}
                  {entry.isUser && <span className="ml-2 text-xs text-green-600">(You)</span>}
                </div>
                <div className="text-sm text-gray-600">{entry.points.toLocaleString()} points</div>
              </div>
            </div>

            {entry.change !== 0 && (
              <div className={`flex items-center gap-1 ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 ${entry.change < 0 ? 'rotate-180' : ''}`} />
                <span className="text-sm font-semibold">{Math.abs(entry.change)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Badges Section
function BadgesSection({ badges }: { badges: typeof BADGES }) {
  const getTierColor = (tier: string) => {
    const colors = {
      Bronze: 'from-orange-700 to-orange-900',
      Silver: 'from-gray-300 to-gray-500',
      Gold: 'from-yellow-400 to-yellow-600',
      Platinum: 'from-blue-400 to-blue-600',
      Diamond: 'from-purple-400 to-purple-600',
    };
    return colors[tier as keyof typeof colors] || colors.Bronze;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`relative rounded-xl p-6 border-2 transition-all ${
            badge.earned
              ? 'bg-white border-gray-200 hover:shadow-lg'
              : 'bg-gray-50 border-gray-200 opacity-50'
          }`}
        >
          {badge.earned && badge.minted && (
            <div className="absolute top-2 right-2">
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
          )}
          {badge.earned && !badge.minted && (
            <div className="absolute top-2 right-2">
              <Medal className="w-5 h-5 text-blue-500" />
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getTierColor(badge.tier)} flex items-center justify-center text-4xl shadow-lg mb-3`}>
              {badge.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full mb-1 ${
              badge.tier === 'Diamond' ? 'bg-purple-100 text-purple-700' :
              badge.tier === 'Platinum' ? 'bg-blue-100 text-blue-700' :
              badge.tier === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
              badge.tier === 'Silver' ? 'bg-gray-100 text-gray-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {badge.tier}
            </span>
            <p className="text-xs text-gray-600 mb-1">{badge.description}</p>
            {badge.earned && (
              <div className="text-xs text-gray-500 mt-1">
                {badge.minted ? '✓ Minted as NFT' : 'Ready to mint'}
              </div>
            )}
            {badge.earned && (
              <div className="text-xs text-gray-500">Supply: {badge.supply}</div>
            )}
            {!badge.earned && (
              <div className="mt-2 text-xs text-gray-500">{badge.requirement}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
