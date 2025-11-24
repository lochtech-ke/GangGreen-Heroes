import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TreePine,
  Leaf,
  ShoppingBag,
  Trophy,
  HelpCircle,
  Mail,
  MessageCircle,
  Shield,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Heart,
  ExternalLink,
} from 'lucide-react';

export const HomeFooter: React.FC = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Initiatives', path: '/initiatives', icon: TreePine },
    { label: 'Tree Registry', path: '/trees', icon: Leaf },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { label: 'Rewards', path: '/gamification', icon: Trophy },
  ];

  const supportLinks = [
    { label: 'Help Center', path: '/help', icon: HelpCircle },
    { label: 'Contact Us', path: '/contact', icon: Mail },
    { label: 'FAQs', path: '/faqs', icon: MessageCircle },
    { label: 'Privacy Policy', path: '/legal/privacy-policy', icon: Shield },
  ];

  const socialLinks = [
    {
      label: 'Twitter',
      url: 'https://twitter.com/ganggreen',
      icon: Twitter,
    },
    {
      label: 'Facebook',
      url: 'https://facebook.com/ganggreen',
      icon: Facebook,
    },
    {
      label: 'Instagram',
      url: 'https://instagram.com/ganggreen',
      icon: Instagram,
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/company/ganggreen',
      icon: Linkedin,
    },
  ];

  return (
    <footer className="bg-gray-900 text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">#GG</span>
              </div>
              <h2 className="text-2xl font-bold text-gradient">#GangGreen</h2>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Catalyzing a carbon-negative Africa through technology, community engagement, and
              sustainable conservation.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Heart size={16} className="text-red-400" />
              <span>Built for Track 3: Community Engagement and Sustainability</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors group"
                    >
                      <Icon size={16} className="group-hover:scale-110 transition-transform" />
                      {link.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors group"
                    >
                      <Icon size={16} className="group-hover:scale-110 transition-transform" />
                      {link.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center text-green-400">
            Connect With Us
          </h3>
          <div className="flex justify-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-3 rounded-full hover:bg-green-500/20 hover:scale-110 transition-all group"
                  aria-label={social.label}
                >
                  <Icon size={20} className="text-gray-300 group-hover:text-green-400" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Partners & Recognition */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">In Partnership With</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                Green Belt Movement
                <ExternalLink size={12} />
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                GSMA
                <ExternalLink size={12} />
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Antugrow
                <ExternalLink size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-400 text-sm mb-2">
            © 2025 Loch Tech Solutions. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <TreePine size={16} className="text-green-500" />
            Honoring the legacy of Prof. Wangari Maathai - Nobel Peace Prize Laureate
          </p>
          <p className="text-gray-600 text-xs mt-4">
            Wangari Maathai Hackathon 2025 - Track 3 Submission
          </p>
        </div>
      </div>
    </footer>
  );
};
