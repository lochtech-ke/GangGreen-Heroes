import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { antugrowService } from './antugrow.service';

// Mock fetch
global.fetch = vi.fn();

describe('AntugrowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerTree', () => {
    it('should successfully register a tree', async () => {
      const mockResponse = {
        antugrow_id: 'antugrow-123',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await antugrowService.registerTree({
        tree_id: 'tree-123',
        species: 'Acacia',
        location: { latitude: 0.2827, longitude: 34.8522 },
        planted_date: '2025-01-01',
      });

      expect(result.error).toBeNull();
      expect(result.data?.antugrow_id).toBe('antugrow-123');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/trees/register'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid data' }),
      } as Response);

      const result = await antugrowService.registerTree({
        tree_id: 'tree-123',
        species: 'Acacia',
        location: { latitude: 0.2827, longitude: 34.8522 },
        planted_date: '2025-01-01',
      });

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('analyzeImage', () => {
    it('should successfully analyze an image', async () => {
      const mockAnalysis = {
        antugrow_id: 'analysis-123',
        health_score: 85,
        growth_rate: 12.5,
        disease_detected: false,
        recommendations: ['Continue regular watering'],
        analyzed_at: new Date().toISOString(),
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      } as Response);

      const result = await antugrowService.analyzeImage({
        tree_id: 'tree-123',
        image_url: 'https://example.com/tree.jpg',
        captured_at: '2025-01-01',
      });

      expect(result.error).toBeNull();
      expect(result.data?.health_score).toBe(85);
      expect(result.data?.disease_detected).toBe(false);
    });

    it('should detect diseases in analysis', async () => {
      const mockAnalysis = {
        antugrow_id: 'analysis-123',
        health_score: 45,
        growth_rate: 5.0,
        disease_detected: true,
        recommendations: ['Apply fungicide', 'Increase monitoring'],
        analyzed_at: new Date().toISOString(),
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      } as Response);

      const result = await antugrowService.analyzeImage({
        tree_id: 'tree-123',
        image_url: 'https://example.com/tree.jpg',
        captured_at: '2025-01-01',
      });

      expect(result.error).toBeNull();
      expect(result.data?.disease_detected).toBe(true);
      expect(result.data?.recommendations).toHaveLength(2);
    });
  });

  describe('getGrowthData', () => {
    it('should successfully retrieve growth data', async () => {
      const mockGrowthData = {
        tree_id: 'tree-123',
        antugrow_id: 'antugrow-123',
        measurements: {
          height_cm: 150,
          diameter_cm: 15,
          canopy_area_m2: 5.2,
        },
        health_status: 'healthy' as const,
        last_updated: new Date().toISOString(),
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGrowthData,
      } as Response);

      const result = await antugrowService.getGrowthData('antugrow-123');

      expect(result.error).toBeNull();
      expect(result.data?.measurements.height_cm).toBe(150);
      expect(result.data?.health_status).toBe('healthy');
    });
  });

  describe('retry logic', () => {
    it('should retry on rate limit (429)', async () => {
      const mockSuccess = {
        antugrow_id: 'antugrow-123',
      };

      // First call returns 429, second succeeds
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccess,
        } as Response);

      const result = await antugrowService.registerTree({
        tree_id: 'tree-123',
        species: 'Acacia',
        location: { latitude: 0.2827, longitude: 34.8522 },
        planted_date: '2025-01-01',
      });

      expect(result.error).toBeNull();
      expect(result.data?.antugrow_id).toBe('antugrow-123');
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on server error (500)', async () => {
      const mockSuccess = {
        antugrow_id: 'antugrow-123',
      };

      // First call returns 500, second succeeds
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccess,
        } as Response);

      const result = await antugrowService.registerTree({
        tree_id: 'tree-123',
        species: 'Acacia',
        location: { latitude: 0.2827, longitude: 34.8522 },
        planted_date: '2025-01-01',
      });

      expect(result.error).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      // All calls return 500
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await antugrowService.registerTree({
        tree_id: 'tree-123',
        species: 'Acacia',
        location: { latitude: 0.2827, longitude: 34.8522 },
        planted_date: '2025-01-01',
      });

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should retry on network error', async () => {
      const mockSuccess = {
        antugrow_id: 'antugrow-123',
      };

      // First call throws network error, second succeeds
      vi.mocked(fetch)
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccess,
        } as Response);

      const result = await antugrowService.registerTree({
        tree_id: 'tree-123',
        species: 'Acacia',
        location: { latitude: 0.2827, longitude: 34.8522 },
        planted_date: '2025-01-01',
      });

      expect(result.error).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getStatus', () => {
    it('should check API status', async () => {
      const mockStatus = {
        status: 'operational',
        version: '1.0.0',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const result = await antugrowService.getStatus();

      expect(result.error).toBeNull();
      expect(result.data?.status).toBe('operational');
    });
  });

  describe('isConfigured', () => {
    it('should check if API is configured', () => {
      const isConfigured = antugrowService.isConfigured();
      expect(typeof isConfigured).toBe('boolean');
    });
  });
});
