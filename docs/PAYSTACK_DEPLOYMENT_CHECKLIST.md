# Paystack Integration Deployment Checklist

This checklist guides you through deploying the Paystack payment integration to production.

## Pre-Deployment

### 1. Environment Variables

Ensure all required environment variables are configured:

**Frontend (.env)**
- [ ] `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key
- [ ] `VITE_PAYSTACK_CALLBACK_URL` - Callback URL (https://gg.lochtech.africa)
- [ ] `VITE_USD_TO_KES_RATE` - Exchange rate (e.g., 150.0)
- [ ] `VITE_PAYSTACK_MODE` - Set to `test` for testing, `live` for production

**Backend (Supabase Secrets)**
- [ ] `PAYSTACK_SECRET_KEY` - Paystack secret key
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key for webhook function

### 2. Database Migration

- [ ] Run migration `013_add_paystack_fields.sql`
- [ ] Verify new columns exist in `transactions` table
- [ ] Verify index on `paystack_reference` column

### 3. Code Review

- [ ] Review all Paystack-related code changes
- [ ] Verify error handling is comprehensive
- [ ] Check that secret keys are never exposed to client
- [ ] Ensure all console.logs are appropriate for production

## Deployment Steps

### Step 1: Deploy Edge Functions

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref wobpryllvdjaapzjbsxx

# Deploy functions
supabase functions deploy verify-paystack-payment
supabase functions deploy paystack-webhook

# Set secrets
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

**Verification:**
- [ ] Functions appear in Supabase dashboard
- [ ] Function logs show no errors
- [ ] Test endpoints respond correctly

### Step 2: Configure Paystack Webhook

1. Log into Paystack Dashboard: https://dashboard.paystack.com
2. Navigate to Settings > Webhooks
3. Add webhook configuration:
   - **URL:** `https://wobpryllvdjaapzjbsxx.supabase.co/functions/v1/paystack-webhook`
   - **Events:** `charge.success`, `charge.failed`
4. Save configuration

**Verification:**
- [ ] Webhook URL is correct
- [ ] Events are selected
- [ ] Webhook is active

### Step 3: Deploy Frontend

```bash
# Build frontend
npm run build

# Deploy to Vercel (or your hosting platform)
vercel --prod
```

**Verification:**
- [ ] Frontend deployed successfully
- [ ] Environment variables set in hosting platform
- [ ] Test mode banner displays (if in test mode)

### Step 4: Test in Test Mode

**Set test mode:**
```bash
VITE_PAYSTACK_MODE=test
```

**Test scenarios:**
- [ ] Payment modal opens
- [ ] Test card payment succeeds (4084 0840 8408 4081)
- [ ] Transaction status updates to 'completed'
- [ ] Webhook event received and processed
- [ ] Failed payment restores credits
- [ ] Currency conversion displays correctly
- [ ] Error messages display properly

### Step 5: Switch to Live Mode

**Update environment variables:**
```bash
VITE_PAYSTACK_MODE=live
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
```

**Verification:**
- [ ] Test mode banner no longer displays
- [ ] Live API keys are configured
- [ ] Callback URL is correct

### Step 6: Production Testing

**Test with small transaction:**
- [ ] Make a small real payment (e.g., 1 ton)
- [ ] Verify payment completes successfully
- [ ] Check transaction record in database
- [ ] Verify webhook received
- [ ] Confirm receipt generated

**Test all payment methods:**
- [ ] Credit card payment
- [ ] Debit card payment
- [ ] Bank transfer
- [ ] Mobile money (M-Pesa)

### Step 7: Monitoring Setup

- [ ] Configure error alerts in Supabase
- [ ] Set up payment failure alerts
- [ ] Create dashboard for transaction monitoring
- [ ] Enable logging for payment analytics

## Post-Deployment

### Immediate Checks (First 24 Hours)

- [ ] Monitor first 10 transactions
- [ ] Check webhook delivery rate
- [ ] Review error logs
- [ ] Verify payment success rate
- [ ] Check currency conversion accuracy

### Week 1 Checks

- [ ] Review payment success rate (target: >95%)
- [ ] Check average payment time
- [ ] Monitor verification failures
- [ ] Review customer feedback
- [ ] Check for any edge cases

### Ongoing Monitoring

- [ ] Daily: Check payment success rate
- [ ] Daily: Review error logs
- [ ] Weekly: Analyze payment patterns
- [ ] Weekly: Review webhook delivery
- [ ] Monthly: Update exchange rate if needed

## Rollback Plan

If issues occur, follow this rollback procedure:

### 1. Immediate Actions

- [ ] Switch back to test mode
- [ ] Disable payment functionality
- [ ] Display maintenance message

### 2. Investigate

- [ ] Check Edge Function logs
- [ ] Review recent transactions
- [ ] Identify root cause

### 3. Fix and Redeploy

- [ ] Fix identified issues
- [ ] Test in staging environment
- [ ] Redeploy to production
- [ ] Re-enable payment functionality

## Troubleshooting

### Payment Modal Not Opening

**Check:**
- Paystack SDK loaded: `console.log(window.PaystackPop)`
- Public key is correct
- User email is provided
- Browser console for errors

**Fix:**
- Verify `VITE_PAYSTACK_PUBLIC_KEY` is set
- Check network connectivity
- Clear browser cache

### Verification Failing

**Check:**
- Edge Function logs
- Secret key configuration
- Payment reference exists in Paystack

**Fix:**
- Verify `PAYSTACK_SECRET_KEY` in Supabase secrets
- Check Edge Function deployment
- Test with curl

### Webhook Not Received

**Check:**
- Webhook URL in Paystack dashboard
- Edge Function deployment
- Webhook signature verification

**Fix:**
- Update webhook URL if incorrect
- Redeploy webhook function
- Test webhook manually

## Support Contacts

- **Paystack Support:** support@paystack.com
- **Supabase Support:** https://supabase.com/support
- **Platform Team:** [Your team contact]

## Documentation References

- [Paystack Integration Guide](./PAYSTACK_INTEGRATION.md)
- [Edge Functions README](../supabase/functions/README.md)
- [Paystack API Docs](https://paystack.com/docs/api/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Sign-Off

- [ ] Development Team Lead
- [ ] QA Team Lead
- [ ] DevOps Engineer
- [ ] Product Manager

**Deployment Date:** _______________

**Deployed By:** _______________

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
