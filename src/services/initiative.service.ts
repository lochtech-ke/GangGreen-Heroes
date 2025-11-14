import { supabase } from './supabase';
import type {
  Initiative,
  InitiativeParticipant,
  CreateInitiativeData,
  UpdateInitiativeData,
  InitiativeFilters,
  InitiativeWithParticipants,
  InitiativeProgress,
  InitiativeResponse,
  InitiativesResponse,
  ParticipantResponse,
} from '../types/initiative.types';

/**
 * Initiative Service
 * Handles tree planting initiative management, filtering, and participant tracking
 */
class InitiativeService {
  /**
   * Create a new initiative
   * Only organizations can create initiatives
   */
  async createInitiative(data: CreateInitiativeData): Promise<InitiativeResponse> {
    try {
      // Validate initiative data
      const validationError = this.validateInitiativeData(data);
      if (validationError) {
        return { initiative: null, error: validationError };
      }

      // Convert GeoPoint to PostGIS format
      const locationWKT = `POINT(${data.location.coordinates[0]} ${data.location.coordinates[1]})`;

      const { data: initiative, error } = await supabase
        .from('initiatives')
        .insert({
          title: data.title,
          description: data.description,
          forest: data.forest,
          target_trees: data.target_trees,
          trees_planted: 0,
          start_date: data.start_date,
          end_date: data.end_date,
          status: 'active',
          location: locationWKT,
          area_hectares: data.area_hectares,
          organization_id: data.organization_id,
        })
        .select()
        .single();

      if (error) {
        return { initiative: null, error };
      }

      return { initiative: this.formatInitiative(initiative), error: null };
    } catch (error) {
      return {
        initiative: null,
        error: error instanceof Error ? error : new Error('Failed to create initiative'),
      };
    }
  }

