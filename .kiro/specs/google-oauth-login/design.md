# Design Document: Google OAuth Login

## Overview

This design document outlines the implementation of Google OAuth authentication for the #GangGreen platform. The feature integrates with Supabase's OAuth provider system to enable users to sign in using their Google accounts. The implementation focuses on minimal code changes by leveraging Supabase's built-in OAuth handling while ensuring a seamless user experience.

## Architecture

### High-Level Flow

```
User clicks "Sign in with Google"
    ↓
Frontend calls authService.signInWithGoogle()
    ↓
Supabase redirects to Google OAuth consent screen
    ↓
User authorizes the application
    ↓
Google redirects back to application with auth code
    ↓
Supabase exchanges code for tokens and creates/updates user
    ↓
Application receives authenticated session
    ↓
Frontend redirects to dashboard
```

### Component Integration

The Google OAuth feature integrates with existing authentication components:

1. **AuthOptions Component**: Add Google sign-in button
2. **Auth Service**: Add `signInWithGoogle()` method
3. **Auth Context**: Handle OAuth callback and session management
4. **Login Page**: Support OAuth redirect handling

## Components and Interfaces

### 1. Auth Service Extension

Add a new method to `authService` for Google OAuth:

```typescript
/**
 * Sign in with Google OAuth
 * Uses Supabase's built-in OAuth provider
 */
async signInWithGoogle(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    return { error };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Google sign-in failed'),
    };
  }
}
```

### 2. AuthOptions Component Update

Add Google sign-in button to the authentication options:

```typescript
interface AuthOptionsProps {
  onEmailAuth: () => void;
  onWeb3Auth: () => void;
  onGoogleAuth: () => void; // New prop
}

export function AuthOptions({ onEmailAuth, onWeb3Auth, onGoogleAuth }: AuthOptionsProps) {
  // ... existing code ...
  
  {/* Google OAuth Button */}
  <button
    onClick={onGoogleAuth}
    className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all group"
  >
    {/* Google logo SVG */}
    <div className="text-left">
      <div className="font-semibold text-gray-900">Continue with Google</div>
      <div className="text-sm text-gray-600">Quick and secure</div>
    </div>
  </button>
}
```

### 3. OAuth Callback Handler

Create a new page component to handle OAuth callbacks:

```typescript
// src/pages/AuthCallbackPage.tsx
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase automatically handles the OAuth callback
    // We just need to check the session and redirect
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (session) {
        // Successful authentication, redirect to dashboard
        navigate('/dashboard');
      } else {
        // No session, redirect to login
        navigate('/login');
      }
    };
    
    handleCallback();
  }, [navigate]);

  // Show loading or error state
}
```

### 4. Login Page Integration

Update the LoginPage to handle Google OAuth:

```typescript
const handleGoogleAuth = async () => {
  const { error } = await authService.signInWithGoogle();
  
  if (error) {
    // Show error message
    console.error('Google sign-in error:', error);
  }
  // If successful, user will be redirected to Google
  // and then back to /auth/callback
};

// Pass to AuthOptions
<AuthOptions
  onEmailAuth={() => setAuthView('email')}
  onWeb3Auth={() => setAuthView('web3')}
  onGoogleAuth={handleGoogleAuth}
/>
```

## Data Models

### User Profile from Google OAuth

When a user signs in with Google for the first time, Supabase automatically creates a user record. We need to extract and store additional profile information:

```typescript
interface GoogleUserMetadata {
  email: string;
  email_verified: boolean;
  full_name?: string;
  avatar_url?: string;
  provider: 'google';
  sub: string; // Google user ID
}
```

### Profile Creation Logic

After successful OAuth authentication, check if user profile exists and create if needed. **Critical**: The database has a custom `users` table separate from Supabase's `auth.users`. A database trigger (`handle_new_user()`) automatically creates records in the `users` table when OAuth users are created in `auth.users`, so we only need to create the profile:

```typescript
async function ensureUserProfile(userId: string, metadata: GoogleUserMetadata): Promise<void> {
  // Check if profile exists in user_profiles table
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  
  if (!existingProfile) {
    // The users table record is automatically created by database trigger
    // We only need to create the profile with Google data
    await supabase.from('user_profiles').insert({
      id: userId,
      full_name: metadata.full_name || metadata.email.split('@')[0],
      avatar_url: metadata.avatar_url,
    });
  }
}
```

**Note**: The `handle_new_user()` database trigger (migration 011) automatically creates the `users` table record when a new user signs up via OAuth. This approach:
- Bypasses RLS policy issues during OAuth signup
- Uses `SECURITY DEFINER` to execute with elevated privileges
- Extracts role and forest_preference from user metadata
- Handles conflicts gracefully with `ON CONFLICT DO NOTHING`

## Corr
ectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After reviewing the acceptance criteria, most of the testable requirements are specific examples or UI behaviors rather than universal properties. However, we can identify a few key properties:

**Property 1: Profile data extraction completeness**
*For any* Google OAuth response containing user metadata, all available fields (email, full_name, avatar_url) should be correctly extracted and mapped to the corresponding profile fields.
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 5: Database trigger creates user records**
*For any* new Google OAuth user, the database trigger must automatically create a record in the `users` table before the application creates a record in the `user_profiles` table to satisfy the foreign key constraint.
**Validates: Requirements 2.4, 2.5**

**Property 2: Error logging safety**
*For any* authentication error that occurs during OAuth flow, the logged error message should not contain sensitive information (tokens, passwords, or personal identifiable information).
**Validates: Requirements 4.4**

