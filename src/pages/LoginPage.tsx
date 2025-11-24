import { useNavigate } from 'react-router-dom';
import { LoginForm, PasswordResetRequest, AuthOptions, Web3Login } from '../components/auth';
import { useState } from 'react';
import { authService } from '../services/auth.service';

type AuthView = 'options' | 'email' | 'web3' | 'reset';

export function LoginPage() {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState<AuthView>('options');
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleResetSuccess = () => {
    setAuthView('email');
  };

  const handleGoogleAuth = async () => {
    setOauthError(null);
    const { error } = await authService.signInWithGoogle();

    if (error) {
      console.error('Google sign-in error:', error);
      setOauthError(error.message);
    }
    // If successful, user will be redirected to Google
    // and then back to /auth/callback
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {authView === 'options' && (
          <>
            {oauthError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{oauthError}</p>
              </div>
            )}
            <AuthOptions
              onEmailAuth={() => setAuthView('email')}
              onWeb3Auth={() => setAuthView('web3')}
              onGoogleAuth={handleGoogleAuth}
            />
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign up
                </button>
              </p>
              <p className="text-gray-600 mt-2">
                <button
                  onClick={() => navigate('/')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  ← Back to Home
                </button>
              </p>
            </div>
          </>
        )}

        {authView === 'email' && (
          <>
            <LoginForm
              onSuccess={handleLoginSuccess}
              onForgotPassword={() => setAuthView('reset')}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthView('options')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                ← Back to options
              </button>
            </div>
          </>
        )}

        {authView === 'web3' && (
          <>
            <Web3Login
              onSuccess={handleLoginSuccess}
              onBack={() => setAuthView('options')}
            />
          </>
        )}

        {authView === 'reset' && (
          <PasswordResetRequest
            onSuccess={handleResetSuccess}
            onCancel={() => setAuthView('email')}
          />
        )}
      </div>
    </div>
  );
}
