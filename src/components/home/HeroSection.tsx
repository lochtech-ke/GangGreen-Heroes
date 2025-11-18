import React from 'react';

interface HeroSectionProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
  onExploreBadges: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  onGetStarted,
  onExploreBadges,
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"
          alt="African forest conservation"
          className="w-full h-full object-cover"
        />
        {/* Semi-transparent gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-emerald-800/60 to-green-900/70"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* #GangGreen Hashtag - Prominent branding */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-green-400 mb-4 drop-shadow-lg">
          #GangGreen
        </h1>

        {/* Mission Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-md">
          Catalyzing a Carbon-Negative Africa
        </h2>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-4xl mx-auto drop-shadow-md">
          Join the movement to restore Africa's forests. Plant trees, earn NFT badges,
          trade carbon credits, and make a real impact on climate change.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!isAuthenticated && (
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 min-w-[200px]"
            >
              Start Your Journey
            </button>
          )}
          <button
            onClick={onExploreBadges}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white text-lg font-semibold rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 min-w-[200px]"
          >
            Explore NFT Badges
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white/70"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
};
