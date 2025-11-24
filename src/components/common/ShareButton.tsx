import React, { useState } from 'react';
import { Share2, Check, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';

export interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShareFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const handleShareTwitter = () => {
    const text = description || title;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        setShowMenu(false);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
      >
        <Share2 size={18} />
        <span className="text-sm font-medium">Share</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Native share (mobile) */}
            {'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Share2 size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Share via...</span>
              </button>
            )}

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <Facebook size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Share on Facebook</span>
            </button>

            {/* Twitter */}
            <button
              onClick={handleShareTwitter}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <Twitter size={18} className="text-sky-500" />
              <span className="text-sm font-medium text-gray-700">Share on Twitter</span>
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-green-600">Link copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Copy link</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
