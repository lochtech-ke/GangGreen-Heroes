# Google OAuth Setup Guide

## Overview
This guide walks through configuring Google OAuth for the #GangGreen platform.

## Prerequisites
- Supabase project: `wobpryllvdjaapzjbsxx`
- Google Cloud Console access
- Local development running on `http://localhost:5173`
- Production URL: `https://gg.lochtech.africa`

## Step 1: Configure Supabase

### 1.1 Add Redirect URLs
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/wobpryllvdjaapzjbsxx/auth/url-configuration
2. Under "Redirect URLs", add:
   ```
   http://localhost:5173/auth/callback
   https://gg.lochtech.africa/auth/callback
   ```
3. Click "Save"

### 1.2 Enable Google Provider
1. Go to: https://supabase.com/dashboard/project/wobpryllvdjaapzjbsxx/auth/providers
2. Find "Google" in the list
3. Enable it
4. You'll need Google OAuth credentials (see Step 2)

## Step 2: Configure Google Cloud Console

### 2.1 Create OAuth Credentials (if not already created)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "GangGreen Platform"

### 2.2 Configure Authorized Redirect URIs
Add these URIs (this is critical!):
```
https://wobpryllvdjaapzjbsxx.supabase.co/auth/v1/callback
```

For local testing, you can also add:
```
http://localhost:5173/auth/callback
```

### 2.3 Get Client ID and Secret
1. After creating, copy the "Client ID" and "Client Secret"
2. Keep these secure!

## Step 3: Add Google Credentials to Supabase

1. Go back to Supabase: https://supabase.com/dashboard/project/wobpryllvdjaapzjbsxx/auth/providers
2. Find Google provider
3. Paste your Google Client ID
4. Paste your Google Client Secret
5. Click "Save"

## Step 4: Test the Integration

### 4.1 Local Testing
1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/login`
3. Click "Continue with Google"
4. You should be redirected to Google's consent screen
5. After authorizing, you should be redirected back to your app at `/auth/callback`
6. The app should create your profile and redirect to `/dashboard`

### 4.2 Check Console Logs
Open browser DevTools and look for these logs:
```
[AuthService] Initiating Google OAuth sign-in...
[AuthCallbackPage] Processing OAuth callback...
[AuthCallbackPage] Full URL: http://localhost:5173/auth/callback?code=...
[AuthCallbackPage] OAuth tokens present: {hasCode: true}
[AuthCallbackPage] Exchanging authorization code for session...
[AuthCallbackPage] Code exchange successful: true
[AuthCallbackPage] Session found, user authenticated
[AuthService] Checking user profile for OAuth user: ...
[AuthService] Creating profile for OAuth user
[AuthCallbackPage] Redirecting to dashboard
```

## Troubleshooting

### Issue: "No session found, redirecting to login"
**Cause**: OAuth callback URL mismatch
**Solution**: 
- Verify the redirect URI in Google Console matches exactly: `https://wobpryllvdjaapzjbsxx.supabase.co/auth/v1/callback`
- Check Supabase redirect URLs include your app's callback URL

### Issue: "redirect_uri_mismatch" error from Google
**Cause**: The redirect URI in the request doesn't match what's configured in Google Console
**Solution**:
- Add `https://wobpryllvdjaapzjbsxx.supabase.co/auth/v1/callback` to Google Console
- Make sure there are no trailing slashes or typos

### Issue: 403 error when creating user profile
**Cause**: Database trigger not working or RLS policies blocking insert
**Solution**:
- Check that migration `011_fix_user_registration.sql` has been applied
- Verify the `handle_new_user()` trigger exists on `auth.users` table
- The trigger should automatically create records in the `users` table

### Issue: "OAuth tokens present: {hasAccessToken: false, hasCode: false}"
**Cause**: Not being redirected back from Google properly
**Solution**:
- Check browser network tab for the redirect from Google
- Verify Google OAuth is enabled in Supabase
- Check that Client ID and Secret are correct in Supabase

## OAuth Flow Diagram

```
User clicks "Sign in with Google"
    ↓
App calls supabase.auth.signInWithOAuth()
    ↓
Supabase redirects to Google OAuth consent screen
    ↓
User authorizes the application
    ↓
Google redirects to: https://wobpryllvdjaapzjbsxx.supabase.co/auth/v1/callback?code=...
    ↓
Supabase exchanges code for tokens
    ↓
Supabase redirects to: http://localhost:5173/auth/callback#access_token=...
    ↓
App's AuthCallbackPage processes the callback
    ↓
App calls ensureUserProfile() to create profile
    ↓
App redirects to /dashboard
```

## Security Notes

1. **Never commit credentials**: Keep Client ID and Secret secure
2. **Use HTTPS in production**: OAuth requires HTTPS for security
3. **Validate redirect URIs**: Only add trusted domains
4. **Token storage**: Supabase handles token storage securely
5. **PKCE flow**: Supabase uses PKCE for additional security

## Production Deployment

Before deploying to production:

1. Update Google Console redirect URIs to include production URL:
   ```
   https://gg.lochtech.africa/auth/callback
   ```

2. Update Supabase redirect URLs to include production URL

3. Test the full OAuth flow in production environment

4. Monitor error logs for any OAuth-related issues

## References

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 PKCE Flow](https://oauth.net/2/pkce/)
