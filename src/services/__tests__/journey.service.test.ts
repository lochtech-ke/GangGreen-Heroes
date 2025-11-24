import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { journeyService } from '../journey.service';
import { supabase } from '../supabase';
import { JourneyStage } from '../../types/journey.types';

/**
 * Integration tests for Journey Service
 * Tests the journey service against the actual database
 * 
 * Prerequisites:
 * - Migration 025 must be deployed
 * - Supabase connection must be configured
 * - Test user must exist in database
 */

describe('Journey Service Integration Tests', () => {
  const TEST_USER_ID = '00000000-0000-0000-0000-000000000099';
  const TEST_USER_EMAIL = 'journey-test@example.com';

  beforeAll(async () => {
    // Create test user
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: TEST_USER_ID,
        email: TEST_USER_EMAIL,
        role: 'individual',
      });

    if (userError) {
      console.error('Failed to create test user:', userError);
    }

    // Clean up any existing journey data
    await supabase
      .from('user_journey_progress')
      .delete()
      .eq('user_id', TEST_USER_ID);
  });

  afterAll(async () => {
    // Clean up test data
    await supabase
      .from('user_journey_progress')
      .delete()
      .eq('user_id', TEST_USER_ID);

    await supabase
      .from('users')
      .delete()
      .eq('id', TEST_USER_ID);
  });

  describe('initializeJourney', () => {
    it('should create a new journey for a user', async () => {
      const result = await journeyService.initializeJourney(TEST_USER_ID);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(TEST_USER_ID);
      expect(result.data?.currentStage).toBe(JourneyStage.AWARENESS);
      expect(result.data?.totalPoints).toBe(0);
      expect(result.data?.treesPlanted).toBe(0);
      expect(result.data?.challengesCompleted).toBe(0);
      expect(result.data?.referralCount).toBe(0);
      expect(result.data?.completedMilestones).toEqual([]);
      expect(result.data?.joinedCauses).toEqual([]);
    });

    it('should return existing journey if already initialized', async () => {
      // Initialize twice
      await journeyService.initializeJourney(TEST_USER_ID);
      const result = await journeyService.initializeJourney(TEST_USER_ID);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(TEST_USER_ID);
    });
  });

  describe('getJourneyProgress', () => {
    it('should fetch journey progress for a user', async () => {
      const result = await journeyService.getJourneyProgress(TEST_USER_ID);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(TEST_USER_ID);
      expect(result.data?.currentStage).toBe(JourneyStage.AWARENESS);
    });

    it('should initialize journey if not found', async () => {
      // Delete journey first
      await supabase
        .from('user_journey_progress')
        .delete()
        .eq('user_id', TEST_USER_ID);

      const result = await journeyService.getJourneyProgress(TEST_USER_ID);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.currentStage).toBe(JourneyStage.AWARENESS);
    });
  });

  describe('trackAction', () => {
    beforeAll(async () => {
      // Ensure journey exists
      await journeyService.initializeJourney(TEST_USER_ID);
    });

    it('should track tree planting action', async () => {
      const result = await journeyService.trackAction(TEST_USER_ID, {
        type: 'tree_planted',
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.treesPlanted).toBeGreaterThan(0);
    });

    it('should track challenge completion action', async () => {
      const result = await journeyService.trackAction(TEST_USER_ID, {
        type: 'challenge_completed',
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.challengesCompleted).toBeGreaterThan(0);
    });

    it('should track cause joining action', async () => {
      const result = await journeyService.trackAction(TEST_USER_ID, {
        type: 'cause_joined',
        metadata: { causeId: 'kakamega-forest' },
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.joinedCauses).toContain('kakamega-forest');
    });

    it('should not add duplicate causes', async () => {
      // Join same cause twice
      await journeyService.trackAction(TEST_USER_ID, {
        type: 'cause_joined',
        metadata: { causeId: 'karura-forest' },
      });

      const result = await journeyService.trackAction(TEST_USER_ID, {
        type: 'cause_joined',
        metadata: { causeId: 'karura-forest' },
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      
      // Count occurrences of 'karura-forest'
      const count = result.data?.joinedCauses.filter(c => c === 'karura-forest').length;
      expect(count).toBe(1);
    });

    it('should track referral action', async () => {
      const result = await journeyService.trackAction(TEST_USER_ID, {
        type: 'referral_made',
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.referralCount).toBeGreaterThan(0);
    });
  });

  describe('updateStageProgress', () => {
    it('should update progress for a specific stage', async () => {
      const result = await journeyService.updateStageProgress(
        TEST_USER_ID,
        JourneyStage.AWARENESS,
        50
      );

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.stageProgress[JourneyStage.AWARENESS]).toBe(50);
    });

    it('should clamp progress between 0 and 100', async () => {
      // Test upper bound
      const result1 = await journeyService.updateStageProgress(
        TEST_USER_ID,
        JourneyStage.AWARENESS,
        150
      );
      expect(result1.data?.stageProgress[JourneyStage.AWARENESS]).toBe(100);

      // Test lower bound
      const result2 = await journeyService.updateStageProgress(
        TEST_USER_ID,
        JourneyStage.AWARENESS,
        -10
      );
      expect(result2.data?.stageProgress[JourneyStage.AWARENESS]).toBe(0);
    });
  });

  describe('completeMilestone', () => {
    it('should mark a milestone as completed', async () => {
      const result = await journeyService.completeMilestone(
        TEST_USER_ID,
        'complete-onboarding'
      );

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.completedMilestones).toContain('complete-onboarding');
    });

    it('should not add duplicate milestones', async () => {
      // Complete same milestone twice
      await journeyService.completeMilestone(TEST_USER_ID, 'first-tree');
      const result = await journeyService.completeMilestone(TEST_USER_ID, 'first-tree');

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      
      // Count occurrences
      const count = result.data?.completedMilestones.filter(m => m === 'first-tree').length;
      expect(count).toBe(1);
    });
  });

  describe('advanceStage', () => {
    it('should advance to next stage when prerequisites are met', async () => {
      // Set up prerequisites for activation stage
      await journeyService.trackAction(TEST_USER_ID, {
        type: 'cause_joined',
        metadata: { causeId: 'test-cause' },
      });

      const result = await journeyService.advanceStage(
        TEST_USER_ID,
        JourneyStage.ACTIVATION
      );

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.currentStage).toBe(JourneyStage.ACTIVATION);
    });

    it('should fail to advance if prerequisites not met', async () => {
      // Try to advance to verification without meeting requirements
      const result = await journeyService.advanceStage(
        TEST_USER_ID,
        JourneyStage.VERIFICATION
      );

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations based on current stage', async () => {
      const result = await journeyService.getRecommendations(TEST_USER_ID);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
      
      // Check recommendation structure
      const firstRec = result.data![0];
      expect(firstRec).toHaveProperty('id');
      expect(firstRec).toHaveProperty('type');
      expect(firstRec).toHaveProperty('title');
      expect(firstRec).toHaveProperty('description');
      expect(firstRec).toHaveProperty('priority');
      expect(firstRec).toHaveProperty('actionUrl');
    });
  });

  describe('getNextMilestone', () => {
    it('should return next milestone for current stage', async () => {
      const { data: progress } = await journeyService.getJourneyProgress(TEST_USER_ID);
      
      if (progress) {
        const milestone = journeyService.getNextMilestone(progress);
        
        expect(milestone).toBeDefined();
        expect(milestone).toHaveProperty('id');
        expect(milestone).toHaveProperty('name');
        expect(milestone).toHaveProperty('description');
        expect(milestone).toHaveProperty('stage');
        expect(milestone).toHaveProperty('requiredActions');
        expect(milestone).toHaveProperty('reward');
      }
    });
  });

  describe('Timestamp Management', () => {
    it('should automatically set created_at and updated_at', async () => {
      const { data } = await journeyService.getJourneyProgress(TEST_USER_ID);

      expect(data?.createdAt).toBeInstanceOf(Date);
      expect(data?.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updated_at on changes', async () => {
      const { data: before } = await journeyService.getJourneyProgress(TEST_USER_ID);
      const beforeTime = before?.updatedAt;

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Make an update
      await journeyService.updateStageProgress(
        TEST_USER_ID,
        JourneyStage.AWARENESS,
        75
      );

      const { data: after } = await journeyService.getJourneyProgress(TEST_USER_ID);
      const afterTime = after?.updatedAt;

      expect(afterTime).toBeDefined();
      expect(beforeTime).toBeDefined();
      expect(afterTime!.getTime()).toBeGreaterThan(beforeTime!.getTime());
    });
  });
});
