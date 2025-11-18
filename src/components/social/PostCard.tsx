import { useState, useRef, useEffect } from 'react';
import type { SocialPost } from '../../types/socialFeed.types';
import { Heart, MessageCircle, Share2, Bookmark, BookmarkCheck, Instagram, Twitter, Facebook } from 'lucide-react';

interface PostCardProps {
  post: SocialPost;
  onClick: (post: SocialPost) => void;
  onSave?: (postId: string) => void;
  isSaved?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, onSave, isSaved = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showHover, setShowHover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(post.id);
    }
  };

  const getPlatformIcon = () => {
    switch (post.platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPlatformColor = () => {
    switch (post.platform) {
      case 'instagram':
        return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'twitter':
        return 'bg-blue-400';
      case 'facebook':
        return 'bg-blue-600';
      default:
        return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const truncateCaption = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group relative"
      onClick={() => onClick(post)}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
    >
      {/* Platform Badge */}
      <div className={`absolute top-3 left-3 z-10 ${getPlatformColor()} text-white p-2 rounded-full shadow-lg`}>
        {getPlatformIcon()}
      </div>

      {/* Save Button */}
      {onSave && (
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label={isSaved ? 'Unsave post' : 'Save post'}
        >
          {isSaved ? (
            <BookmarkCheck className="w-5 h-5 text-green-600" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-600" />
          )}
        </button>
      )}

      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full" />
          </div>
        )}
        
        {isVisible && (
          <img
            ref={imgRef}
            src={post.media.thumbnailUrl || post.media.url}
            alt={post.caption || 'Social media post'}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${showHover ? 'scale-105' : 'scale-100'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Not+Available';
              setImageLoaded(true);
            }}
            loading="lazy"
          />
        )}

        {/* Video Indicator */}
        {post.media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-white/90 rounded-full p-3">
              <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        {showHover && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300">
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              View Details
            </button>
          </div>
        )}
      </div>

      {/* Post Info */}
      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={post.author.avatarUrl || 'https://via.placeholder.com/40'}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/40?text=User';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{post.author.name}</p>
            <p className="text-sm text-gray-500 truncate">@{post.author.username}</p>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {truncateCaption(post.caption)}
          </p>
        )}

        {/* Location Tag */}
        {post.locationTag && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{post.locationTag}</span>
          </div>
        )}

        {/* Engagement Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Likes */}
            <div className="flex items-center gap-1 text-gray-600">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(post.engagement.likes)}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(post.engagement.comments)}</span>
            </div>

            {/* Shares */}
            <div className="flex items-center gap-1 text-gray-600">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">{formatNumber(post.engagement.shares)}</span>
            </div>
          </div>

          {/* Posted Time */}
          <div className="text-xs text-gray-400">
            {new Date(post.postedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
