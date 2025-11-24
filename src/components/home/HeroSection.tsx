import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown, TreePine, Leaf } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

interface HeroSectionProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
  onExploreBadges: () => void;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  icon: 'tree' | 'leaf';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  onGetStarted,
  onExploreBadges,
}) => {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles: FloatingParticle[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 6 + Math.random() * 4,
      icon: Math.random() > 0.5 ? 'tree' : 'leaf',
    }));
    setParticles(newParticles);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop"
          alt="African forest conservation"
          className="w-full h-full object-cover"
        />
        {/* Glassmorphism dark overlay with backdrop blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-green-900/50 to-black/60 backdrop-blur-sm"></div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {particle.icon === 'tree' ? (
              <TreePine size={24} className="text-green-400" />
            ) : (
              <Leaf size={20} className="text-emerald-400" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* #GangGreen Hashtag with Animated Gradient and Glow */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4"
        >
          <span className="text-gradient animate-pulse-glow inline-block">
            #GangGreen
          </span>
        </motion.h1>

        {/* Mission Headline - Track 3 Focus */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl"
        >
          Every Small Action Counts
        </motion.h2>

        {/* Subheadline - Hummingbird Story */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 max-w-4xl mx-auto drop-shadow-lg"
        >
          Join thousands making a difference through micro-actions and community engagement.
        </motion.p>

        {/* Hummingbird Story Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-10 max-w-3xl mx-auto"
        >
          <p className="text-base sm:text-lg text-white/80 italic drop-shadow-lg">
            "Like the hummingbird in Wangari Maathai's story, we do what we can to make a difference.
            Every action, no matter how small, contributes to the greater good."
          </p>
        </motion.div>

        {/* Call-to-Action Buttons with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          {!isAuthenticated && (
            <GlassButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={onGetStarted}
              className="min-w-[220px] text-white bg-green-500/30 border-green-400/50 hover:bg-green-500/40"
            >
              Start Your Journey
            </GlassButton>
          )}
          <GlassButton
            variant="ghost"
            size="lg"
            icon={Sparkles}
            iconPosition="left"
            onClick={onExploreBadges}
            className="min-w-[220px]"
          >
            Explore NFT Badges
          </GlassButton>
        </motion.div>
      </div>

      {/* Scroll Indicator with Animation - Positioned relative to section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
        onClick={scrollToContent}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-white/70 text-sm font-medium">Scroll to explore</span>
          <ChevronDown size={32} className="text-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
};
