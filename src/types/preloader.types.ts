/**
 * Preloader Type Definitions
 * Types for the Pixi.js-powered animated preloader component
 */

import type { Container } from 'pixi.js';

/**
 * Props for the PixiPreloader component
 */
export interface PixiPreloaderProps {
  /** Minimum time to display the preloader in milliseconds (default: 3000) */
  minDisplayDuration?: number;
  
  /** Duration of the fade-out animation in milliseconds (default: 500) */
  fadeOutDuration?: number;
  
  /** Whether to automatically hide the preloader when the app is ready (default: true) */
  autoHide?: boolean;
  
  /** Callback function executed when the animation completes */
  onComplete?: () => void;
  
  /** Whether to allow users to skip the preloader after minimum duration (default: false) */
  allowSkip?: boolean;
}

/**
 * Internal state for the PixiPreloader component
 */
export interface PreloaderState {
  /** Whether the preloader is currently visible */
  isVisible: boolean;
  
  /** Whether the Pixi.js animation has completed playing */
  isAnimationComplete: boolean;
  
  /** Whether the application is ready to be displayed */
  isAppReady: boolean;
  
  /** Whether the user can skip the preloader */
  canSkip: boolean;
}

/**
 * Scene configuration for Pixi.js animations
 */
export interface SceneConfig {
  /** Duration of the scene in milliseconds */
  duration: number;
  
  /** Start time of the scene in milliseconds */
  startTime: number;
  
  /** End time of the scene in milliseconds */
  endTime: number;
  
  /** Setup function to initialize scene elements */
  setup: (container: Container) => void;
  
  /** Animation function called on each frame with progress (0-1) */
  animate: (container: Container, progress: number) => void;
  
  /** Cleanup function to remove scene elements */
  cleanup: (container: Container) => void;
}

/**
 * Animation timeline configuration
 */
export interface AnimationTimeline {
  /** Array of scene configurations */
  scenes: SceneConfig[];
  
  /** Index of the currently active scene */
  currentScene: number;
  
  /** Timestamp when the animation started */
  startTime: number;
  
  /** Total duration of all scenes in milliseconds */
  totalDuration: number;
}

/**
 * Configuration object for the preloader
 */
export interface PreloaderConfig {
  /** Minimum display duration in milliseconds */
  minDisplayDuration: number;
  
  /** Fade-out duration in milliseconds */
  fadeOutDuration: number;
  
  /** Auto-hide when app is ready */
  autoHide: boolean;
  
  /** Allow skip functionality */
  allowSkip: boolean;
  
  /** Background color for Pixi.js canvas (hex number) */
  backgroundColor: number;
  
  /** Enable antialiasing for smoother graphics */
  antialias: boolean;
}

/**
 * Default configuration values
 */
export const DEFAULT_PRELOADER_CONFIG: PreloaderConfig = {
  minDisplayDuration: 3000,
  fadeOutDuration: 500,
  autoHide: true,
  allowSkip: false,
  backgroundColor: 0xFFFFFF,
  antialias: true,
};
