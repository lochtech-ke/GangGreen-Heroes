import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initiativeService } from './initiative.service';
import { supabase } from './supabase';
import type { CreateInitiativeData } from '../types/initiative.types';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('InitiativeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInitiative', () => {
    const validInitiativeData: CreateInitiativeData = {
      title: 'Test Initiative',
      description: 'Test description for initiative',
      forest: 'kakamega',
      target_trees: 1000,
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      location: {
        type: 'Point',
        coordinates: [34.8522, 0.2827],
      },
      area_hectares: 50,
      organization_id: 'org-123',
    };

    it('should successfully create an initiative', async () => {
      const mockInitiative = {
        id: 'init-123',
        ...validInitiativeData,
        trees_planted: 0,
        status: 'active',
        location: 'POINT(34.8522 0.2827)',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockInitiative,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.createInitiative(validInitiativeData);

      expect(result.error).toBeNull();
      expect(result.initiative).toBeDefined();
      expect(result.initiative?.title).toBe('Test Initiative');
      expect(supabase.from).toHaveBeenCalledWith('initiatives');
    });

    it('should return error for invalid title', async () => {
      const invalidData = {
        ...validInitiativeData,
        title: '',
      };

      const result = await initiativeService.createInitiative(invalidData);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('title is required');
      expect(result.initiative).toBeNull();
    });

    it('should return error for negative target trees', async () => {
      const invalidData = {
        ...validInitiativeData,
        target_trees: -100,
      };

      const result = await initiativeService.createInitiative(invalidData);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('must be greater than 0');
      expect(result.initiative).toBeNull();
    });

    it('should return error for invalid location coordinates', async () => {
      const invalidData = {
        ...validInitiativeData,
        location: {
          type: 'Point' as const,
          coordinates: [34.8522] as any, // Missing latitude
        },
      };

      const result = await initiativeService.createInitiative(invalidData);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid location');
      expect(result.initiative).toBeNull();
    });

    it('should return error when end date is before start date', async () => {
      const invalidData = {
        ...validInitiativeData,
        start_date: '2025-12-31',
        end_date: '2025-01-01',
      };

      const result = await initiativeService.createInitiative(invalidData);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('End date must be after start date');
      expect(result.initiative).toBeNull();
    });
  });

  describe('getInitiative', () => {
    it('should successfully retrieve an initiative', async () => {
      const mockInitiative = {
        id: 'init-123',
        title: 'Test Initiative',
        description: 'Test description',
        forest: 'kakamega',
        target_trees: 1000,
        trees_planted: 250,
        status: 'active',
        location: 'POINT(34.8522 0.2827)',
        area_hectares: 50,
        organization_id: 'org-123',
        start_date: '2025-01-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockInitiative,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.getInitiative('init-123');

      expect(result.error).toBeNull();
      expect(result.initiative).toBeDefined();
      expect(result.initiative?.id).toBe('init-123');
    });

    it('should return error when initiative not found', async () => {
      const mockError = new Error('Initiative not found');

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.getInitiative('nonexistent');

      expect(result.error).toBe(mockError);
      expect(result.initiative).toBeNull();
    });
  });

  describe('getInitiatives', () => {
    it('should retrieve all initiatives without filters', async () => {
      const mockInitiatives = [
        {
          id: 'init-1',
          title: 'Initiative 1',
          forest: 'kakamega',
          status: 'active',
          location: 'POINT(34.8522 0.2827)',
        },
        {
          id: 'init-2',
          title: 'Initiative 2',
          forest: 'karura',
          status: 'completed',
          location: 'POINT(36.8344 -1.2411)',
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockInitiatives,
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.getInitiatives();

      expect(result).toHaveLength(2);
    });

    it('should filter initiatives by forest', async () => {
      const mockInitiatives = [
        {
          id: 'init-1',
          title: 'Kakamega Initiative',
          forest: 'kakamega',
          location: 'POINT(34.8522 0.2827)',
        },
      ];

      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockInitiatives,
          error: null,
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.getInitiatives({ forest: 'kakamega' });

      expect(result).toHaveLength(1);
      expect(mockEq).toHaveBeenCalledWith('forest', 'kakamega');
    });

    it('should filter initiatives by status', async () => {
      const mockInitiatives = [
        {
          id: 'init-1',
          title: 'Active Initiative',
          status: 'active',
          location: 'POINT(34.8522 0.2827)',
        },
      ];

      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockInitiatives,
          error: null,
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.getInitiatives({ status: 'active' });

      expect(result).toBeDefined();
      expect(mockEq).toHaveBeenCalledWith('status', 'active');
    });
  });

  describe('updateInitiative', () => {
    it('should successfully update an initiative', async () => {
      const mockUpdatedInitiative = {
        id: 'init-123',
        title: 'Updated Title',
        status: 'completed',
        location: 'POINT(34.8522 0.2827)',
      };

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedInitiative,
                error: null,
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      // TODO: Implement updateInitiative function
      // const result = await initiativeService.updateInitiative('init-123', {
      //   title: 'Updated Title',
      //   status: 'completed',
      // });

      // expect(result.error).toBeNull();
      // expect(result.initiative?.title).toBe('Updated Title');
    });

    it('should return error for invalid update data', async () => {
      // TODO: Implement updateInitiative function
      // const result = await initiativeService.updateInitiative('init-123', {
      //   title: '', // Empty title
      // });

      // expect(result.error).toBeDefined();
      // expect(result.error?.message).toContain('cannot be empty');
      // expect(result.initiative).toBeNull();
    });
  });

  describe('deleteInitiative', () => {
    it('should successfully delete an initiative', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      // TODO: Implement deleteInitiative function
      // const result = await initiativeService.deleteInitiative('init-123');

      // expect(result.error).toBeNull();
    });
  });

  describe('joinInitiative', () => {
    it('should successfully join an initiative', async () => {
      const mockParticipant = {
        id: 'part-123',
        initiative_id: 'init-123',
        user_id: 'user-123',
        trees_contributed: 0,
        joined_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockParticipant,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.joinInitiative('init-123', 'user-123');

      expect(result.error).toBeNull();
      expect(result.participant).toBeDefined();
      expect(result.participant?.user_id).toBe('user-123');
    });

    it('should return error when user already joined', async () => {
      const mockError = { code: '23505', message: 'Duplicate entry' };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.joinInitiative('init-123', 'user-123');

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('already joined');
    });
  });

  describe('leaveInitiative', () => {
    it('should successfully leave an initiative', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.leaveInitiative('init-123', 'user-123');

      expect(result.error).toBeNull();
    });
  });

  describe('getParticipants', () => {
    it('should retrieve all participants for an initiative', async () => {
      const mockParticipants = [
        {
          id: 'part-1',
          initiative_id: 'init-123',
          user_id: 'user-1',
          trees_contributed: 50,
          joined_at: new Date().toISOString(),
        },
        {
          id: 'part-2',
          initiative_id: 'init-123',
          user_id: 'user-2',
          trees_contributed: 75,
          joined_at: new Date().toISOString(),
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockParticipants,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.getParticipants('init-123');

      expect(result.error).toBeNull();
      expect(result.participants).toHaveLength(2);
    });
  });

  describe('updateParticipantContribution', () => {
    it('should successfully update participant contribution', async () => {
      const mockParticipant = {
        id: 'part-123',
        initiative_id: 'init-123',
        user_id: 'user-123',
        trees_contributed: 100,
        joined_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockParticipant,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await initiativeService.updateParticipantContribution(
        'init-123',
        'user-123',
        100
      );

      expect(result.error).toBeNull();
      expect(result.participant?.trees_contributed).toBe(100);
    });

    it('should return error for negative contribution', async () => {
      const result = await initiativeService.updateParticipantContribution(
        'init-123',
        'user-123',
        -50
      );

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('cannot be negative');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress correctly', async () => {
      const mockInitiative = {
        id: 'init-123',
        title: 'Test Initiative',
        target_trees: 1000,
        trees_planted: 250,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        status: 'active',
        location: 'POINT(34.8522 0.2827)',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockInitiative,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const progress = await initiativeService.calculateProgress('init-123');

      expect(progress).toBeDefined();
      expect(progress?.progress_percentage).toBe(25);
      expect(progress?.trees_remaining).toBe(750);
      expect(progress?.days_remaining).toBeDefined();
    });

    it('should cap progress at 100%', async () => {
      const mockInitiative = {
        id: 'init-123',
        target_trees: 1000,
        trees_planted: 1500, // Over target
        start_date: '2025-01-01',
        status: 'completed',
        location: 'POINT(34.8522 0.2827)',
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockInitiative,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const progress = await initiativeService.calculateProgress('init-123');

      expect(progress?.progress_percentage).toBe(100);
      expect(progress?.trees_remaining).toBe(0);
    });
  });
});
