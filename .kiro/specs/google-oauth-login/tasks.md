# Implementation Plan: Google OAuth Login

- [x] 1. Add Google OAuth method to Auth Service



  - Add `signInWithGoogle()` method to `authService` class
  - Implement OAuth flow using Supabase's `signInWithOAuth` method
  - Configure redirect URL and OAuth options
  - Add error handling for OAuth failures
  - _Requirements: 1.2, 4.1, 4.5_

- [ ]* 1.1 Write unit tests for signInWithGoogle method
  - Test successful OAuth initiation
  - Test error handling scenarios
  - Test redirect URL configuration
  - _Requirements: 1.2, 1.4_

- [x] 2. Create OAuth callback handler page


  - Create `AuthCallbackPage.tsx` component in `src/pages/`
  - Implement session check after OAuth redirect
  - Handle successful authentication with dashboard redirect
  - Handle authentication errors with appropriate messaging
  - Add loading state during callback processing
  - _Requirements: 1.3, 1.4, 3.3_

- [ ]* 2.1 Write unit tests for AuthCallbackPage
  - Test successful authentication flow
  - Test error handling
  - Test redirect behavior
  - _Requirements: 1.3, 1.4_

- [x] 3. Add Google sign-in button to AuthOptions component


  - Add `onGoogleAuth` prop to `AuthOptionsProps` interface
  - Create Google sign-in button with Google logo SVG
  - Style button following Google brand guidelines
  - Add hover and disabled states
  - Position button alongside existing auth methods
  - _Requirements: 1.1, 5.1, 5.3, 5.5_

- [ ]* 3.1 Write unit tests for AuthOptions with Google button
  - Test Google button renders correctly
  - Test button click triggers onGoogleAuth callback
  - Test button styling and states
  - _Requirements: 1.1, 1.2_

- [x] 4. Integrate Google OAuth into Login Page


  - Add `handleGoogleAuth` function to LoginPage
  - Pass Google auth handler to AuthOptions component
  - Add error state management for OAuth errors
  - Display OAuth error messages to users
  - _Requirements: 1.2, 1.4_

- [ ]* 4.1 Write integration tests for login flow
  - Test complete Google OAuth flow
  - Test error scenarios
  - Test navigation after authentication
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 5. Add OAuth callback route to application router


  - Add `/auth/callback` route in `App.tsx`
  - Map route to `AuthCallbackPage` component
  - Ensure route is accessible without authentication
  - _Requirements: 1.3_

- [x] 6. Implement profile creation for new Google users


  - Add `ensureUserProfile()` helper function to auth service
  - Extract user metadata from Google OAuth response
  - Check if user profile exists in database
  - Create profile with Google data if new user
  - Handle profile creation errors gracefully
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4_

- [ ]* 6.1 Write property test for profile data extraction
  - **Property 1: Profile data extraction completeness**
  - **Validates: Requirements 2.1, 2.2, 2.3**
  - Generate random Google OAuth responses with various field combinations
  - Verify all available fields are correctly extracted
  - Verify missing optional fields don't cause errors

- [ ]* 6.2 Write unit tests for profile creation
  - Test profile creation for new users
  - Test profile retrieval for existing users
  - Test error handling for database failures
  - _Requirements: 1.5, 2.4, 2.5_

- [x] 7. Update Auth Context to handle OAuth sessions


  - Ensure `onAuthStateChange` handles OAuth sessions
  - Verify session persistence after OAuth authentication
  - Test session refresh for OAuth users
  - _Requirements: 3.1, 3.2_

- [ ]* 7.1 Write property test for session retrieval consistency
  - **Property 3: Session retrieval consistency**
  - **Validates: Requirements 3.2**
  - Generate random authenticated sessions
  - Call getCurrentUser() multiple times
  - Verify returned data is identical across calls

- [x] 8. Implement error logging with sensitive data filtering


  - Add error logging utility function
  - Filter sensitive data from error messages (tokens, passwords, PII)
  - Log detailed errors for debugging
  - Ensure user-facing errors are safe and actionable
  - _Requirements: 4.4_

- [ ]* 8.1 Write property test for error logging safety
  - **Property 2: Error logging safety**
  - **Validates: Requirements 4.4**
  - Generate random error objects with sensitive data
  - Verify logged messages don't contain tokens, passwords, or PII
  - Verify error messages remain useful for debugging

- [ ]* 8.2 Write property test for OAuth callback validation
  - **Property 4: OAuth callback state validation**
  - **Validates: Requirements 4.2**
  - Generate random OAuth callback payloads (valid and invalid)
  - Verify validation correctly identifies valid vs invalid states
  - Verify invalid states are rejected appropriately

- [x] 9. Add Google logo SVG asset


  - Create or import Google logo SVG
  - Add to assets directory or inline in component
  - Ensure logo meets Google brand guidelines
  - Optimize SVG for performance
  - _Requirements: 5.1_

- [x] 10. Update registration flow to support Google OAuth


  - Ensure RegisterPage can handle OAuth redirects
  - Add Google sign-in option to registration
  - Handle new user onboarding for Google users
  - _Requirements: 1.5, 2.5_

- [x] 11. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Manual testing and verification
  - Test Google sign-in as new user
  - Test Google sign-in as returning user
  - Test cancelling Google consent screen
  - Test error scenarios (network offline, invalid config)
  - Verify profile data is correctly populated
  - Test on multiple browsers
  - _Requirements: All_
