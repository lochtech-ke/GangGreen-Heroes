/**
 * PixiPreloader Component
 * 
 * Main preloader component that displays a Pixi.js-powered animation
 * while the application loads.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Application, Container } from 'pixi.js';
import { FallbackLoader } from './FallbackLoader';
import { useAppReady } from '../../hooks/useAppReady';
import { TimelineController } from './preloader/AnimationTimeline';
import { createScene1 } from './preloader/Scene1';
import { createScene2 } from './preloader/Scene2';
import { createScene3 } from './preloader/Scene3';
import { detectUserLocation } from '../../services/geolocation.service';
import { getFlagColors } from './preloader/flagColors';
import type { PixiPreloaderProps, FlagColors } from '../../types';
import { DEFAULT_PRELOADER_CONFIG } from '../../types';

export const PixiPreloader: React.FC<PixiPreloaderProps> = ({
  minDisplayDuration = DEFAULT_PRELOADER_CONFIG.minDisplayDuration,
  fadeOutDuration = DEFAULT_PRELOADER_CONFIG.fadeOutDuration,
  autoHide = DEFAULT_PRELOADER_CONFIG.autoHide,
  onComplete,
  allowSkip = DEFAULT_PRELOADER_CONFIG.allowSkip,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const timelineRef = useRef<TimelineController | null>(null);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [canSkipNow, setCanSkipNow] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [flagColors, setFlagColors] = useState<FlagColors | undefined>(undefined);
  
  const isAppReady = useAppReady();

  // Detect user location and get flag colors
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const location = await detectUserLocation();
        const colors = getFlagColors(location.countryCode);
        setFlagColors(colors);
        console.log(`Using flag colors for: ${location.country} (${location.countryCode})`);
      } catch (error) {
        console.warn('Failed to detect location, using default (Kenya):', error);
        // Default to Kenya colors
        setFlagColors(getFlagColors('KE'));
      }
    };

    detectLocation();
  }, []);

  // Initialize Pixi.js application
  useEffect(() => {
    if (!canvasContainerRef.current || hasError) return;

    let app: Application | null = null;
    let timeline: TimelineController | null = null;
    let mounted = true;
    let resizeHandler: (() => void) | null = null;

    const initPixi = async () => {
      try {
        // Create Pixi application
        app = new Application();
        
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: DEFAULT_PRELOADER_CONFIG.backgroundColor,
          antialias: DEFAULT_PRELOADER_CONFIG.antialias,
          resizeTo: window,
        });

        // Check if component is still mounted
        if (!mounted || !canvasContainerRef.current) {
          app.destroy(true);
          return;
        }

        // Append canvas to container
        if (app.canvas) {
          canvasContainerRef.current.appendChild(app.canvas);
        }

        appRef.current = app;

        // Create main container for scenes
        const mainContainer = new Container();
        mainContainer.width = app.screen.width;
        mainContainer.height = app.screen.height;
        app.stage.addChild(mainContainer);

        // Create scenes
        const scenes = [
          createScene1(),
          createScene2(),
          createScene3(),
        ];

        // Create and start timeline with flag colors
        timeline = new TimelineController(
          scenes,
          mainContainer,
          app.ticker,
          () => {
            if (mounted) {
              setIsAnimationComplete(true);
            }
          },
          flagColors
        );

        timelineRef.current = timeline;
        timeline.start();

        // Handle window resize
        resizeHandler = () => {
          if (app && mainContainer) {
            mainContainer.width = app.screen.width;
            mainContainer.height = app.screen.height;
          }
        };

        window.addEventListener('resize', resizeHandler);
      } catch (error) {
        console.error('Failed to initialize Pixi.js:', error);
        if (mounted) {
          setHasError(true);
        }
      }
    };

    // Only initialize Pixi after flag colors are loaded
    if (flagColors) {
      initPixi();
    }

    // Cleanup
    return () => {
      mounted = false;
      
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      
      if (timeline) {
        timeline.stop();
        timelineRef.current = null;
      }
      
      if (app && app.renderer) {
        try {
          app.destroy(true, { children: true, texture: true, textureSource: true });
        } catch (e) {
          // Ignore cleanup errors
          console.warn('Error during Pixi cleanup:', e);
        }
        appRef.current = null;
      }
    };
  }, [hasError, flagColors]);

  // Handle minimum display duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSkipNow(true);
    }, minDisplayDuration);

    return () => clearTimeout(timer);
  }, [minDisplayDuration]);

  // Handle fade out when conditions are met
  useEffect(() => {
    if (!autoHide) return;

    const shouldFadeOut = isAnimationComplete && isAppReady && canSkipNow;

    if (shouldFadeOut && !isFadingOut) {
      setIsFadingOut(true);

      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, fadeOutDuration);

      return () => clearTimeout(fadeTimer);
    }
  }, [isAnimationComplete, isAppReady, canSkipNow, autoHide, isFadingOut, fadeOutDuration, onComplete]);

  // Handle skip button
  const handleSkip = () => {
    if (!canSkipNow || isFadingOut) return;

    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, fadeOutDuration);
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Show fallback if there's an error
  if (hasError) {
    return <FallbackLoader />;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-green-50 to-green-100 transition-opacity duration-${fadeOutDuration}`}
      style={{
        opacity: isFadingOut ? 0 : 1,
        transitionDuration: `${fadeOutDuration}ms`,
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      {/* Pixi.js canvas container */}
      <div ref={canvasContainerRef} className="w-full h-full" />

      {/* Skip button */}
      {allowSkip && canSkipNow && !isFadingOut && (
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 px-6 py-3 bg-white/80 hover:bg-white text-green-700 font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Skip loading animation"
        >
          Skip
        </button>
      )}
    </div>
  );
};
