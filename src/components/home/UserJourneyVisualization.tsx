import React, { useState } from 'react';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  expandedDescription: string;
}

interface UserJourneyProps {
  steps?: JourneyStep[];
  onStepClick?: (stepId: string) => void;
}

const JourneyStepCard: React.FC<{
  step: JourneyStep;
  isLast: boolean;
  onClick?: () => void;
}> = ({ step, isLast, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      {/* Step Card */}
      <div
        className={`relative bg-white rounded-xl shadow-lg p-6 w-full max-w-[200px] cursor-pointer transition-all duration-300 border-2 border-green-200 hover:border-green-500 ${
          isHovered ? 'scale-105 shadow-2xl' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Step Number */}
        <div className="absolute -top-4 -left-4 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
          {step.order}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-4xl">
          {step.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{step.title}</h3>

        {/* Short Description */}
        <p className="text-sm text-gray-600 text-center">{step.description}</p>

        {/* Expanded Description on Hover */}
        {isHovered && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-64 bg-white rounded-lg shadow-2xl p-4 border-2 border-green-500 z-10">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-green-500 rotate-45"></div>
            <p className="text-sm text-gray-700">{step.expandedDescription}</p>
          </div>
        )}
      </div>

      {/* Connecting Line (Desktop) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 border-t-2 border-dashed border-green-400 transform -translate-y-1/2"></div>
      )}

      {/* Connecting Line (Mobile - Vertical) */}
      {!isLast && (
        <div className="lg:hidden w-0.5 h-12 border-l-2 border-dashed border-green-400 my-4"></div>
      )}
    </div>
  );
};

export const UserJourneyVisualization: React.FC<UserJourneyProps> = ({
  steps,
  onStepClick,
}) => {
  const defaultSteps: JourneyStep[] = [
    {
      id: 'discover',
      title: 'Discover',
      description: 'Find #GangGreen',
      icon: '🔍',
      order: 1,
      expandedDescription:
        'Learn about #GangGreen through social media, events, or word of mouth. Discover how you can make a real impact on climate change.',
    },
    {
      id: 'signup',
      title: 'Sign Up',
      description: 'Quick registration',
      icon: '✍️',
      order: 2,
      expandedDescription:
        'Create your account in seconds with email or social authentication. Join thousands of conservation heroes.',
    },
    {
      id: 'choose',
      title: 'Choose Causes',
      description: 'AI-guided selection',
      icon: '🤖',
      order: 3,
      expandedDescription:
        'Our AI chatbot helps you discover causes that match your interests and location. Get personalized recommendations for maximum impact.',
    },
    {
      id: 'action',
      title: 'Take Action',
      description: 'Plant & support',
      icon: '🌱',
      order: 4,
      expandedDescription:
        'Plant trees, join challenges, support initiatives, and participate in conservation activities across Kenya\'s forests.',
    },
    {
      id: 'rewards',
      title: 'Earn Rewards',
      description: 'Badges & coins',
      icon: '🏆',
      order: 5,
      expandedDescription:
        'Collect points, unlock achievements, earn GG Coins, and purchase exclusive NFT badges that showcase your environmental impact.',
    },
    {
      id: 'track',
      title: 'Track Impact',
      description: 'Monitor growth',
      icon: '📊',
      order: 6,
      expandedDescription:
        'Watch your trees grow with AI-powered monitoring. See real-time data on carbon sequestration and environmental impact.',
    },
    {
      id: 'legacy',
      title: 'Build Legacy',
      description: 'Inspire others',
      icon: '🌟',
      order: 7,
      expandedDescription:
        'Achieve hero status, climb the leaderboard, and inspire your community to join the movement for a carbon-negative Africa.',
    },
  ];

  const journeySteps = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Your Journey</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From discovery to legacy, we guide you every step of the way. Join thousands of
            conservation heroes making a real difference in Africa's forests.
          </p>
        </div>

        {/* Journey Steps - Desktop Horizontal */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-8 mb-12 relative">
          {journeySteps.map((step, index) => (
            <JourneyStepCard
              key={step.id}
              step={step}
              isLast={index === journeySteps.length - 1}
              onClick={() => onStepClick?.(step.id)}
            />
          ))}
        </div>

        {/* Journey Steps - Mobile/Tablet Vertical */}
        <div className="lg:hidden flex flex-col items-center gap-0 mb-12">
          {journeySteps.map((step, index) => (
            <JourneyStepCard
              key={step.id}
              step={step}
              isLast={index === journeySteps.length - 1}
              onClick={() => onStepClick?.(step.id)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => (window.location.href = '/register')}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Your Journey Today →
          </button>
        </div>
      </div>
    </section>
  );
};
