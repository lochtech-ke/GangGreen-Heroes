import { useState } from 'react';
import {
  MessageSquare,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Pin,
  Lock,
  CheckCircle,
  Plus,
  Search,
  Users,
  Flame
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Mock data - replace with actual API calls
const CATEGORIES = [
  {
    id: 1,
    name: 'General Discussion',
    description: 'General conversations about conservation and the environment',
    icon: '💬',
    topics: 145,
    posts: 892,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'Tree Planting',
    description: 'Share your tree planting experiences and tips',
    icon: '🌳',
    topics: 98,
    posts: 654,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    name: 'Forest Updates',
    description: 'Latest updates from Kakamega, Karura, and Mau forests',
    icon: '🌲',
    topics: 67,
    posts: 421,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 4,
    name: 'Impact Stories',
    description: 'Share your environmental impact stories and achievements',
    icon: '⭐',
    topics: 124,
    posts: 789,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 5,
    name: 'Q&A',
    description: 'Ask questions and get answers from the community',
    icon: '❓',
    topics: 213,
    posts: 1247,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 6,
    name: 'Suggestions',
    description: 'Suggest new features and improvements for the platform',
    icon: '💡',
    topics: 56,
    posts: 342,
    color: 'from-orange-500 to-orange-600'
  }
];

const TRENDING_TOPICS = [
  {
    id: 1,
    title: 'How to organize a successful tree planting event in your community',
    category: 'Tree Planting',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop',
    author: {
      name: 'Sarah Johnson',
      avatar: '👩',
      role: 'Forest Guardian'
    },
    isPinned: true,
    isLocked: false,
    isSolved: false,
    replies: 24,
    views: 1542,
    likes: 89,
    lastActivity: '2 hours ago',
    tags: ['guide', 'community', 'events']
  },
  {
    id: 2,
    title: 'Kakamega Forest restoration project - 1000 trees planted!',
    category: 'Forest Updates',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=400&fit=crop',
    author: {
      name: 'Michael Omondi',
      avatar: '👨',
      role: 'Community Leader'
    },
    isPinned: true,
    isLocked: false,
    isSolved: false,
    replies: 56,
    views: 3421,
    likes: 234,
    lastActivity: '1 hour ago',
    tags: ['kakamega', 'milestone', 'celebration']
  },
  {
    id: 3,
    title: 'Best native tree species for reforestation in Kenya',
    category: 'Q&A',
    image: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=800&h=400&fit=crop',
    author: {
      name: 'Dr. Jane Wambui',
      avatar: '👩‍🔬',
      role: 'Expert'
    },
    isPinned: false,
    isLocked: false,
    isSolved: true,
    replies: 18,
    views: 892,
    likes: 67,
    lastActivity: '3 hours ago',
    tags: ['species', 'native', 'advice']
  },
  {
    id: 4,
    title: 'My 6-month journey: From 0 to 100 trees planted',
    category: 'Impact Stories',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=400&fit=crop',
    author: {
      name: 'Peter Kamau',
      avatar: '🧑',
      role: 'Tree Planter'
    },
    isPinned: false,
    isLocked: false,
    isSolved: false,
    replies: 42,
    views: 2156,
    likes: 156,
    lastActivity: '5 hours ago',
    tags: ['story', 'inspiration', 'milestone']
  },
  {
    id: 5,
    title: 'Feature request: Mobile app for tree tracking',
    category: 'Suggestions',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
    author: {
      name: 'Grace Njeri',
      avatar: '👩‍💼',
      role: 'Member'
    },
    isPinned: false,
    isLocked: false,
    isSolved: false,
    replies: 31,
    views: 1234,
    likes: 98,
    lastActivity: '8 hours ago',
    tags: ['feature', 'mobile', 'tracking']
  }
];

export function ForumPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [view, setView] = useState<'categories' | 'topics'>('topics');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-1">Connect, share, and learn with fellow environmental champions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Discussion</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">703</div>
              <div className="text-sm text-gray-600">Total Topics</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Across all categories</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">4.3K</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Community discussions</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">1.2K</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">This month</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">89</div>
              <div className="text-sm text-gray-600">Hot Topics</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Trending now</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('topics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'topics'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Topics
            </button>
            <button
              onClick={() => setView('categories')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'categories'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Categories
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {view === 'categories' ? (
        <CategoriesView categories={CATEGORIES} />
      ) : (
        <TopicsView topics={TRENDING_TOPICS} />
      )}
    </div>
  );
}

// Categories View Component
function CategoriesView({ categories }: { categories: typeof CATEGORIES }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {category.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{category.topics} topics</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{category.posts} posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Topics View Component
function TopicsView({ topics }: { topics: typeof TRENDING_TOPICS }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex gap-4">
              {/* Author Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl shadow-sm">
                  {topic.author.avatar}
                </div>
              </div>

              {/* Topic Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {topic.isPinned && (
                      <Pin className="w-4 h-4 text-green-600 fill-green-600" />
                    )}
                    {topic.isLocked && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                    {topic.isSolved && (
                      <CheckCircle className="w-4 h-4 text-green-600 fill-green-600" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors flex-1">
                    {topic.title}
                  </h3>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <span className="font-medium">{topic.author.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {topic.category}
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{topic.lastActivity}</span>
                  </div>
                </div>

                {/* Featured Image */}
                {topic.image && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img
                      src={topic.image}
                      alt={topic.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {topic.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5 hover:text-green-600 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">{topic.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-medium">{topic.replies} replies</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">{topic.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <button className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Load More Topics
        </button>
      </div>
    </div>
  );
}
