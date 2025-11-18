import React, { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  quote: string;
  treesPlanted: number;
  badgesEarned: number;
  location: string;
}

interface RecentAchievement {
  id: string;
  userName: string;
  badgeName: string;
  badgeImage: string;
  timestamp: Date;
}

interface SocialProofProps {
  testimonials?: Testimonial[];
  recentAchievements?: RecentAchievement[];
  userPhotos?: string[];
}

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 h-full">
      {/* Quote */}
      <div className="mb-6">
        <svg
          className="w-10 h-10 text-green-500 mb-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-gray-700 text-lg italic leading-relaxed">{testimonial.quote}</p>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4 border-t pt-6">
        <img
          src={testimonial.userAvatar}
          alt={testimonial.userName}
          className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
        />
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{testimonial.userName}</h4>
          <p className="text-sm text-gray-600">{testimonial.userRole}</p>
          <p className="text-xs text-gray-500">{testimonial.location}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mt-4">
        <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{testimonial.treesPlanted}</p>
          <p className="text-xs text-gray-600">Trees Planted</p>
        </div>
        <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{testimonial.badgesEarned}</p>
          <p className="text-xs text-gray-600">Badges Earned</p>
        </div>
      </div>
    </div>
  );
};

const AchievementItem: React.FC<{ achievement: RecentAchievement }> = ({ achievement }) => {
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors">
      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
        🏆
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {achievement.userName}
        </p>
        <p className="text-xs text-gray-600 truncate">earned {achievement.badgeName}</p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {timeAgo(achievement.timestamp)}
      </span>
    </div>
  );
};

export const SocialProofSection: React.FC<SocialProofProps> = ({
  testimonials,
  recentAchievements,
  userPhotos,
}) => {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Default testimonials
  const defaultTestimonials: Testimonial[] = [
    {
      id: '1',
      userName: 'Amina Wanjiku',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      userRole: 'Student',
      quote:
        'Joining #GangGreen changed my perspective on conservation. I\'ve planted 50 trees and earned 3 badges. It feels amazing to make a real difference!',
      treesPlanted: 50,
      badgesEarned: 3,
      location: 'Nairobi, Kenya',
    },
    {
      id: '2',
      userName: 'David Omondi',
      userAvatar: 'https://i.pravatar.cc/150?img=12',
      userRole: 'Community Member',
      quote:
        'The platform makes it easy to track my impact. I love seeing my trees grow through AI monitoring. My family is now involved too!',
      treesPlanted: 127,
      badgesEarned: 8,
      location: 'Kakamega, Kenya',
    },
    {
      id: '3',
      userName: 'Green Belt Initiative',
      userAvatar: 'https://i.pravatar.cc/150?img=20',
      userRole: 'Organization',
      quote:
        'We\'ve mobilized over 500 community members through #GangGreen. The gamification features keep everyone engaged and motivated.',
      treesPlanted: 2543,
      badgesEarned: 25,
      location: 'Mau Forest, Kenya',
    },
  ];

  // Default achievements
  const defaultAchievements: RecentAchievement[] = [
    {
      id: '1',
      userName: 'Sarah K.',
      badgeName: 'Forest Guardian',
      badgeImage: '',
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      userName: 'John M.',
      badgeName: 'Tree Planter',
      badgeImage: '',
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '3',
      userName: 'Grace N.',
      badgeName: 'Carbon Warrior',
      badgeImage: '',
      timestamp: new Date(Date.now() - 32 * 60000),
    },
    {
      id: '4',
      userName: 'Peter O.',
      badgeName: 'Eco Champion',
      badgeImage: '',
      timestamp: new Date(Date.now() - 48 * 60000),
    },
    {
      id: '5',
      userName: 'Mary W.',
      badgeName: 'Community Hero',
      badgeImage: '',
      timestamp: new Date(Date.now() - 67 * 60000),
    },
  ];

  // Default user photos
  const defaultPhotos = [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=300',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=300',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=300',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=300',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
  ];

  const displayTestimonials =
    testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;
  const displayAchievements =
    recentAchievements && recentAchievements.length > 0
      ? recentAchievements
      : defaultAchievements;
  const displayPhotos = userPhotos && userPhotos.length > 0 ? userPhotos : defaultPhotos;

  // Auto-rotate testimonials every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [displayTestimonials.length]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Community Impact Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real people making real change. Join thousands of conservation heroes across Kenya.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Testimonial Carousel */}
          <div className="relative">
            <TestimonialCard testimonial={displayTestimonials[currentTestimonialIndex]} />

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {displayTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonialIndex
                      ? 'bg-green-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Recent Achievements */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-3xl">🎉</span>
              Recent Achievements
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayAchievements.map((achievement) => (
                <AchievementItem key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        </div>

        {/* User Photo Gallery */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Our Community in Action
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayPhotos.slice(0, 12).map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={photo}
                  alt={`Community member ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
