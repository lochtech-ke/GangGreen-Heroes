import { useEffect } from 'react';
import type { SocialPost } from '../../types/socialFeed.types';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Instagram,
  Twitter,
  Facebook,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';

interface PostDetailModalProps {
  post: SocialPost | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onSave?: (postId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  isSaved = false,
  onSave,
}) => {
  const [copied, setCopied] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const getPlatformIcon = () => {
    switch (post.platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getPlatformName = () => {
    switch (post.platform) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      default:
        return 'Social Media';
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(post.postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const text = `Check out this post from #GangGreen: ${post.caption?.substring(0, 100)}...`;
    const url = post.postUrl;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSaveClick = () => {
    if (onSave) {
      onSave(post.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Image Section */}
        <div className="md:w-3/5 bg-black flex items-center justify-center">
          {post.media.type === 'video' ? (
            <video
              src={post.media.url}
              controls
              className="w-full h-full object-contain"
              autoPlay
              loop
            />
          ) : (
            <img
              src={post.media.url}
              alt={post.caption || 'Social media post'}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800?text=Image+Not+Available';
              }}
            />
          )}
        </div>

        {/* Details Section */}
        <div className="md:w-2/5 flex flex-col max-h-[90vh] md:max-h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={post.author.avatarUrl || 'https://via.placeholder.com/48'}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48?text=User';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{post.author.name}</p>
                <p className="text-sm text-gray-500 truncate">@{post.author.username}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                {getPlatformIcon()}
              </div>
            </div>

            {/* Location Tag */}
            {post.locationTag && (
              <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{post.locationTag}</span>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="flex-1 overflow-y-auto p-6">
            {post.caption && (
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
            )}
            {!post.caption && (
              <p className="text-gray-400 italic">No caption provided</p>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="p-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                  <Heart className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(post.engagement.likes)}</p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(post.engagement.comments)}</p>
                <p className="text-xs text-gray-500">Comments</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                  <Share2 className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(post.engagement.shares)}</p>
                <p className="text-xs text-gray-500">Shares</p>
              </div>
            </div>

            {/* Posted Date */}
            <p className="text-sm text-gray-500 text-center mb-4">
              Posted on {new Date(post.postedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* View on Platform */}
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <ExternalLink className="w-5 h-5" />
                View on {getPlatformName()}
              </a>

              {/* Save Button */}
              {onSave && (
                <button
                  onClick={handleSaveClick}
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-colors font-medium ${
                    isSaved
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-5 h-5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-5 h-5" />
                      Save Post
                    </>
                  )}
                </button>
              )}

              {/* Share Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  title="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
