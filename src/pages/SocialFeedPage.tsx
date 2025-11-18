import { useState } from 'react';
import { FeedGrid } from '../components/social/FeedGrid';
import { FeedFilters } from '../components/social/FeedFilters';
import { PostDetailModal } from '../components/social/PostDetailModal';
import { useSocialFeed } from '../hooks/useSocialFeed';
import { useSavedPosts } from '../hooks/useSavedPosts';
import type { SocialPost } from '../types/socialFeed.types';
import { supabase } from '../services/supabase';
import { RefreshCw } from 'lucide-react';

export const SocialFeedPage: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current user
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Initialize user session
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">#GangGreen Social Feed</h1>
              <p className="text-green-100 text-lg">
                See what the community is sharing about conservation efforts
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh feed"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-green-100 text-sm mb-1">Total Posts</p>
              <p className="text-3xl font-bold">{posts.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-green-100 text-sm mb-1">Platforms</p>
              <p className="text-3xl font-bold">3</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-green-100 text-sm mb-1">Saved Posts</p>
              <p className="text-3xl font-bold">{savedPostIds.size}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-green-100 text-sm mb-1">Total Engagement</p>
              <p className="text-3xl font-bold">
                {posts.reduce((sum, post) => sum + post.engagement.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <FeedFilters filters={filters} onFilterChange={setFilters} />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
      </div>

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
