import React, { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  points: number;
  treesPlanted: number;
  badgesEarned: number;
  level: number;
}

interface LeaderboardPreviewProps {
  topUsers?: LeaderboardEntry[];
  currentPeriod?: 'week' | 'month' | 'all-time';
  onViewFull?: () => void;
}

const LeaderboardEntryCard: React.FC<{
  entry: LeaderboardEntry;
  index: number;
}> = ({ entry, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade-in animation
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-br from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-br from-green-400 to-green-600';
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      } ${
        entry.rank <= 3
          ? 'bg-gradient-to-r from-white to-yellow-50 border-2 border-yellow-300 shadow-lg'
          : 'bg-white border border-gray-200 shadow-md'
      } hover:shadow-xl hover:scale-102`}
    >
      {/* Rank Badge */}
      <div
        className={`w-16 h-16 ${getRankColor(
          entry.rank
        )} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}
      >
        <span className="text-2xl">{getRankBadge(entry.rank)}</span>
      </div>

      {/* User Avatar */}
      <img
        src={entry.userAvatar}
        alt={entry.userName}
        className="w-14 h-14 rounded-full object-cover border-2 border-green-500 flex-shrink-0"
      />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 truncate">{entry.userName}</h3>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Lvl {entry.level}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            {entry.points.toLocaleString()} pts
          </span>
          <span className="flex items-center gap-1">
            <span className="text-green-500">🌳</span>
            {entry.treesPlanted}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-blue-500">🏆</span>
            {entry.badgesEarned}
          </span>
        </div>
      </div>

      {/* Rank Number */}
      <div className="text-3xl font-bold text-gray-300 flex-shrink-0">#{entry.rank}</div>
    </div>
  );
};

export const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({
  topUsers,
  currentPeriod = 'week',
  onViewFull,
}) => {
  // Default top users data
  const defaultTopUsers: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: '1',
      userName: 'Wanjiru Kamau',
      userAvatar: 'https://i.pravatar.cc/150?img=47',
      points: 15420,
      treesPlanted: 342,
      badgesEarned: 28,
      level: 15,
    },
    {
      rank: 2,
      userId: '2',
      userName: 'James Ochieng',
      userAvatar: 'https://i.pravatar.cc/150?img=13',
      points: 12850,
      treesPlanted: 287,
      badgesEarned: 24,
      level: 13,
    },
    {
      rank: 3,
      userId: '3',
      userName: 'Faith Njeri',
      userAvatar: 'https://i.pravatar.cc/150?img=32',
      points: 11230,
      treesPlanted: 251,
      badgesEarned: 22,
      level: 12,
    },
    {
      rank: 4,
      userId: '4',
      userName: 'Daniel Kipchoge',
      userAvatar: 'https://i.pravatar.cc/150?img=68',
      points: 9870,
      treesPlanted: 219,
      badgesEarned: 19,
      level: 11,
    },
    {
      rank: 5,
      userId: '5',
      userName: 'Grace Akinyi',
      userAvatar: 'https://i.pravatar.cc/150?img=44',
      points: 8540,
      treesPlanted: 189,
      badgesEarned: 17,
      level: 10,
    },
  ];

  const displayUsers = topUsers && topUsers.length > 0 ? topUsers : defaultTopUsers;

  const periodLabels = {
    week: 'This Week',
    month: 'This Month',
    'all-time': 'All Time',
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-4">
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-semibold text-gray-700">
              {periodLabels[currentPeriod]}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Top Heroes</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Celebrating our most dedicated conservation champions. Compete, climb the ranks, and
            make your mark on the leaderboard!
          </p>
        </div>

        {/* Leaderboard Entries */}
        <div className="space-y-4 mb-8">
          {displayUsers.slice(0, 5).map((entry, index) => (
            <LeaderboardEntryCard key={entry.userId} entry={entry} index={index} />
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onViewFull}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View Full Leaderboard →
          </button>
          <button
            onClick={() => (window.location.href = '/register')}
            className="px-8 py-4 bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Join the Competition
          </button>
        </div>

        {/* Motivational Message */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-xl shadow-lg p-6 max-w-2xl">
            <p className="text-gray-700 text-lg">
              <span className="font-bold text-green-600">Every action counts!</span> Plant trees,
              earn badges, and climb the leaderboard. Your impact matters.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
