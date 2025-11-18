/**
 * Supabase Edge Function: Paystack Webhook Handler
 * 
 * This function receives and processes webhook events from Paystack.
 * It verifies the webhook signature and updates transaction statuses accordingly.
 * 
 * Supported events:
 * - charge.success: Payment completed successfully
 * - charge.failed: Payment failed
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface WebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      credit_id?: string;
      quantity_tons?: number;
      buyer_id?: string;
      transaction_id?: string;
      purchase_id?: string;
      badge_type?: string;
      tier?: string;
      user_id?: string;
    };
    customer: {
      id: number;
      email: string;
    };
  };
}

/**
 * Verify webhook signature
 */
function verifySignature(body: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY not configured');
    return false;
  }

  const hash = createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');

  return hash === signature;
}

/**
 * Handle badge purchase payment
 */
async function handleBadgePurchasePayment(
  supabase: any,
  event: WebhookEvent
): Promise<void> {
  const { reference, id, paid_at } = event.data;

  console.log(`Processing badge purchase for reference: ${reference}`);

  // Find badge purchase by Paystack reference
  const { data: purchase, error: fetchError } = await supabase
    .from('badge_purchases')
    .select('*')
    .eq('paystack_reference', reference)
    .single();

  if (fetchError || !purchase) {
    console.error('Badge purchase not found:', fetchError);
    throw new Error(`Badge purchase not found for reference: ${reference}`);
  }

  // Check if already processed
  if (purchase.gg_coins_credited) {
    console.log(`Badge purchase ${purchase.id} already processed`);
    return;
  }

  // Update purchase status
  const { error: updateError } = await supabase
    .from('badge_purchases')
    .update({
      payment_status: 'success',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        ...purchase.metadata,
        paystack_transaction_id: id.toString(),
        paystack_paid_at: paid_at,
      },
    })
    .eq('id', purchase.id);

  if (updateError) {
    console.error('Failed to update badge purchase:', updateError);
    throw updateError;
  }

  // Credit GG Coins using database function
  const { data: creditResult, error: creditError } = await supabase.rpc('credit_gg_coins', {
    p_user_id: purchase.user_id,
    p_amount: purchase.gg_coins_awarded,
    p_transaction_type: 'purchase_reward',
    p_reference_type: 'badge_purchase',
    p_reference_id: purchase.id,
    p_description: `Earned ${purchase.gg_coins_awarded} GG Coin for purchasing ${purchase.badge_type} ${purchase.tier} badge`,
    p_metadata: {
      badge_type: purchase.badge_type,
      tier: purchase.tier,
      amount_kes: purchase.amount_kes,
      paystack_reference: reference,
    },
  });

  if (creditError || !creditResult?.success) {
    console.error('Failed to credit GG Coins:', creditError || creditResult?.error);
    // Don't throw - we'll retry later
    return;
  }

  // Mark coins as credited
  const { error: markError } = await supabase
    .from('badge_purchases')
    .update({ gg_coins_credited: true })
    .eq('id', purchase.id);

  if (markError) {
    console.error('Failed to mark coins as credited:', markError);
  }

  // Create notification
  const { error: notifError } = await supabase.from('notifications').insert({
    user_id: purchase.user_id,
    type: 'badge_purchase',
    title: 'Badge Purchase Successful! 🎉',
    message: `You earned ${purchase.gg_coins_awarded} GG Coin for purchasing a ${purchase.tier} tier badge.`,
    metadata: {
      purchase_id: purchase.id,
      badge_type: purchase.badge_type,
      tier: purchase.tier,
      gg_coins_earned: purchase.gg_coins_awarded,
      paystack_reference: reference,
    },
    read: false,
    created_at: new Date().toISOString(),
  });

  if (notifError) {
    console.error('Failed to create notification:', notifError);
  }

  console.log(`Badge purchase ${purchase.id} processed successfully. Credited ${purchase.gg_coins_awarded} GG Coins.`);
}

/**
 * Handle successful payment webhook
 */
