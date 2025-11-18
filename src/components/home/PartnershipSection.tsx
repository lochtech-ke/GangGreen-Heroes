import React, { useState } from 'react';

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  description?: string;
  websiteUrl?: string;
}

interface PartnershipSectionProps {
  partners?: Partner[];
}

const PartnerCard: React.FC<{ partner: Partner }> = ({ partner }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => {
        setIsHovered(true);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
    >
      <a
        href={partner.websiteUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-xl"
      >
        <div className="flex items-center justify-center h-24">
          {partner.logoUrl ? (
            <img
              src={partner.logoUrl}
              alt={partner.name}
              className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                isHovered ? 'grayscale-0' : 'grayscale'
              }`}
              style={{ filter: isHovered ? 'none' : 'grayscale(100%)' }}
            />
          ) : (
            <div className="text-4xl font-bold text-gray-400">{partner.name}</div>
          )}
        </div>
      </a>

      {/* Tooltip */}
      {showTooltip && partner.description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-10">
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-3 h-3 bg-gray-900 rotate-45"></div>
          <p>{partner.description}</p>
        </div>
      )}
    </div>
  );
};

export const PartnershipSection: React.FC<PartnershipSectionProps> = ({ partners }) => {
  // Default partners
  const defaultPartners: Partner[] = [
    {
      id: 'gbm',
      name: 'Green Belt Movement',
      logoUrl: '',
      description:
        'Founded by Nobel Peace Prize laureate Wangari Maathai, leading grassroots environmental conservation in Kenya.',
      websiteUrl: 'https://www.greenbeltmovement.org/',
    },
    {
      id: 'gsma',
      name: 'GSMA',
      logoUrl: '',
      description:
        'Global mobile industry organization supporting sustainable development through mobile technology.',
      websiteUrl: 'https://www.gsma.com/',
    },
    {
      id: 'antugrow',
      name: 'Antugrow',
      logoUrl: '',
      description:
        'AI-powered platform for tree monitoring, growth tracking, and health analysis.',
      websiteUrl: 'https://antugrow.com/',
    },
    {
      id: 'wangari-maathai',
      name: 'Wangari Maathai Hackathon',
      logoUrl: '',
      description:
        'Innovation challenge focused on environmental conservation and community engagement in Africa.',
      websiteUrl: '#',
    },
  ];

  const displayPartners = partners && partners.length > 0 ? partners : defaultPartners;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted Partners & Recognition
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Working with leading organizations to drive environmental conservation across Africa.
          </p>
        </div>

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {displayPartners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>

        {/* Recognition & Awards */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Built for Impact
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Developed for Track 3 (Community Engagement and Sustainability) of the Wangari
              Maathai Hackathon, honoring the legacy of Kenya's environmental champion.
            </p>
          </div>

          {/* Key Achievements */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-md">
              <div className="text-4xl mb-3">🌍</div>
              <h4 className="font-bold text-gray-900 mb-2">Environmental Focus</h4>
              <p className="text-sm text-gray-600">
                Dedicated to catalyzing a carbon-negative Africa through technology
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-md">
              <div className="text-4xl mb-3">🤝</div>
              <h4 className="font-bold text-gray-900 mb-2">Community-Driven</h4>
              <p className="text-sm text-gray-600">
                Empowering local communities to take ownership of conservation efforts
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-md">
              <div className="text-4xl mb-3">🔬</div>
              <h4 className="font-bold text-gray-900 mb-2">Innovation-Powered</h4>
              <p className="text-sm text-gray-600">
                Leveraging AI, blockchain, and gamification for measurable impact
              </p>
            </div>
          </div>

          {/* Wangari Maathai Quote */}
          <div className="mt-8 bg-white rounded-xl p-6 border-l-4 border-green-600">
            <p className="text-gray-700 italic text-lg mb-3">
              "Until you dig a hole, you plant a tree, you water it and make it survive, you
              haven't done a thing. You are just talking."
            </p>
            <p className="text-gray-600 font-semibold">
              — Prof. Wangari Maathai, Nobel Peace Prize Laureate
            </p>
          </div>
        </div>

        {/* Powered By */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">Powered by</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-gray-400 font-semibold">Supabase</div>
            <div className="text-gray-400 font-semibold">React</div>
            <div className="text-gray-400 font-semibold">Leaflet</div>
            <div className="text-gray-400 font-semibold">Ethereum</div>
            <div className="text-gray-400 font-semibold">Polygon</div>
          </div>
        </div>
      </div>
    </section>
  );
};