  /**
   * Get initiative by ID
   */
  async getInitiative(initiativeId: string): Promise<InitiativeResponse> {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('id', initiativeId)
        .single();

      if (error) {
        return { initiative: null, error };
      }

      return { initiative: this.formatInitiative(data), error: null };
    } catch (error) {
      return {
        initiative: null,
        error: error instanceof Error ? error : new Error('Failed to fetch initiative'),
      };
    }
  }

  /**
   * Get all initiatives with optional filtering
   */
  async getInitiatives(filters?: InitiativeFilters): Promise<InitiativesResponse> {
    try {
      let query = supabase.from('initiatives').select('*');

      // Apply filters
      if (filters?.forest) {
        query = query.eq('forest', filters.forest);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Order by created date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { initiatives: [], error };
      }

      const initiatives = data.map((item) => this.formatInitiative(item));
      return { initiatives, error: null };
    } catch (error) {
      return {
        initiatives: [],
        error: error instanceof Error ? error : new Error('Failed to fetch initiatives'),
      };
    }
  }

  /**
   * Get initiatives by forest
   */
  async getInitiativesByForest(forest: string): Promise<InitiativesResponse> {
    return this.getInitiatives({ forest: forest as any });
  }

  /**
   * Update initiative
   * Only the organization that created it can update
   */
  async updateInitiative(
    initiativeId: string,
    updates: UpdateInitiativeData
  ): Promise<InitiativeResponse> {
    try {
      // Validate updates
      const validationError = this.validateUpdateData(updates);
      if (validationError) {
        return { initiative: null, error: validationError };
      }

      const { data, error } = await supabase
        .from('initiatives')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initiativeId)
        .select()
        .single();

      if (error) {
        return { initiative: null, error };
      }

      return { initiative: this.formatInitiative(data), error: null };
    } catch (error) {
      return {
        initiative: null,
        error: error instanceof Error ? error : new Error('Failed to update initiative'),
      };
    }
  }

  /**
   * Delete initiative
   * Only the organization that created it can delete
   */
  async deleteInitiative(initiativeId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('initiatives')
        .delete()
        .eq('id', initiativeId);

      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Failed to delete initiative'),
      };
    }
  }

  /**
   * Add participant to initiative
   */
  async joinInitiative(
    initiativeId: string,
    userId: string
  ): Promise<ParticipantResponse> {
    try {
      const { data, error } = await supabase
        .from('initiative_participants')
        .insert({
          initiative_id: initiativeId,
          user_id: userId,
          trees_contributed: 0,
        })
        .select()
        .single();

      if (error) {
        // Check if user already joined
        if (error.code === '23505') {
          return {
            participant: null,
            error: new Error('User already joined this initiative'),
          };
        }
        return { participant: null, error };
      }

      return { participant: data, error: null };
    } catch (error) {
      return {
        participant: null,
        error: error instanceof Error ? error : new Error('Failed to join initiative'),
      };
    }
  }

  /**
   * Remove participant from initiative
   */
  async leaveInitiative(
    initiativeId: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('initiative_participants')
        .delete()
        .eq('initiative_id', initiativeId)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Failed to leave initiative'),
      };
    }
  }

  /**
   * Get participants for an initiative
   */
  async getParticipants(initiativeId: string): Promise<{
    participants: InitiativeParticipant[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('initiative_participants')
        .select('*')
        .eq('initiative_id', initiativeId)
        .order('joined_at', { ascending: false });

      if (error) {
        return { participants: [], error };
      }

      return { participants: data, error: null };
    } catch (error) {
      return {
        participants: [],
        error: error instanceof Error ? error : new Error('Failed to fetch participants'),
      };
    }
  }

  /**
   * Update participant contribution
   */
  async updateParticipantContribution(
    initiativeId: string,
    userId: string,
    treesContributed: number
  ): Promise<ParticipantResponse> {
    try {
      if (treesContributed < 0) {
        return {
          participant: null,
          error: new Error('Trees contributed cannot be negative'),
        };
      }

      const { data, error } = await supabase
        .from('initiative_participants')
        .update({ trees_contributed: treesContributed })
        .eq('initiative_id', initiativeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { participant: null, error };
      }

      return { participant: data, error: null };
    } catch (error) {
      return {
        participant: null,
        error:
          error instanceof Error ? error : new Error('Failed to update contribution'),
      };
    }
  }

  /**
   * Calculate initiative progress
   */
  async calculateProgress(initiativeId: string): Promise<InitiativeProgress | null> {
    try {
      const { initiative, error } = await this.getInitiative(initiativeId);

      if (error || !initiative) {
        return null;
      }

      const progressPercentage = Math.min(
        Math.round((initiative.trees_planted / initiative.target_trees) * 100),
        100
      );

      const treesRemaining = Math.max(
        initiative.target_trees - initiative.trees_planted,
        0
      );

      let daysRemaining: number | undefined;
      let isOnTrack = true;

      if (initiative.end_date) {
        const endDate = new Date(initiative.end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate if on track (simple heuristic)
        const startDate = new Date(initiative.start_date);
        const totalDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const elapsedDays = Math.ceil(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const expectedProgress = (elapsedDays / totalDays) * 100;

        isOnTrack = progressPercentage >= expectedProgress * 0.8; // 80% of expected
      }

      return {
        initiative_id: initiativeId,
        progress_percentage: progressPercentage,
        trees_remaining: treesRemaining,
        days_remaining: daysRemaining,
        is_on_track: isOnTrack,
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      return null;
    }
  }

  /**
   * Get initiative with participants count
   */
  async getInitiativeWithParticipants(
    initiativeId: string
  ): Promise<{ initiative: InitiativeWithParticipants | null; error: Error | null }> {
    try {
      const { initiative, error: initiativeError } = await this.getInitiative(
        initiativeId
      );

      if (initiativeError || !initiative) {
        return { initiative: null, error: initiativeError };
      }

      const { participants, error: participantsError } = await this.getParticipants(
        initiativeId
      );

      if (participantsError) {
        return { initiative: null, error: participantsError };
      }

      const initiativeWithParticipants: InitiativeWithParticipants = {
        ...initiative,
        participants_count: participants.length,
        participants,
      };

      return { initiative: initiativeWithParticipants, error: null };
    } catch (error) {
      return {
        initiative: null,
        error:
          error instanceof Error
            ? error
            : new Error('Failed to fetch initiative with participants'),
      };
    }
  }

  /**
   * Format initiative data from database
   * Converts PostGIS location to GeoJSON format
   */
  private formatInitiative(data: any): Initiative {
    // Parse location if it's in WKT format
    let location = data.location;
    if (typeof data.location === 'string') {
      // Extract coordinates from WKT POINT format
      const match = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (match) {
        location = {
          type: 'Point',
          coordinates: [parseFloat(match[1]), parseFloat(match[2])],
        };
      }
    }

    return {
      ...data,
      location,
    };
  }

  /**
   * Validate initiative creation data
   */
  private validateInitiativeData(data: CreateInitiativeData): Error | null {
    if (!data.title || data.title.trim().length === 0) {
      return new Error('Initiative title is required');
    }

    if (data.title.length > 200) {
      return new Error('Initiative title must be less than 200 characters');
    }

    if (!data.description || data.description.trim().length === 0) {
      return new Error('Initiative description is required');
    }

    if (data.target_trees <= 0) {
      return new Error('Target trees must be greater than 0');
    }

    if (data.area_hectares <= 0) {
      return new Error('Area must be greater than 0');
    }

    if (!data.location || !data.location.coordinates) {
      return new Error('Location is required');
    }

    if (
      data.location.coordinates.length !== 2 ||
      typeof data.location.coordinates[0] !== 'number' ||
      typeof data.location.coordinates[1] !== 'number'
    ) {
      return new Error('Invalid location coordinates');
    }

    // Validate dates
    const startDate = new Date(data.start_date);
    if (isNaN(startDate.getTime())) {
      return new Error('Invalid start date');
    }

    if (data.end_date) {
      const endDate = new Date(data.end_date);
      if (isNaN(endDate.getTime())) {
        return new Error('Invalid end date');
      }

      if (endDate <= startDate) {
        return new Error('End date must be after start date');
      }
    }

    return null;
  }

  /**
   * Validate initiative update data
   */
  private validateUpdateData(data: UpdateInitiativeData): Error | null {
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        return new Error('Initiative title cannot be empty');
      }

      if (data.title.length > 200) {
        return new Error('Initiative title must be less than 200 characters');
      }
    }

    if (data.target_trees !== undefined && data.target_trees <= 0) {
      return new Error('Target trees must be greater than 0');
    }

    if (data.area_hectares !== undefined && data.area_hectares <= 0) {
      return new Error('Area must be greater than 0');
    }

    if (data.end_date !== undefined) {
      const endDate = new Date(data.end_date);
      if (isNaN(endDate.getTime())) {
        return new Error('Invalid end date');
      }
    }

    return null;
  }
}

// Export singleton instance
export const initiativeService = new InitiativeService();
