import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

interface HeaderProps {
  isAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll to add glassmorphism effect when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Features', sectionId: 'features' },
    { label: 'Impact', sectionId: 'impact' },
    { label: 'Journey', sectionId: 'journey' },
    { label: 'Forests', sectionId: 'forests' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass backdrop-blur-md border-b border-white/20 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">#GG</span>
            </div>
            <span
              className={`text-xl font-bold transition-colors ${
                isScrolled ? 'text-green-700' : 'text-white'
              }`}
            >
              #GangGreen
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.sectionId}
                onClick={() => scrollToSection(link.sectionId)}
                className={`font-medium transition-colors hover:text-green-600 ${
                  isScrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex gap-3">
            {isAuthenticated ? (
              <GlassButton
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </GlassButton>
            ) : (
              <>
                <GlassButton
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/login')}
                  className={!isScrolled ? 'border-white/30 text-white' : ''}
                >
                  Sign In
                </GlassButton>
                <GlassButton
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </GlassButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-md transition-colors ${
              isScrolled
                ? 'text-gray-700 hover:bg-white/50'
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 glass backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.sectionId}
                  onClick={() => scrollToSection(link.sectionId)}
                  className="text-left text-gray-700 hover:text-green-600 font-medium transition-colors px-2"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
                {isAuthenticated ? (
                  <GlassButton
                    variant="primary"
                    size="md"
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Dashboard
                  </GlassButton>
                ) : (
                  <>
                    <GlassButton
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Sign In
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      size="md"
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Get Started
                    </GlassButton>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
