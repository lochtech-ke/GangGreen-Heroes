import { supabase } from './supabase';
import { withRetry, DEFAULT_RETRY_CONFIG } from '../utils/retry';
import type {
  Petition,
  PetitionRow,
  PetitionSignature,
  PetitionSignatureRow,
  PetitionWithSignature,
  CreatePetitionParams,
  SignPetitionParams,
  PetitionFilters,
  PetitionServiceResponse,
} from '../types/petition.types';

/**
 * Petition Service
 * Manages environmental petitions and signatures
 */
class PetitionService {
  /**
   * Get all petitions with optional filters
   */
  async getPetitions(
    filters?: PetitionFilters,
    userId?: string
  ): Promise<PetitionServiceResponse<PetitionWithSignature[]>> {
    try {
      console.log('[PetitionService] Fetching petitions with filters:', filters);

      const result = await withRetry(
        async () => {
          let query = supabase.from('petitions').select('*');

          // Apply filters
          if (filters?.status) {
            query = query.eq('status', filters.status);
          } else {
            // Default to active petitions
            query = query.eq('status', 'active');
          }

          if (filters?.category) {
            query = query.eq('category', filters.category);
          }

          if (filters?.createdBy) {
            query = query.eq('created_by', filters.createdBy);
          }

          query = query.order('created_at', { ascending: false });

          const response = await query;
          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getPetitions'
      );

      const { data, error } = result;

      if (error) {
        console.error('[PetitionService] Error fetching petitions:', error);
        return { data: null, error: new Error('Failed to fetch petitions') };
      }

      // Transform petitions and check if user has signed
      const petitions = await Promise.all(
        data.map(async (row: PetitionRow) => {
          const petition = this.transformPetitionData(row);
          let hasUserSigned = false;

          if (userId) {
            const { data: signatureData } = await this.hasUserSigned(petition.id, userId);
            hasUserSigned = signatureData || false;
          }

          const progressPercentage =
            petition.targetSignatures > 0
              ? Math.min(100, (petition.currentSignatures / petition.targetSignatures) * 100)
              : 0;

          return {
            ...petition,
            hasUserSigned,
            progressPercentage,
          };
        })
      );

      return { data: petitions, error: null };
    } catch (error) {
      console.error('[PetitionService] Exception fetching petitions:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch petitions'),
      };
    }
  }

