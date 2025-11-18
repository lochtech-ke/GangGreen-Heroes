/**
 * Animation Timeline Controller
 * 
 * Manages the sequential playback of scenes with proper transitions
 * and cleanup between scenes.
 */

import { Container, Ticker } from 'pixi.js';
import type { SceneConfig, AnimationTimeline } from '../../../types';

/**
 * Creates and manages the animation timeline
 */
export class TimelineController {
  private timeline: AnimationTimeline;
  private container: Container;
  private ticker: Ticker;
  private onComplete?: () => void;
  private isPlaying: boolean = false;
  private currentSceneContainer: Container | null = null;

  constructor(
    scenes: SceneConfig[],
    container: Container,
    ticker: Ticker,
    onComplete?: () => void
  ) {
    // Calculate total duration and validate scenes
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

    this.timeline = {
      scenes,
      currentScene: -1,
      startTime: 0,
      totalDuration,
    };

    this.container = container;
    this.ticker = ticker;
    this.onComplete = onComplete;
  }

  /**
   * Starts the animation timeline
   */
  start(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.timeline.startTime = Date.now();
    this.timeline.currentScene = -1;

    // Add ticker callback
    this.ticker.add(this.update, this);
  }

  /**
   * Stops the animation timeline
   */
  stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.ticker.remove(this.update, this);

    // Cleanup current scene
    if (this.currentSceneContainer && this.timeline.currentScene >= 0) {
      const currentScene = this.timeline.scenes[this.timeline.currentScene];
      if (currentScene) {
        currentScene.cleanup(this.currentSceneContainer);
      }
    }
  }

  /**
   * Update function called on each frame
   */
  private update = (): void => {
    const elapsed = Date.now() - this.timeline.startTime;

    // Check if animation is complete
    if (elapsed >= this.timeline.totalDuration) {
      this.stop();
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    // Determine which scene should be playing
    const targetScene = this.getSceneAtTime(elapsed);

    // Handle scene transitions
    if (targetScene !== this.timeline.currentScene) {
      this.transitionToScene(targetScene);
    }

    // Animate current scene
    if (this.timeline.currentScene >= 0 && this.currentSceneContainer) {
      const currentScene = this.timeline.scenes[this.timeline.currentScene];
      if (currentScene) {
        const sceneElapsed = elapsed - currentScene.startTime;
        const progress = Math.min(1, sceneElapsed / currentScene.duration);
        currentScene.animate(this.currentSceneContainer, progress);
      }
    }
  };

  /**
   * Determines which scene should be playing at a given time
   */
  private getSceneAtTime(elapsed: number): number {
    for (let i = 0; i < this.timeline.scenes.length; i++) {
      const scene = this.timeline.scenes[i];
      if (elapsed >= scene.startTime && elapsed < scene.endTime) {
        return i;
      }
    }
    return this.timeline.scenes.length - 1;
  }

  /**
   * Transitions from current scene to target scene
   */
  private transitionToScene(targetScene: number): void {
    // Cleanup previous scene
    if (this.timeline.currentScene >= 0 && this.currentSceneContainer) {
      const previousScene = this.timeline.scenes[this.timeline.currentScene];
      if (previousScene) {
        previousScene.cleanup(this.currentSceneContainer);
      }
      this.container.removeChild(this.currentSceneContainer);
    }

    // Setup new scene
    this.timeline.currentScene = targetScene;
    this.currentSceneContainer = new Container();
    this.currentSceneContainer.width = this.container.width;
    this.currentSceneContainer.height = this.container.height;
    this.container.addChild(this.currentSceneContainer);

    const newScene = this.timeline.scenes[targetScene];
    if (newScene) {
      newScene.setup(this.currentSceneContainer);
    }
  }

  /**
   * Gets the current progress (0-1) of the entire timeline
   */
  getProgress(): number {
    if (!this.isPlaying) return 0;
    const elapsed = Date.now() - this.timeline.startTime;
    return Math.min(1, elapsed / this.timeline.totalDuration);
  }

  /**
   * Checks if the timeline is currently playing
   */
  isActive(): boolean {
    return this.isPlaying;
  }
}
