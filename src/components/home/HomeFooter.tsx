import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeFooter: React.FC = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Initiatives', path: '/initiatives' },
    { label: 'Trees', path: '/trees' },
    { label: 'Marketplace', path: '/marketplace' },
  ];

  const supportLinks = [
    { label: 'Help Center', path: '/help' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'FAQs', path: '/faqs' },
    { label: 'Privacy Policy', path: '/privacy' },
  ];

  const socialLinks = [
    { label: 'Twitter', url: 'https://twitter.com/ganggreen', icon: '𝕏' },
    { label: 'Facebook', url: 'https://facebook.com/ganggreen', icon: '📘' },
    { label: 'Instagram', url: 'https://instagram.com/ganggreen', icon: '📷' },
    { label: 'LinkedIn', url: 'https://linkedin.com/company/ganggreen', icon: '💼' },
  ];

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🌳</span>
              <h2 className="text-2xl font-bold text-green-400">#GangGreen</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Catalyzing a carbon-negative Africa through technology, community engagement, and
              sustainable conservation.
            </p>
            <p className="text-sm text-gray-500">
              Built for the Wangari Maathai Hackathon - Track 3: Community Engagement and
              Sustainability
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Connect With Us</h3>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-green-400 transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p className="mb-2">
            © 2025 Loch Tech Solutions. All rights reserved.
          </p>
          <p>
            Honoring the legacy of Prof. Wangari Maathai - Nobel Peace Prize Laureate
          </p>
        </div>
      </div>
    </footer>
  );
};
