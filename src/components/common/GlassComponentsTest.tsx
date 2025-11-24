import React from 'react';
import { TreePine, Award, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassTooltip } from './GlassTooltip';
import { AnimatedSection } from './AnimatedSection';

/**
 * Test component to verify glassmorphism components and Lucide icons
 * This can be temporarily added to a page to test the design system
 */
export const GlassComponentsTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gradient mb-8">
          Glassmorphism Design System Test
        </h1>

        {/* Glass Card Variants */}
        <AnimatedSection>
          <h2 className="text-2xl font-bold mb-4">Glass Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard variant="default">
              <div className="flex items-center gap-3 mb-2">
                <TreePine size={24} className="text-green-600" />
                <h3 className="font-bold">Default Glass</h3>
              </div>
              <p className="text-gray-600">Semi-transparent with blur</p>
            </GlassCard>

            <GlassCard variant="green">
              <div className="flex items-center gap-3 mb-2">
                <Award size={24} className="text-green-600" />
                <h3 className="font-bold">Green Tinted</h3>
              </div>
              <p className="text-gray-600">Green accent glass</p>
            </GlassCard>

            <GlassCard variant="heavy">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles size={24} className="text-amber-500" />
                <h3 className="font-bold">Heavy Glass</h3>
              </div>
              <p className="text-gray-600">More opaque variant</p>
            </GlassCard>
          </div>
        </AnimatedSection>

        {/* Glass Buttons */}
        <AnimatedSection delay={0.1}>
          <h2 className="text-2xl font-bold mb-4">Glass Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <GlassButton variant="primary" icon={ArrowRight}>
              Primary Button
            </GlassButton>
            <GlassButton variant="secondary" icon={Sparkles} iconPosition="left">
              Secondary Button
            </GlassButton>
            <GlassButton variant="ghost" size="lg">
              Ghost Button
            </GlassButton>
            <GlassButton variant="primary" size="sm" icon={Award}>
              Small Button
            </GlassButton>
          </div>
        </AnimatedSection>

        {/* Tooltips */}
        <AnimatedSection delay={0.2}>
          <h2 className="text-2xl font-bold mb-4">Glass Tooltips</h2>
          <div className="flex gap-4">
            <GlassTooltip content="This is a tooltip!" position="top">
              <GlassButton variant="secondary">Hover for Top Tooltip</GlassButton>
            </GlassTooltip>
            <GlassTooltip content="Bottom tooltip" position="bottom">
              <GlassButton variant="secondary">Hover for Bottom Tooltip</GlassButton>
            </GlassTooltip>
          </div>
        </AnimatedSection>

        {/* Icon Showcase */}
        <AnimatedSection delay={0.3}>
          <h2 className="text-2xl font-bold mb-4">Lucide Icons</h2>
          <GlassCard>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
              <div className="flex flex-col items-center gap-2">
                <TreePine size={32} className="text-green-600 animate-float" />
                <span className="text-xs">TreePine</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Award size={32} className="text-amber-500 animate-pulse-glow" />
                <span className="text-xs">Award</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Sparkles size={32} className="text-purple-500" />
                <span className="text-xs">Sparkles</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ArrowRight size={32} className="text-blue-500" />
                <span className="text-xs">ArrowRight</span>
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Animations */}
        <AnimatedSection delay={0.4}>
          <h2 className="text-2xl font-bold mb-4">Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="animate-fade-in-up">
              <h3 className="font-bold mb-2">Fade In Up</h3>
              <p className="text-gray-600">Smooth entrance animation</p>
            </GlassCard>
            <GlassCard>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-green flex items-center justify-center">
                <TreePine size={32} className="text-green-600 animate-float" />
              </div>
              <h3 className="font-bold text-center">Float Animation</h3>
            </GlassCard>
            <GlassCard>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-green flex items-center justify-center animate-pulse-glow">
                <Award size={32} className="text-green-600" />
              </div>
              <h3 className="font-bold text-center">Pulse Glow</h3>
            </GlassCard>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};