**Property 3: Session retrieval consistency**
*For any* authenticated Google user with a valid session, calling getCurrentUser() should return the same user data regardless of how many times it's called within the session.
**Validates: Requirements 3.2**

**Property 4: OAuth callback state validation**
*For any* OAuth callback received, the authentication state should be validated before processing the session.
**Validates: Requirements 4.2**

## Error Handling

### OAuth Flow Errors

1. **User Cancellation**: User closes Google consent screen
   - Display: "Sign-in cancelled. Please try again."
   - Action: Return to login page, allow retry

2. **Network Errors**: Connection issues during OAuth flow
   - Display: "Network error. Please check your connection and try again."
   - Action: Log error, allow retry

3. **Invalid Configuration**: Missing or incorrect OAuth credentials
   - Display: "Authentication service unavailable. Please contact support."
   - Action: Log detailed error for debugging

4. **Profile Creation Failure**: Database error when creating user profile
   - Display: "Account created but profile setup failed. Please complete your profile."
   - Action: Log error, allow user to access dashboard and complete profile later

### Error Recovery

- All OAuth errors should be non-blocking where possible
- Users should always have the option to retry authentication
- Detailed errors logged server-side for debugging
- User-facing errors should be clear and actionable

## Testing Strategy

### Unit Tests

1. **Auth Service Tests**
   - Test `signInWithGoogle()` method calls Supabase correctly
   - Test error handling for various OAuth failure scenarios
   - Test profile data extraction from Google metadata
   - Test profile creation logic

2. **Component Tests**
   - Test AuthOptions renders Google button
   - Test Google button click triggers correct handler
   - Test AuthCallbackPage handles successful authentication
   - Test AuthCallbackPage handles authentication errors
   - Test error message display

3. **Integration Tests**
   - Test complete OAuth flow with mocked Supabase responses
   - Test new user profile creation
   - Test returning user authentication
   - Test account linking for existing email

### Property-Based Tests

Property-based testing will be used to verify the universal properties identified above:

1. **Property Test: Profile Data Extraction**
   - Generate random Google OAuth responses with various combinations of fields
   - Verify all present fields are correctly extracted
   - Verify missing optional fields don't cause errors

2. **Property Test: Error Logging Safety**
   - Generate random error objects with various sensitive data
   - Verify logged messages don't contain tokens, passwords, or PII
   - Verify error messages are still useful for debugging

3. **Property Test: Session Retrieval Consistency**
   - Generate random authenticated sessions
   - Call getCurrentUser() multiple times
   - Verify returned data is identical across calls

4. **Property Test: OAuth Callback Validation**
   - Generate random OAuth callback payloads (valid and invalid)
   - Verify validation correctly identifies valid vs invalid states
   - Verify invalid states are rejected appropriately

### Testing Framework

- **Unit/Integration Tests**: Vitest with React Testing Library
- **Property-Based Tests**: fast-check library for TypeScript
- **Mocking**: Mock Supabase client for isolated testing
- **Coverage Target**: 80% code coverage for new code

### Manual Testing Checklist

1. Sign in with Google as new user
2. Sign in with Google as returning user
3. Cancel Google consent screen
4. Sign in with Google when already logged in with email
5. Test on different browsers (Chrome, Firefox, Safari)
6. Test error scenarios (network offline, invalid config)

## Security Considerations

### OAuth Security

1. **State Parameter**: Supabase automatically handles CSRF protection via state parameter
2. **Token Storage**: OAuth tokens stored securely by Supabase, never exposed to client
3. **Redirect URI Validation**: Only configured redirect URIs accepted
4. **HTTPS Required**: OAuth flow requires HTTPS in production

### Data Privacy

1. **Minimal Scope**: Request only necessary Google permissions (email, profile)
2. **User Consent**: Users explicitly consent to data sharing via Google consent screen
3. **Data Retention**: Store only necessary profile information
4. **Account Linking**: Respect existing accounts when linking OAuth providers

## Performance Considerations

### OAuth Flow Performance

- OAuth redirect adds ~2-3 seconds to authentication flow
- Acceptable trade-off for improved user experience
- No impact on application performance after authentication

### Caching

- User profile data cached after first fetch (existing behavior)
- OAuth tokens managed by Supabase with automatic refresh
- No additional caching needed for OAuth-specific data

## Deployment Considerations

### Environment Configuration

Required environment variables (already configured):
```
VITE_SUPABASE_URL=https://wobpryllvdjaapzjbsxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
```

### Supabase Configuration

Google OAuth provider must be configured in Supabase dashboard:
- ✅ Provider enabled (already done)
- ✅ Client ID and Secret configured
- ✅ Redirect URLs configured
- ✅ Authorized domains configured

### Route Configuration

Add OAuth callback route to application router:
```typescript
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

### Production Checklist

1. Verify Google OAuth credentials in Supabase production project
2. Ensure redirect URLs include production domain
3. Test OAuth flow in production environment
4. Monitor error logs for OAuth-related issues
5. Verify HTTPS is enforced for all OAuth endpoints

## Future Enhancements

1. **Additional OAuth Providers**: GitHub, Microsoft, Apple
2. **Account Management**: UI for linking/unlinking OAuth providers
3. **Profile Sync**: Periodic sync of profile data from OAuth providers
4. **OAuth Scopes**: Request additional permissions for enhanced features
5. **Social Features**: Import contacts or share to social media

## References

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Brand Guidelines](https://developers.google.com/identity/branding-guidelines)
