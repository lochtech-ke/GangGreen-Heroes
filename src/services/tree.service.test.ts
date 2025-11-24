import { describe, it, expect, vi, beforeEach } from 'vitest';
import { treeService } from './tree.service';
import { supabase } from './supabase';
import type { CreateTreeData } from '../types/tree.types';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

// Mock Antugrow Service
vi.mock('./antugrow.service', () => ({
  antugrowService: {
    isConfigured: vi.fn().mockReturnValue(false),
    registerTree: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe('TreeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTree', () => {
    const validTreeData: CreateTreeData = {
      initiative_id: 'init-123',
      species: 'Acacia',
      planted_date: '2025-01-01',
      location: {
        type: 'Point',
        coordinates: [34.8522, 0.2827],
      },
      planted_by: 'user-123',
      current_height_cm: 50,
      current_diameter_cm: 5,
    };

    it('should successfully create a tree', async () => {
      const mockTree = {
        id: 'tree-123',
        ...validTreeData,
        location: 'POINT(34.8522 0.2827)',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTree,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.createTree(validTreeData);

      expect(result.error).toBeNull();
      expect(result.tree).toBeDefined();
      expect(result.tree?.species).toBe('Acacia');
      expect(supabase.from).toHaveBeenCalledWith('trees');
    });

    it('should return error for empty species', async () => {
      const invalidData = {
        ...validTreeData,
        species: '',
      };

      const result = await treeService.createTree(invalidData);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('species is required');
      expect(result.tree).toBeNull();
    });

    it('should return error for future planted date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidData = {
        ...validTreeData,
        planted_date: futureDate.toISOString().split('T')[0],
      };

      const result = await treeService.createTree(invalidData);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('cannot be in the future');
      expect(result.tree).toBeNull();
    });

    it('should return error for negative height', async () => {
      const invalidData = {
        ...validTreeData,
        current_height_cm: -10,
      };

      const result = await treeService.createTree(invalidData);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Height cannot be negative');
      expect(result.tree).toBeNull();
    });

    it('should return error for invalid location coordinates', async () => {
      const invalidData = {
        ...validTreeData,
        location: {
          type: 'Point' as const,
          coordinates: [34.8522] as any, // Missing latitude
        },
      };

      const result = await treeService.createTree(invalidData);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid location');
      expect(result.tree).toBeNull();
    });
  });

  describe('getTree', () => {
    it('should successfully retrieve a tree', async () => {
      const mockTree = {
        id: 'tree-123',
        species: 'Acacia',
        planted_date: '2025-01-01',
        location: 'POINT(34.8522 0.2827)',
        initiative_id: 'init-123',
        planted_by: 'user-123',
        current_height_cm: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTree,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.getTree('tree-123');

      expect(result.error).toBeNull();
      expect(result.tree).toBeDefined();
      expect(result.tree?.id).toBe('tree-123');
    });

    it('should return error when tree not found', async () => {
      const mockError = new Error('Tree not found');

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

      const result = await treeService.getTree('nonexistent');

      expect(result.error).toBe(mockError);
      expect(result.tree).toBeNull();
    });
  });

  describe('getTrees', () => {
    it('should retrieve all trees without filters', async () => {
      const mockTrees = [
        {
          id: 'tree-1',
          species: 'Acacia',
          location: 'POINT(34.8522 0.2827)',
          planted_date: '2025-01-01',
        },
        {
          id: 'tree-2',
          species: 'Baobab',
          location: 'POINT(36.8344 -1.2411)',
          planted_date: '2025-01-02',
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockTrees,
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.getTrees();

      expect(result.error).toBeNull();
      expect(result.trees).toHaveLength(2);
    });

    it('should filter trees by species', async () => {
      const mockTrees = [
        {
          id: 'tree-1',
          species: 'Acacia',
          location: 'POINT(34.8522 0.2827)',
        },
      ];

      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockTrees,
          error: null,
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.getTrees({ species: 'Acacia' });

      expect(result.error).toBeNull();
      expect(result.trees).toHaveLength(1);
      expect(mockEq).toHaveBeenCalledWith('species', 'Acacia');
    });

    it('should filter trees by health status', async () => {
      const mockTrees = [
        {
          id: 'tree-1',
          species: 'Acacia',
          health_status: 'healthy',
          location: 'POINT(34.8522 0.2827)',
        },
      ];

      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockTrees,
          error: null,
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.getTrees({ health_status: 'healthy' });

      expect(result.error).toBeNull();
      expect(mockEq).toHaveBeenCalledWith('health_status', 'healthy');
    });

    it('should filter trees by initiative', async () => {
      const mockTrees = [
        {
          id: 'tree-1',
          initiative_id: 'init-123',
          location: 'POINT(34.8522 0.2827)',
        },
      ];

      const mockEq = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockTrees,
          error: null,
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.getTrees({ initiative_id: 'init-123' });

      expect(result.error).toBeNull();
      expect(mockEq).toHaveBeenCalledWith('initiative_id', 'init-123');
    });
  });

  describe('updateTree', () => {
    it('should successfully update a tree', async () => {
      const mockUpdatedTree = {
        id: 'tree-123',
        species: 'Acacia',
        current_height_cm: 75,
        health_status: 'healthy',
        location: 'POINT(34.8522 0.2827)',
      };

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedTree,
                error: null,
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.updateTree('tree-123', {
        current_height_cm: 75,
        health_status: 'healthy',
      });

      expect(result.error).toBeNull();
      expect(result.tree?.current_height_cm).toBe(75);
    });

    it('should return error for invalid update data', async () => {
      const result = await treeService.updateTree('tree-123', {
        species: '', // Empty species
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('cannot be empty');
      expect(result.tree).toBeNull();
    });

    it('should return error for negative measurements', async () => {
      const result = await treeService.updateTree('tree-123', {
        current_height_cm: -50,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Height cannot be negative');
      expect(result.tree).toBeNull();
    });
  });

  describe('deleteTree', () => {
    it('should successfully delete a tree', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.deleteTree('tree-123');

      expect(result.error).toBeNull();
    });
  });

  describe('addTreeImage', () => {
    it('should successfully add a tree image', async () => {
      const mockImage = {
        id: 'img-123',
        tree_id: 'tree-123',
        image_url: 'https://example.com/image.jpg',
        captured_at: '2025-01-01',
        created_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockImage,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.addTreeImage(
        'tree-123',
        'https://example.com/image.jpg',
        '2025-01-01'
      );

      expect(result.error).toBeNull();
      expect(result.image).toBeDefined();
      expect(result.image?.tree_id).toBe('tree-123');
    });
  });

  describe('getTreeImages', () => {
    it('should retrieve all images for a tree', async () => {
      const mockImages = [
        {
          id: 'img-1',
          tree_id: 'tree-123',
          image_url: 'https://example.com/image1.jpg',
          captured_at: '2025-01-01',
        },
        {
          id: 'img-2',
          tree_id: 'tree-123',
          image_url: 'https://example.com/image2.jpg',
          captured_at: '2025-01-02',
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockImages,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.getTreeImages('tree-123');

      expect(result.error).toBeNull();
      expect(result.images).toHaveLength(2);
    });
  });

  describe('deleteTreeImage', () => {
    it('should successfully delete a tree image', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.deleteTreeImage('img-123');

      expect(result.error).toBeNull();
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate tree statistics correctly', async () => {
      const mockTrees = [
        {
          id: 'tree-1',
          species: 'Acacia',
          health_status: 'healthy',
          initiative_id: 'init-1',
          current_height_cm: 100,
          current_diameter_cm: 10,
          location: 'POINT(34.8522 0.2827)',
        },
        {
          id: 'tree-2',
          species: 'Acacia',
          health_status: 'healthy',
          initiative_id: 'init-1',
          current_height_cm: 80,
          current_diameter_cm: 8,
          location: 'POINT(34.8522 0.2827)',
        },
        {
          id: 'tree-3',
          species: 'Baobab',
          health_status: 'stressed',
          initiative_id: 'init-2',
          current_height_cm: 120,
          current_diameter_cm: 12,
          location: 'POINT(34.8522 0.2827)',
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockTrees,
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const stats = await treeService.calculateStatistics();

      expect(stats).toBeDefined();
      expect(stats?.total_trees).toBe(3);
      expect(stats?.by_species['Acacia']).toBe(2);
      expect(stats?.by_species['Baobab']).toBe(1);
      expect(stats?.by_health_status.healthy).toBe(2);
      expect(stats?.by_health_status.stressed).toBe(1);
      expect(stats?.average_height_cm).toBe(100); // (100 + 80 + 120) / 3
      expect(stats?.average_diameter_cm).toBe(10); // (10 + 8 + 12) / 3
      expect(stats?.healthy_percentage).toBe(67); // 2/3 * 100 rounded
    });

    it('should return null when no trees found', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const stats = await treeService.calculateStatistics();

      expect(stats).toBeNull();
    });
  });

  describe('getSpeciesList', () => {
    it('should retrieve unique species list', async () => {
      const mockData = [
        { species: 'Acacia' },
        { species: 'Baobab' },
        { species: 'Acacia' }, // Duplicate
        { species: 'Cedar' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.getSpeciesList();

      expect(result.error).toBeNull();
      expect(result.species).toHaveLength(3); // Unique species only
      expect(result.species).toContain('Acacia');
      expect(result.species).toContain('Baobab');
      expect(result.species).toContain('Cedar');
    });
  });

  describe('searchTrees', () => {
    it('should search trees by species name', async () => {
      const mockTrees = [
        {
          id: 'tree-1',
          species: 'Acacia',
          location: 'POINT(34.8522 0.2827)',
        },
      ];

      const mockIlike = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockTrees,
          error: null,
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          ilike: mockIlike,
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await treeService.searchTrees('Acacia');

      expect(result.error).toBeNull();
      expect(result.trees).toHaveLength(1);
    });
  });

  describe('Antugrow Integration', () => {
    const validTreeData: CreateTreeData = {
      initiative_id: 'init-123',
      species: 'Acacia',
      planted_date: '2025-01-01',
      location: {
        type: 'Point',
        coordinates: [34.8522, 0.2827],
      },
      planted_by: 'user-123',
    };

    describe('coordinate validation', () => {
      it('should reject invalid latitude (> 90)', async () => {
        const invalidData = {
          ...validTreeData,
          location: {
            type: 'Point' as const,
            coordinates: [34.8522, 95] as [number, number],
          },
        };

        const result = await treeService.createTree(invalidData);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('Latitude must be between -90 and 90');
      });

      it('should reject invalid latitude (< -90)', async () => {
        const invalidData = {
          ...validTreeData,
          location: {
            type: 'Point' as const,
            coordinates: [34.8522, -95] as [number, number],
          },
        };

        const result = await treeService.createTree(invalidData);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('Latitude must be between -90 and 90');
      });

      it('should reject invalid longitude (> 180)', async () => {
        const invalidData = {
          ...validTreeData,
          location: {
            type: 'Point' as const,
            coordinates: [185, 0.2827] as [number, number],
          },
        };

        const result = await treeService.createTree(invalidData);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('Longitude must be between -180 and 180');
      });

      it('should reject invalid longitude (< -180)', async () => {
        const invalidData = {
          ...validTreeData,
          location: {
            type: 'Point' as const,
            coordinates: [-185, 0.2827] as [number, number],
          },
        };

        const result = await treeService.createTree(invalidData);

        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('Longitude must be between -180 and 180');
      });

      it('should accept valid coordinates', async () => {
        const mockTree = {
          id: 'tree-123',
          ...validTreeData,
          location: 'POINT(34.8522 0.2827)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockFrom = vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockTree,
                error: null,
              }),
            }),
          }),
        });

        vi.mocked(supabase.from).mockImplementation(mockFrom as any);

        const result = await treeService.createTree(validTreeData);

        expect(result.error).toBeNull();
        expect(result.tree).toBeDefined();
      });
    });

    describe('registerTreesWithAntugrow', () => {
      it('should process trees sequentially', async () => {
        const treeIds = ['tree-1', 'tree-2', 'tree-3'];

        // Mock getTree to return trees without antugrow_id
        const mockTree = {
          id: 'tree-1',
          species: 'Acacia',
          planted_date: '2025-01-01',
          location: {
            type: 'Point' as const,
            coordinates: [34.8522, 0.2827] as [number, number],
          },
        };

        const mockFrom = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockTree,
                error: null,
              }),
            }),
          }),
        });

        vi.mocked(supabase.from).mockImplementation(mockFrom as any);

        const result = await treeService.registerTreesWithAntugrow(treeIds);

        expect(result).toHaveProperty('succeeded');
        expect(result).toHaveProperty('failed');
        expect(result).toHaveProperty('errors');
        expect(Array.isArray(result.succeeded)).toBe(true);
        expect(Array.isArray(result.failed)).toBe(true);
      });

      it('should handle empty tree list', async () => {
        const result = await treeService.registerTreesWithAntugrow([]);

        expect(result.succeeded).toHaveLength(0);
        expect(result.failed).toHaveLength(0);
        expect(Object.keys(result.errors)).toHaveLength(0);
      });
    });
  });
});
