import { supabase } from './supabase';
import { paystackService } from './paystack.service';
import { ggCoinService } from './ggCoin.service';
import type {
  BadgePurchase,
  InitiatePurchaseParams,
  InitiatePurchaseResult,
  CompletePurchaseParams,
  CompletePurchaseResult,
  VerifyAndRewardParams,
  VerifyAndRewardResult,
} from '../types/badgePurchase.types';
import { BADGE_PRICE_KES, BADGE_PURCHASE_GG_COIN_REWARD } from '../types/badgePurchase.types';

/**
 * Badge Purchase Service
 * Handles NFT badge purchases with Paystack integration and GG Coin rewards
 */
class BadgePurchaseService {
  /**
   * Initiate a badge purchase
   * Creates a purchase record and initializes Paystack payment
   */
  async initiatePurchase(params: InitiatePurchaseParams): Promise<InitiatePurchaseResult> {
    const { userId, badgeType, tier, email, metadata } = params;

    try {
      console.log(`[BadgePurchaseService] Initiating purchase for user ${userId}`);

      // Generate unique reference
      const reference = paystackService.generateReference();

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('badge_purchases')
        .insert({
          user_id: userId,
          badge_type: badgeType,
          tier: tier,
          amount_kes: BADGE_PRICE_KES,
          paystack_reference: reference,
          payment_status: 'pending',
          gg_coins_awarded: BADGE_PURCHASE_GG_COIN_REWARD,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('[BadgePurchaseService] Error creating purchase record:', purchaseError);
        return {
          success: false,
          error: 'Failed to create purchase record',
        };
      }

      console.log(`[BadgePurchaseService] Purchase record created:`, purchase.id);

      // Initialize Paystack payment
      try {
        const paystackResponse = await this.initializePaystackPayment({
          email,
          amount: BADGE_PRICE_KES,
          reference,
          metadata: {
            purchase_id: purchase.id,
            badge_type: badgeType,
            tier: tier,
            user_id: userId,
          },
        });

        // Update purchase with Paystack access code
        if (paystackResponse.access_code) {
          await supabase
            .from('badge_purchases')
            .update({ paystack_access_code: paystackResponse.access_code })
            .eq('id', purchase.id);
        }

        return {
          success: true,
          purchase: purchase as BadgePurchase,
          paystack_authorization_url: paystackResponse.authorization_url,
          paystack_access_code: paystackResponse.access_code,
          paystack_reference: reference,
        };
      } catch (paystackError) {
        console.error('[BadgePurchaseService] Paystack initialization error:', paystackError);
        
        // Update purchase status to failed
        await supabase
          .from('badge_purchases')
          .update({ payment_status: 'failed' })
          .eq('id', purchase.id);

        return {
          success: false,
          error: paystackError instanceof Error ? paystackError.message : 'Payment initialization failed',
        };
      }
    } catch (error) {
      console.error('[BadgePurchaseService] Initiate purchase exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate purchase',
      };
    }
  }

  /**
   * Complete a badge purchase after payment verification
   * Called from the frontend after Paystack callback
   */
  async completePurchase(params: CompletePurchaseParams): Promise<CompletePurchaseResult> {
    const { reference, userId } = params;

    try {
      console.log(`[BadgePurchaseService] Completing purchase for reference ${reference}`);

      // Fetch purchase record
      const { data: purchase, error: fetchError } = await supabase
        .from('badge_purchases')
        .select('*')
        .eq('paystack_reference', reference)
        .eq('user_id', userId)
        .single();

      if (fetchError || !purchase) {
        console.error('[BadgePurchaseService] Purchase not found:', fetchError);
        return {
          success: false,
          error: 'Purchase not found',
        };
      }

      // Check if already completed
      if (purchase.payment_status === 'success') {
        console.log('[BadgePurchaseService] Purchase already completed');
        return {
          success: true,
          purchase: purchase as BadgePurchase,
          gg_coins_earned: purchase.gg_coins_awarded,
        };
      }

      // Verify payment with Paystack
      const verificationResult = await paystackService.verifyPayment(reference);

      if (!verificationResult.status || verificationResult.data?.status !== 'success') {
        console.error('[BadgePurchaseService] Payment verification failed');
        
        // Update status to failed
        await supabase
          .from('badge_purchases')
          .update({ payment_status: 'failed' })
          .eq('id', purchase.id);

        return {
          success: false,
          error: 'Payment verification failed',
        };
      }

      console.log('[BadgePurchaseService] Payment verified successfully');

      // Update purchase status
      const { data: updatedPurchase, error: updateError } = await supabase
        .from('badge_purchases')
        .update({
          payment_status: 'success',
          completed_at: new Date().toISOString(),
        })
        .eq('id', purchase.id)
        .select()
        .single();

      if (updateError) {
        console.error('[BadgePurchaseService] Error updating purchase:', updateError);
        return {
          success: false,
          error: 'Failed to update purchase status',
        };
      }

      // Credit GG Coins (will be handled by webhook, but we can try here as backup)
      if (!purchase.gg_coins_credited) {
        const creditResult = await ggCoinService.creditCoins({
          userId: userId,
          amount: BADGE_PURCHASE_GG_COIN_REWARD,
          transactionType: 'purchase_reward',
          referenceType: 'badge_purchase',
          referenceId: purchase.id,
          description: `Earned ${BADGE_PURCHASE_GG_COIN_REWARD} GG Coin for purchasing ${purchase.badge_type} ${purchase.tier} badge`,
          metadata: {
            badge_type: purchase.badge_type,
            tier: purchase.tier,
            amount_kes: purchase.amount_kes,
          },
        });

        if (creditResult.success) {
          await supabase
            .from('badge_purchases')
            .update({ gg_coins_credited: true })
            .eq('id', purchase.id);
        }
      }

      return {
        success: true,
        purchase: updatedPurchase as BadgePurchase,
        gg_coins_earned: BADGE_PURCHASE_GG_COIN_REWARD,
      };
    } catch (error) {
      console.error('[BadgePurchaseService] Complete purchase exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete purchase',
      };
    }
  }

  /**
   * Verify payment and reward GG Coins
   * Called from Paystack webhook for server-side processing
   */
  async verifyAndReward(params: VerifyAndRewardParams): Promise<VerifyAndRewardResult> {
    const { reference, paystackData } = params;

    try {
      console.log(`[BadgePurchaseService] Verifying and rewarding for reference ${reference}`);

      // Fetch purchase record
      const { data: purchase, error: fetchError } = await supabase
        .from('badge_purchases')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (fetchError || !purchase) {
        console.error('[BadgePurchaseService] Purchase not found:', fetchError);
        return {
          success: false,
          error: 'Purchase not found',
        };
      }

      // Check if already processed
      if (purchase.gg_coins_credited) {
        console.log('[BadgePurchaseService] GG Coins already credited');
        return {
          success: true,
          purchase: purchase as BadgePurchase,
          gg_coins_credited: true,
        };
      }

      // Update purchase status
      await supabase
        .from('badge_purchases')
        .update({
          payment_status: 'success',
          completed_at: new Date().toISOString(),
          metadata: {
            ...purchase.metadata,
            paystack_data: paystackData,
          },
        })
        .eq('id', purchase.id);

      // Credit GG Coins
      const creditResult = await ggCoinService.creditCoins({
        userId: purchase.user_id,
        amount: BADGE_PURCHASE_GG_COIN_REWARD,
        transactionType: 'purchase_reward',
        referenceType: 'badge_purchase',
        referenceId: purchase.id,
        description: `Earned ${BADGE_PURCHASE_GG_COIN_REWARD} GG Coin for purchasing ${purchase.badge_type} ${purchase.tier} badge`,
        metadata: {
          badge_type: purchase.badge_type,
          tier: purchase.tier,
          amount_kes: purchase.amount_kes,
          paystack_reference: reference,
        },
      });

      if (!creditResult.success) {
        console.error('[BadgePurchaseService] Failed to credit GG Coins:', creditResult.error);
        return {
          success: false,
          error: creditResult.error,
        };
      }

      // Mark coins as credited
      await supabase
        .from('badge_purchases')
        .update({ gg_coins_credited: true })
        .eq('id', purchase.id);

      console.log(`[BadgePurchaseService] Successfully credited ${BADGE_PURCHASE_GG_COIN_REWARD} GG Coins`);

      return {
        success: true,
        purchase: purchase as BadgePurchase,
        gg_coins_credited: true,
      };
    } catch (error) {
      console.error('[BadgePurchaseService] Verify and reward exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify and reward',
      };
    }
  }

  /**
   * Initialize Paystack payment
   * Calls Supabase Edge Function to create payment
   */
  private async initializePaystackPayment(params: {
    email: string;
    amount: number;
    reference: string;
    metadata: any;
  }): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initialize-paystack-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: params.email,
          amount: paystackService.toKobo(params.amount),
          reference: params.reference,
          metadata: params.metadata,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to initialize payment: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get purchase by reference
   */
  async getPurchaseByReference(reference: string): Promise<BadgePurchase | null> {
    try {
      const { data, error } = await supabase
        .from('badge_purchases')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (error) {
        console.error('[BadgePurchaseService] Error fetching purchase:', error);
        return null;
      }

      return data as BadgePurchase;
    } catch (error) {
      console.error('[BadgePurchaseService] Exception fetching purchase:', error);
      return null;
    }
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchases(userId: string, limit: number = 50): Promise<BadgePurchase[]> {
    try {
      const { data, error } = await supabase
        .from('badge_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[BadgePurchaseService] Error fetching purchases:', error);
        return [];
      }

      return data as BadgePurchase[];
    } catch (error) {
      console.error('[BadgePurchaseService] Exception fetching purchases:', error);
      return [];
    }
  }
}

// Export singleton instance
export const badgePurchaseService = new BadgePurchaseService();
