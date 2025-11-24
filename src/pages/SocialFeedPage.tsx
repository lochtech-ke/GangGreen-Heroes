import { useState } from 'react';
import { FeedGrid } from '../components/social/FeedGrid';
import { FeedFilters } from '../components/social/FeedFilters';
import { PostDetailModal } from '../components/social/PostDetailModal';
import { useSocialFeed } from '../hooks/useSocialFeed';
import { useSavedPosts } from '../hooks/useSavedPosts';
import type { SocialPost } from '../types/socialFeed.types';
import { useAuth } from '../hooks/useAuth';
import { RefreshCw, Hash, Heart, Share2, TrendingUp } from 'lucide-react';

export const SocialFeedPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use custom hooks
  const { posts, loading, error, hasMore, filters, setFilters, loadMore, refresh } = useSocialFeed();
  const { savedPostIds, savePost, unsavePost, isSaved } = useSavedPosts(user?.id || null);

  const handlePostClick = (post: SocialPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPost(null), 300);
  };

  const handleSaveToggle = async (postId: string) => {
    if (!user) {
      alert('Please sign in to save posts');
      return;
    }

    if (isSaved(postId)) {
      await unsavePost(postId);
    } else {
      await savePost(postId);
    }
  };

  // Calculate total engagement
  const totalEngagement = posts.reduce((sum, post) => sum + (post.engagement?.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">#GangGreen Community</h1>
          <p className="text-gray-600 mt-1">See what the community is sharing about conservation efforts</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="Refresh feed"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Posts Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Hash className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            From all platforms
          </div>
        </div>

        {/* Platforms Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Instagram, Twitter, Facebook
          </div>
        </div>

        {/* Saved Posts Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{savedPostIds.size}</div>
              <div className="text-sm text-gray-600">Saved Posts</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Your favorites
          </div>
        </div>

        {/* Total Engagement Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalEngagement.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Engagement</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Likes, comments & shares
          </div>
        </div>
      </div>

      {/* Filters */}
      <FeedFilters filters={filters} onFilterChange={setFilters} />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error loading posts</h3>
              <p className="text-red-700 text-sm">{error.message}</p>
              <button
                onClick={refresh}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed Grid */}
      <FeedGrid
        posts={posts}
        loading={loading}
        onPostClick={handlePostClick}
        onLoadMore={loadMore}
        hasMore={hasMore}
        savedPostIds={savedPostIds}
        onSavePost={handleSaveToggle}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isSaved={selectedPost ? isSaved(selectedPost.id) : false}
        onSave={handleSaveToggle}
      />
    </div>
  );
};