  /**
   * Get a single petition by ID
   */
  async getPetitionById(
    petitionId: string,
    userId?: string
  ): Promise<PetitionServiceResponse<PetitionWithSignature>> {
    try {
      console.log('[PetitionService] Fetching petition:', petitionId);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('petitions')
            .select('*')
            .eq('id', petitionId)
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getPetitionById'
      );

      const { data, error } = result;

      if (error) {
        console.error('[PetitionService] Error fetching petition:', error);
        return { data: null, error: new Error('Failed to fetch petition') };
      }

      const petition = this.transformPetitionData(data);
      let hasUserSigned = false;

      if (userId) {
        const { data: signatureData } = await this.hasUserSigned(petition.id, userId);
        hasUserSigned = signatureData || false;
      }

      const progressPercentage =
        petition.targetSignatures > 0
          ? Math.min(100, (petition.currentSignatures / petition.targetSignatures) * 100)
          : 0;

      return {
        data: {
          ...petition,
          hasUserSigned,
          progressPercentage,
        },
        error: null,
      };
    } catch (error) {
      console.error('[PetitionService] Exception fetching petition:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch petition'),
      };
    }
  }

  /**
   * Create a new petition
   */
  async createPetition(
    params: CreatePetitionParams
  ): Promise<PetitionServiceResponse<Petition>> {
    try {
      console.log('[PetitionService] Creating petition:', params);

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('petitions')
            .insert({
              title: params.title,
              description: params.description,
              category: params.category,
              target_signatures: params.targetSignatures,
              created_by: params.createdBy,
              status: 'active',
              expires_at: params.expiresAt?.toISOString(),
            })
            .select()
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'createPetition'
      );

      const { data, error } = result;

      if (error) {
        console.error('[PetitionService] Error creating petition:', error);
        return { data: null, error: new Error('Failed to create petition') };
      }

      const petition = this.transformPetitionData(data);
      console.log('[PetitionService] Petition created successfully');

      return { data: petition, error: null };
    } catch (error) {
      console.error('[PetitionService] Exception creating petition:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to create petition'),
      };
    }
  }

  /**
   * Sign a petition
   */
  async signPetition(
    params: SignPetitionParams
  ): Promise<PetitionServiceResponse<PetitionSignature>> {
    try {
      console.log('[PetitionService] Signing petition:', params);

      // Check if user already signed
      const { data: alreadySigned } = await this.hasUserSigned(params.petitionId, params.userId);
      if (alreadySigned) {
        return {
          data: null,
          error: new Error('You have already signed this petition'),
        };
      }

      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('petition_signatures')
            .insert({
              petition_id: params.petitionId,
              user_id: params.userId,
            })
            .select()
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'signPetition'
      );

      const { data, error } = result;

      if (error) {
        console.error('[PetitionService] Error signing petition:', error);
        return { data: null, error: new Error('Failed to sign petition') };
      }

      const signature = this.transformSignatureData(data);
      console.log('[PetitionService] Petition signed successfully');

      return { data: signature, error: null };
    } catch (error) {
      console.error('[PetitionService] Exception signing petition:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to sign petition'),
      };
    }
  }

  /**
   * Check if user has signed a petition
   */
  async hasUserSigned(
    petitionId: string,
    userId: string
  ): Promise<PetitionServiceResponse<boolean>> {
    try {
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('petition_signatures')
            .select('id')
            .eq('petition_id', petitionId)
            .eq('user_id', userId)
            .limit(1);

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'hasUserSigned'
      );

      const { data, error } = result;

      if (error) {
        console.error('[PetitionService] Error checking signature:', error);
        return { data: false, error: new Error('Failed to check signature') };
      }

      return { data: data.length > 0, error: null };
    } catch (error) {
      console.error('[PetitionService] Exception checking signature:', error);
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Failed to check signature'),
      };
    }
  }

  /**
   * Get petition signatures
   */
  async getPetitionSignatures(
    petitionId: string
  ): Promise<PetitionServiceResponse<PetitionSignature[]>> {
    try {
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('petition_signatures')
            .select('*')
            .eq('petition_id', petitionId)
            .order('signed_at', { ascending: false });

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getPetitionSignatures'
      );

      const { data, error } = result;

      if (error) {
        console.error('[PetitionService] Error fetching signatures:', error);
        return { data: null, error: new Error('Failed to fetch signatures') };
      }

      const signatures = data.map((row: PetitionSignatureRow) =>
        this.transformSignatureData(row)
      );
      return { data: signatures, error: null };
    } catch (error) {
      console.error('[PetitionService] Exception fetching signatures:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch signatures'),
      };
    }
  }

  /**
   * Get petition categories
   */
  async getCategories(): Promise<PetitionServiceResponse<string[]>> {
    try {
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('petitions')
            .select('category')
            .eq('status', 'active');

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'getCategories'
      );

      const { data, error } = result;

      if (error) {
        console.error('[PetitionService] Error fetching categories:', error);
        return { data: null, error: new Error('Failed to fetch categories') };
      }

      // Extract unique categories
      const categories = [...new Set(data.map((row: any) => row.category))];
      return { data: categories, error: null };
    } catch (error) {
      console.error('[PetitionService] Exception fetching categories:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch categories'),
      };
    }
  }

  /**
   * Update petition status
   */
  async updatePetitionStatus(
    petitionId: string,
    status: 'active' | 'successful' | 'expired' | 'closed'
  ): Promise<PetitionServiceResponse<Petition>> {
    try {
      const result = await withRetry(
        async () => {
          const response = await supabase
            .from('petitions')
            .update({ status })
            .eq('id', petitionId)
            .select()
            .single();

          if (response.error) throw response.error;
          return response;
        },
        DEFAULT_RETRY_CONFIG,
        'updatePetitionStatus'
      );

      const { data, error } = result;

      if (error) {
        console.error('[PetitionService] Error updating petition status:', error);
        return { data: null, error: new Error('Failed to update petition status') };
      }

      const petition = this.transformPetitionData(data);
      return { data: petition, error: null };
    } catch (error) {
      console.error('[PetitionService] Exception updating petition status:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to update petition status'),
      };
    }
  }

  /**
   * Transform database row to Petition type
   */
  private transformPetitionData(row: PetitionRow): Petition {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      targetSignatures: row.target_signatures,
      currentSignatures: row.current_signatures,
      createdBy: row.created_by,
      status: row.status,
      createdAt: new Date(row.created_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Transform database row to PetitionSignature type
   */
  private transformSignatureData(row: PetitionSignatureRow): PetitionSignature {
    return {
      id: row.id,
      petitionId: row.petition_id,
      userId: row.user_id,
      signedAt: new Date(row.signed_at),
    };
  }
}

// Export singleton instance
export const petitionService = new PetitionService();