async function handleSuccessfulPayment(
  supabase: any,
  event: WebhookEvent
): Promise<void> {
  const { reference, id, paid_at, status } = event.data;

  console.log(`Processing charge.success for reference: ${reference}`);

  // Check if this is a badge purchase (reference starts with 'GG-')
  if (reference.startsWith('GG-')) {
    await handleBadgePurchasePayment(supabase, event);
    return;
  }

  // Find transaction by Paystack reference (carbon credit transaction)
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('paystack_reference', reference)
    .single();

  if (fetchError || !transaction) {
    console.error('Transaction not found:', fetchError);
    throw new Error(`Transaction not found for reference: ${reference}`);
  }

  // Update transaction to completed
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      payment_status: 'completed',
      paystack_transaction_id: id.toString(),
      paystack_paid_at: paid_at,
      receipt_url: `receipt_${transaction.id}.pdf`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transaction.id);

  if (updateError) {
    console.error('Failed to update transaction:', updateError);
    throw updateError;
  }

  console.log(`Transaction ${transaction.id} marked as completed`);
}

/**
 * Handle failed badge purchase payment
 */
async function handleFailedBadgePurchase(
  supabase: any,
  event: WebhookEvent
): Promise<void> {
  const { reference } = event.data;

  console.log(`Processing failed badge purchase for reference: ${reference}`);

  // Find badge purchase by Paystack reference
  const { data: purchase, error: fetchError } = await supabase
    .from('badge_purchases')
    .select('*')
    .eq('paystack_reference', reference)
    .single();

  if (fetchError || !purchase) {
    console.error('Badge purchase not found:', fetchError);
    return;
  }

  // Update purchase status to failed
  const { error: updateError } = await supabase
    .from('badge_purchases')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchase.id);

  if (updateError) {
    console.error('Failed to update badge purchase:', updateError);
  }

  console.log(`Badge purchase ${purchase.id} marked as failed`);
}

/**
 * Handle failed payment webhook
 */
async function handleFailedPayment(
  supabase: any,
  event: WebhookEvent
): Promise<void> {
  const { reference } = event.data;

  console.log(`Processing charge.failed for reference: ${reference}`);

  // Check if this is a badge purchase (reference starts with 'GG-')
  if (reference.startsWith('GG-')) {
    await handleFailedBadgePurchase(supabase, event);
    return;
  }

  // Find transaction by Paystack reference (carbon credit transaction)
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('paystack_reference', reference)
    .single();

  if (fetchError || !transaction) {
    console.error('Transaction not found:', fetchError);
    throw new Error(`Transaction not found for reference: ${reference}`);
  }

  // Update transaction to failed
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', transaction.id);

  if (updateError) {
    console.error('Failed to update transaction:', updateError);
    throw updateError;
  }

  // Restore carbon credit quantity
  const { data: credit, error: creditError } = await supabase
    .from('carbon_credits')
    .select('available_quantity')
    .eq('id', transaction.credit_id)
    .single();

  if (!creditError && credit) {
    const { error: restoreError } = await supabase
      .from('carbon_credits')
      .update({
        available_quantity: credit.available_quantity + transaction.quantity_tons,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.credit_id);

    if (restoreError) {
      console.error('Failed to restore credit quantity:', restoreError);
    } else {
      console.log(`Restored ${transaction.quantity_tons} tons to credit ${transaction.credit_id}`);
    }
  }

  console.log(`Transaction ${transaction.id} marked as failed`);
}

/**
 * Log webhook event for audit purposes
 */
async function logWebhookEvent(
  supabase: any,
  event: WebhookEvent,
  status: 'success' | 'failed'
): Promise<void> {
  try {
    // Create a webhook_logs table if it doesn't exist
    // For now, just log to console
    console.log('Webhook event logged:', {
      event: event.event,
      reference: event.data.reference,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

serve(async (req) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get webhook signature from header
    const signature = req.headers.get('x-paystack-signature');
    if (!signature) {
      console.error('Missing webhook signature');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Read request body
    const body = await req.text();

    // Verify signature
    if (!verifySignature(body, signature)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse event
    const event: WebhookEvent = JSON.parse(body);
    console.log('Received webhook event:', event.event);

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle event based on type
    if (event.event === 'charge.success') {
      await handleSuccessfulPayment(supabase, event);
      await logWebhookEvent(supabase, event, 'success');
    } else if (event.event === 'charge.failed') {
      await handleFailedPayment(supabase, event);
      await logWebhookEvent(supabase, event, 'failed');
    } else {
      console.log(`Unhandled event type: ${event.event}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({ message: 'Webhook processed successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
